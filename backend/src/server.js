import 'dotenv/config';
import http from 'node:http';
import { randomUUID, randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import {
  User, Session, VerificationCode, Skill, Request, Pioneer,
  Follow, Conversation, Message,
} from './models.js';
import { seed, WELCOME_FROM, WELCOME_TEXT } from './seed.js';
import { checkRateLimit, getClientIp } from './rate-limit.js';

// ============================================================
// Optional email (nodemailer). If SMTP isn't configured, the
// server runs in DEV mode: verification codes are logged to the
// console AND returned in the API response so registration works
// with zero external setup.
// ============================================================
let transporter = null;
const SMTP_READY = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
if (SMTP_READY) {
  const { default: nodemailer } = await import('nodemailer');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  console.log('Email: Gmail SMTP enabled');
} else {
  console.log('Email: DEV mode (codes logged to console / returned in response)');
}

const DEV_MODE = !SMTP_READY;
const SESSION_TTL_DAYS = 30;

// CORS — in production, restrict to your frontend domain.
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Trust reverse-proxy headers (set to 'true' when behind Nginx).
const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

// Rate-limit windows
const RL_SEND_CODE = { max: 5, windowMs: 60_000 };    // 5/min  per IP
const RL_REGISTER  = { max: 10, windowMs: 60_000 };   // 10/min per IP
const RL_LOGIN     = { max: 20, windowMs: 60_000 };   // 20/min per IP

// ============================================================
// Helpers
// ============================================================
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    ...(CORS_ORIGIN !== '*' ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const generateCode = () => String(randomInt(100000, 999999));
const futureDate = (ms) => new Date(Date.now() + ms);

function publicUser(row) {
  if (!row) return null;
  return {
    id: row._id.toString(),
    email: row.email,
    name: row.name || row.email.split('@')[0],
    avatar: row.avatar || '🧑‍🚀',
    headline: row.headline || '',
    bio: row.bio || '',
    isDemo: !!row.is_demo,
  };
}

// Map a DB skill row to the frontend's shape (category/desc).
function skillOut(row) {
  return {
    id: row._id,
    title: row.title,
    desc: row.descr,
    category: row.category,
    downloads: row.downloads,
    slug: row.slug,
    status: row.status,
    author: row.author_email,
    isHot: !!row.is_hot,
  };
}

// ------------------------------------------------------------
// Sessions
// ------------------------------------------------------------
async function createSession(userId) {
  const token = `cc_${randomUUID().replace(/-/g, '')}`;
  await Session.create({
    token,
    user_id: userId,
    expires_at: futureDate(SESSION_TTL_DAYS * 86400000),
  });
  return token;
}

async function userFromAuth(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const session = await Session.findOne({ token });
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    await Session.deleteOne({ token });
    return null;
  }
  const user = await User.findById(session.user_id);
  return user ? { user, token } : null;
}

// ------------------------------------------------------------
// Social helpers
// ------------------------------------------------------------
// Canonical (ordered) pair so each user-pair maps to one conversation.
async function getOrCreateConversation(u1, u2) {
  const a = u1.toString() < u2.toString() ? u1 : u2;
  const b = u1.toString() < u2.toString() ? u2 : u1;
  let conv = await Conversation.findOne({ user_a: a, user_b: b });
  if (!conv) {
    conv = await Conversation.create({ user_a: a, user_b: b });
  }
  return conv;
}

async function isFollowing(followerId, followeeId) {
  return !!(await Follow.findOne({ follower_id: followerId, followee_id: followeeId }));
}

// Onboard a brand-new user into the social graph: auto-follow the
// core demo creators and drop a welcome DM from the official account.
async function onboardSocial(userId) {
  const demos = await User.find({ is_demo: true, _id: { $ne: userId } });
  for (const d of demos) {
    await Follow.findOneAndUpdate(
      { follower_id: userId, followee_id: d._id },
      { $setOnInsert: { follower_id: userId, followee_id: d._id } },
      { upsert: true }
    );
  }

  const welcomer = await User.findOne({ email: WELCOME_FROM });
  if (welcomer && welcomer._id.toString() !== userId.toString()) {
    const conv = await getOrCreateConversation(welcomer._id, userId);
    await Message.create({ conv_id: conv._id, sender_id: welcomer._id, body: WELCOME_TEXT });
  }
}

// ============================================================
// Auth: Send verification code  — POST /api/send-code { email }
// ============================================================
async function handleSendCode(body, clientIp) {
  const email = String(body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) return { status: 400, data: { message: '请输入有效邮箱' } };

  // Rate limit by IP
  const rl = checkRateLimit(`send-code:${clientIp}`, RL_SEND_CODE.max, RL_SEND_CODE.windowMs);
  if (!rl.allowed) {
    return { status: 429, data: { message: `请求太频繁，请 ${Math.ceil(rl.resetMs / 1000)} 秒后再试` } };
  }

  const code = generateCode();
  const expiresAt = futureDate(10 * 60 * 1000);

  // Invalidate old codes for this email
  await VerificationCode.updateMany({ email, used: false }, { $set: { used: true } });
  await VerificationCode.create({ email, code, expires_at: expiresAt });

  if (DEV_MODE) {
    console.log(`[DEV] 验证码 for ${email}: ${code}`);
    return { status: 200, data: { message: '验证码已生成（开发模式，已在页面显示）', devCode: code } };
  }

  try {
    await transporter.sendMail({
      from: `"楚楚智创" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '楚楚智创 — 邮箱验证码',
      html: `
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <h2 style="margin:0 0 8px;font-size:22px;color:#0d9488;">楚楚智创 · OPC孵化器</h2>
          <p style="margin:0 0 24px;color:#555;font-size:15px;">你正在注册楚楚智创账户，以下是你的邮箱验证码：</p>
          <div style="background:#f0faf6;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;font-weight:700;letter-spacing:6px;color:#0d9488;">${code}</span>
          </div>
          <p style="margin:0 0 8px;color:#888;font-size:13px;">验证码 10 分钟内有效，请勿转发给他人。</p>
          <p style="margin:0;color:#aaa;font-size:12px;">如果这不是你发起的操作，请忽略此邮件。</p>
        </div>
      `,
    });
    console.log(`验证码已发送至 ${email}`);
  } catch (err) {
    console.error(`邮件发送失败 (${email}):`, err.message);
    await VerificationCode.updateMany({ email, used: false }, { $set: { used: true } });
    return { status: 500, data: { message: '验证码邮件发送失败，请稍后再试' } };
  }
  return { status: 200, data: { message: '验证码已发送至你的邮箱，请查收' } };
}

// ============================================================
// Auth: Register — POST /api/register { email, code, password, name? }
// Auto-creates a session so the user is logged in immediately.
// ============================================================
async function handleRegister(body, clientIp) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const code = String(body.code || '').trim();
  const name = body.name ? String(body.name).trim() : null;

  if (!email || !password || !code) return { status: 400, data: { message: '邮箱、密码和验证码不能为空' } };
  if (password.length < 6) return { status: 400, data: { message: '密码至少 6 位' } };

  // Rate limit by IP
  const rl = checkRateLimit(`register:${clientIp}`, RL_REGISTER.max, RL_REGISTER.windowMs);
  if (!rl.allowed) {
    return { status: 429, data: { message: `请求太频繁，请 ${Math.ceil(rl.resetMs / 1000)} 秒后再试` } };
  }

  const record = await VerificationCode.findOne({ email, code, used: false }).sort({ created_at: -1 });
  if (!record || new Date(record.expires_at) < new Date()) {
    return { status: 400, data: { message: '验证码错误或已过期' } };
  }
  await VerificationCode.updateOne({ _id: record._id }, { $set: { used: true } });

  const exists = await User.findOne({ email });
  if (exists) return { status: 409, data: { message: '该邮箱已注册，请直接登录' } };

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, name: name || undefined });
  await onboardSocial(user._id);
  const token = await createSession(user._id);
  return { status: 201, data: { message: '注册成功', token, user: publicUser(user) } };
}

// ============================================================
// Auth: Login — POST /api/login { email, password }
// ============================================================
async function handleLogin(body, clientIp) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return { status: 400, data: { message: '邮箱和密码不能为空' } };

  // Rate limit by IP
  const rl = checkRateLimit(`login:${clientIp}`, RL_LOGIN.max, RL_LOGIN.windowMs);
  if (!rl.allowed) {
    return { status: 429, data: { message: `请求太频繁，请 ${Math.ceil(rl.resetMs / 1000)} 秒后再试` } };
  }

  const user = await User.findOne({ $or: [{ email }, { phone: email }] });
  if (!user) return { status: 401, data: { message: '邮箱或密码错误' } };
  const match = await bcrypt.compare(password, user.password);
  if (!match) return { status: 401, data: { message: '邮箱或密码错误' } };

  const token = await createSession(user._id);
  return { status: 200, data: { message: '登录成功', token, user: publicUser(user) } };
}

// ============================================================
// Data: Skills — GET /api/skills?category=&hot=
// ============================================================
async function handleListSkills(url) {
  const category = url.searchParams.get('category');
  const hot = url.searchParams.get('hot');

  const filter = { status: '已发布' };
  if (category && category !== '全部') filter.category = category;
  if (hot === '1') filter.is_hot = true;

  const rows = await Skill.find(filter).sort({ sort: 1, created_at: -1 }).lean();
  return { status: 200, data: { data: rows.map(skillOut) } };
}

async function handleGetSkill(id) {
  const row = await Skill.findById(id).lean();
  if (!row) return { status: 404, data: { message: 'Skill 不存在' } };
  return { status: 200, data: { data: skillOut(row) } };
}

async function handleListRequests(url) {
  const status = url.searchParams.get('status');
  const filter = {};
  if (status && status !== '全部') filter.status = status;
  const rows = await Request.find(filter).sort({ sort: 1, created_at: -1 }).lean();
  return { status: 200, data: { data: rows } };
}

async function handleListPioneers() {
  const rows = await Pioneer.find().sort({ _id: 1 }).lean();
  return { status: 200, data: { data: rows } };
}

// ============================================================
// My skills — GET /api/my-skills (auth)
// ============================================================
async function handleMySkills(auth) {
  const rows = await Skill.find({ author_id: auth.user._id }).sort({ created_at: -1 }).lean();
  return { status: 200, data: { data: rows.map(skillOut) } };
}

// ============================================================
// Upload skill — POST /api/upload-skill (auth)
//   { title, category, description, skillKind? }  // skillKind is ignored (2 categories only)
// ============================================================
async function handleUploadSkill(auth, body) {
  const title = String(body.title || '').trim();
  const category = String(body.category || body.industry || '').trim();
  const description = String(body.description || '').trim();
  if (!title || !category || !description) return { status: 400, data: { message: '缺少必要字段' } };

  const id = `u_${randomUUID().slice(0, 8)}`;
  const slug = `user-${id}`;
  const row = await Skill.create({
    _id: id, title, descr: description, category,
    downloads: '0', slug, status: '草稿',
    author_id: auth.user._id, author_email: auth.user.email,
    is_hot: false, sort: 999,
  });
  return { status: 201, data: { message: '上传成功，已保存为草稿', data: skillOut(row) } };
}

// ============================================================
// Social: discover people — GET /api/users?q= (auth optional)
// Returns demo + real users (excluding self), with a follow flag.
// ============================================================
async function handleListUsers(auth, url) {
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const selfId = auth ? auth.user._id : null;
  const filter = {};
  if (selfId) filter._id = { $ne: selfId };
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];

  const rows = await User.find(filter).sort({ is_demo: -1, created_at: -1 }).limit(50).lean();
  const data = await Promise.all(rows.map(async (u) => ({
    ...publicUser(u),
    following: auth ? await isFollowing(selfId, u._id) : false,
  })));
  return { status: 200, data: { data } };
}

// GET /api/following (auth) — people the current user follows.
async function handleFollowing(auth) {
  const follows = await Follow.find({ follower_id: auth.user._id }).sort({ created_at: -1 }).lean();
  const userIds = follows.map((f) => f.followee_id);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  // Preserve follow order
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const data = follows
    .map((f) => userMap.get(f.followee_id.toString()))
    .filter(Boolean)
    .map((u) => ({ ...publicUser(u), following: true }));
  return { status: 200, data: { data } };
}

// POST /api/follow { userId } / POST /api/unfollow { userId } (auth)
async function handleFollow(auth, body, on) {
  const targetId = body.userId;
  if (!targetId || targetId === auth.user._id.toString()) return { status: 400, data: { message: '无效的用户' } };
  const target = await User.findById(targetId);
  if (!target) return { status: 404, data: { message: '用户不存在' } };
  if (on) {
    await Follow.findOneAndUpdate(
      { follower_id: auth.user._id, followee_id: target._id },
      { $setOnInsert: { follower_id: auth.user._id, followee_id: target._id } },
      { upsert: true }
    );
  } else {
    await Follow.deleteOne({ follower_id: auth.user._id, followee_id: target._id });
  }
  return { status: 200, data: { message: on ? '已关注' : '已取消关注', following: on } };
}

// GET /api/conversations (auth) — chat list with last message + unread count.
async function handleConversations(auth) {
  const me = auth.user._id;
  const convs = await Conversation.find({ $or: [{ user_a: me }, { user_b: me }] }).lean();
  const out = await Promise.all(convs.map(async (c) => {
    const otherId = c.user_a.toString() === me.toString() ? c.user_b : c.user_a;
    const other = await User.findById(otherId).lean();
    if (!other) return null;
    const last = await Message.findOne({ conv_id: c._id }).sort({ _id: -1 }).lean();
    const unread = await Message.countDocuments({ conv_id: c._id, sender_id: { $ne: me }, read_at: null });
    return {
      convId: c._id.toString(),
      user: publicUser(other),
      following: await isFollowing(me, otherId),
      lastMessage: last ? { body: last.body, createdAt: last.created_at, mine: last.sender_id.toString() === me.toString() } : null,
      unread,
      updatedAt: last ? last.created_at : c.created_at,
    };
  }));
  const filtered = out.filter(Boolean);
  filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return { status: 200, data: { data: filtered } };
}

// GET /api/messages?userId= (auth) — full thread with a user; marks incoming as read.
async function handleThread(auth, url) {
  const otherId = url.searchParams.get('userId');
  if (!otherId) return { status: 400, data: { message: '缺少 userId' } };
  const other = await User.findById(otherId).lean();
  if (!other) return { status: 404, data: { message: '用户不存在' } };
  const conv = await getOrCreateConversation(auth.user._id, other._id);
  await Message.updateMany(
    { conv_id: conv._id, sender_id: { $ne: auth.user._id }, read_at: null },
    { $set: { read_at: new Date() } }
  );
  const rows = await Message.find({ conv_id: conv._id }).sort({ _id: 1 }).lean();
  const messages = rows.map((m) => ({
    id: m._id.toString(),
    body: m.body,
    mine: m.sender_id.toString() === auth.user._id.toString(),
    createdAt: m.created_at,
  }));
  return { status: 200, data: { data: { user: publicUser(other), convId: conv._id.toString(), messages } } };
}

// POST /api/messages { userId, body } (auth) — send a message.
async function handleSendMessage(auth, body) {
  const otherId = body.userId;
  const text = String(body.body || '').trim();
  if (!otherId || !text) return { status: 400, data: { message: '缺少必要字段' } };
  if (text.length > 2000) return { status: 400, data: { message: '消息过长' } };
  const other = await User.findById(otherId);
  if (!other) return { status: 404, data: { message: '用户不存在' } };
  const conv = await getOrCreateConversation(auth.user._id, other._id);
  const msg = await Message.create({ conv_id: conv._id, sender_id: auth.user._id, body: text });

  // Demo users auto-reply so the chat feels alive (canned, deterministic).
  if (other.is_demo) {
    const replies = [
      '收到！这个想法不错，我研究一下。',
      '欢迎来楚楚智创，有需要随时找我～',
      '可以的，我这边有相关的 Skill，回头分享给你。',
      '感谢支持！记得关注一下我的新作品。',
      '这个需求挺常见的，建议去「需求广场」也发一条。',
    ];
    const idx = text.length % replies.length;
    await Message.create({ conv_id: conv._id, sender_id: other._id, body: replies[idx] });
  }

  return { status: 201, data: { data: { id: msg._id.toString(), body: msg.body, mine: true, createdAt: msg.created_at } } };
}

// ============================================================
// Server
// ============================================================
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (CORS_ORIGIN !== '*') res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const send = (r) => sendJson(res, r.status, r.data);
  const json = async () => JSON.parse((await readBody(req)) || '{}');
  const clientIp = getClientIp(req, TRUST_PROXY);

  try {
    // Health
    if (req.method === 'GET' && pathname === '/health') {
      return sendJson(res, 200, { ok: true, service: 'chuchu-backend', db: 'mongodb', devMode: DEV_MODE });
    }

    // ---- Public reads ----
    if (req.method === 'GET' && pathname === '/api/skills') return send(await handleListSkills(url));
    if (req.method === 'GET' && pathname.startsWith('/api/skills/')) {
      return send(await handleGetSkill(decodeURIComponent(pathname.split('/')[3] || '')));
    }
    if (req.method === 'GET' && pathname === '/api/requests') return send(await handleListRequests(url));
    if (req.method === 'GET' && pathname === '/api/pioneers') return send(await handleListPioneers());

    // ---- Auth ----
    if (req.method === 'POST' && pathname === '/api/send-code') return send(await handleSendCode(await json(), clientIp));
    if (req.method === 'POST' && pathname === '/api/register') return send(await handleRegister(await json(), clientIp));
    if (req.method === 'POST' && pathname === '/api/login') return send(await handleLogin(await json(), clientIp));

    if (req.method === 'POST' && pathname === '/api/logout') {
      const auth = await userFromAuth(req);
      if (auth) await Session.deleteOne({ token: auth.token });
      return sendJson(res, 200, { message: '已退出登录' });
    }
    if (req.method === 'GET' && pathname === '/api/me') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '未登录' });
      return sendJson(res, 200, { user: publicUser(auth.user) });
    }

    // ---- Authenticated ----
    if (req.method === 'GET' && pathname === '/api/my-skills') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleMySkills(auth));
    }
    if (req.method === 'POST' && pathname === '/api/upload-skill') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleUploadSkill(auth, await json()));
    }

    // ---- Social ----
    if (req.method === 'GET' && pathname === '/api/users') {
      return send(await handleListUsers(await userFromAuth(req), url));
    }
    if (req.method === 'GET' && pathname === '/api/following') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleFollowing(auth));
    }
    if (req.method === 'POST' && (pathname === '/api/follow' || pathname === '/api/unfollow')) {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleFollow(auth, await json(), pathname === '/api/follow'));
    }
    if (req.method === 'GET' && pathname === '/api/conversations') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleConversations(auth));
    }
    if (req.method === 'GET' && pathname === '/api/messages') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleThread(auth, url));
    }
    if (req.method === 'POST' && pathname === '/api/messages') {
      const auth = await userFromAuth(req);
      if (!auth) return sendJson(res, 401, { message: '请先登录' });
      return send(await handleSendMessage(auth, await json()));
    }

    return sendJson(res, 404, { message: 'Not Found' });
  } catch (err) {
    console.error('Server error:', err);
    return sendJson(res, 500, { message: '服务器内部错误' });
  }
});

// ============================================================
// Start
// ============================================================
const port = process.env.PORT || 4000;

// Connect to MongoDB, seed data, then start HTTP server.
connectDB().then(async () => {
  const counts = await seed();
  console.log(`DB seeded → skills: ${counts.skills}, requests: ${counts.requests}, pioneers: ${counts.pioneers}, demoUsers: ${counts.demoUsers}`);

  server.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
    console.log(`CORS origin: ${CORS_ORIGIN}`);
    console.log(`Trust proxy: ${TRUST_PROXY}`);
    console.log(`Email mode: ${DEV_MODE ? 'DEV (codes in console)' : 'PRODUCTION (Gmail SMTP)'}`);
    console.log('Database: MongoDB (mongoose)');
  });
});
