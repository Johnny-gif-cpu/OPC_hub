// ============================================================
// Pandora X — seed data (idempotent, MongoDB).
// Mirrors the frontend's original hardcoded content so the DB
// ships pre-populated. Safe to run repeatedly: uses upsert.
// Run automatically on server start, or manually: npm run seed
// ============================================================
import bcrypt from 'bcryptjs';
import { User, Skill, Request, Pioneer } from './models.js';

// ------------------------------------------------------------
// Demo community members. These are real accounts (hashed password
// "pandora123") so a curious user can even log in as them. New users
// are auto-connected to a few of them on registration so the social
// dock is never empty. Avatars are emoji for zero-asset portability.
// ------------------------------------------------------------
const DEMO_PASSWORD = 'pandora123';
const DEMO_USERS = [
  { email: 'riverflow@pandora.ai', name: 'RiverFlow', avatar: '🦦', headline: '金牌创作者 · 全栈 Skill 作者', bio: '14 个上架 Skills，专注把复杂流程做成一键可用的 Skill。' },
  { email: 'neolab@pandora.ai', name: 'NeoLab', avatar: '🧪', headline: '增长顾问 · 企业内容方向', bio: '帮品牌把内容生产标准化，需求对接成功率 92%。' },
  { email: 'atlas@pandora.ai', name: 'AtlasChen', avatar: '🛰️', headline: '人气之星 · 自动化极客', bio: '累计下载 48k+，喜欢折腾自动化与工作流。' },
  { email: 'mira@pandora.ai', name: 'Mira_7', avatar: '🌷', headline: '新锐先锋 · 日常场景作者', bio: '6 个生活类爆款，热衷穿搭、美食与微旅行。' },
  { email: 'kite@pandora.ai', name: 'KiteWorks', avatar: '🪁', headline: '企业伙伴 · 社群与工具链', bio: '已签约 3 家企业客户，主攻社群冷启动与工具链。' },
  { email: 'pandora@pandora.ai', name: 'Pandora 小助手', avatar: '🪐', headline: '官方账号 · 你的向导', bio: '有任何关于发布、部署与激励的问题，随时找我。' },
];

// Welcome DM that the official assistant sends to every new user.
export const WELCOME_FROM = 'pandora@pandora.ai';
export const WELCOME_TEXT = '欢迎加入 Pandora X！在这里你可以发现、部署并发布 AI Skills。左侧已经帮你关注了几位活跃创作者，随时可以和他们打个招呼。';

const SKILL_SLUGS = {
  s1: 'home-recipe-muse', s2: 'shop-visit-notes', s3: 'takeout-ranking', s4: 'icebreaker-cards',
  s5: 'interest-intro', s6: 'capsule-wardrobe', s7: 'dress-code-lookup', s8: 'weekend-microtrip',
  s9: 'budget-travel-split', s10: 'community-coldstart', s11: 'group-rules-welcome', s12: 'account-topic-decode',
  s13: 'multi-platform-calendar', s14: 'short-video-script', s15: 'longform-outline', s16: 'prd-extractor',
  s17: 'user-journey-draft', s18: 'vps-route-compare', s19: 'proxy-port-memo',
};

const HOT_IDS = new Set(['s6', 's14', 's8', 's10', 's2', 's16', 's4', 's12', 's1']);

const SKILLS = [
  { _id: 's1', title: '今日私房菜灵感', descr: '根据冰箱食材与口味偏好，生成快手菜与营养小贴士。', category: '美食', skill_kind: 'daily', downloads: '24.1k' },
  { _id: 's2', title: '探店笔记生成器', descr: '把人均、菜系与亮点关键词整理成适合发社交平台的长图文骨架。', category: '美食', skill_kind: 'daily', downloads: '11.3k' },
  { _id: 's3', title: '外卖红黑榜摘要', descr: '从订单与评价里提炼「值得回购」和「避雷」要点，方便分享。', category: '美食', skill_kind: 'daily', downloads: '18.6k' },
  { _id: 's4', title: '破冰话题卡', descr: '按场景（同事/兴趣群/线下局）生成轻松不尬的聊天开场与接话。', category: '交友', skill_kind: 'daily', downloads: '31.8k' },
  { _id: 's5', title: '兴趣名片自我介绍', descr: '把爱好与性格关键词写成简短自我介绍，适合社群简介或活动签到。', category: '交友', skill_kind: 'daily', downloads: '15.4k' },
  { _id: 's6', title: '胶囊衣橱七日搭配', descr: '输入单品与场合，输出一周不重样的搭配思路与配饰建议。', category: '穿搭', skill_kind: 'daily', downloads: '42.7k' },
  { _id: 's7', title: '场合 Dress Code 速查', descr: '婚礼、面试、年会等场合的着装要点与常见踩雷提醒。', category: '穿搭', skill_kind: 'daily', downloads: '19.5k' },
  { _id: 's8', title: '周末微旅行路书', descr: '基于出发地与天数，生成松弛感行程、交通与打卡节奏建议。', category: '旅游攻略', skill_kind: 'daily', downloads: '38.2k' },
  { _id: 's9', title: '穷游预算拆分表', descr: '按交通/住宿/门票/餐饮自动分摊预算并给省钱优先级。', category: '旅游攻略', skill_kind: 'daily', downloads: '12.6k' },
  { _id: 's10', title: '社群冷启动 SOP', descr: '从拉新到首周活跃，输出可执行的任务清单与话术模板。', category: '社群工具', skill_kind: 'commercial', downloads: '36.4k' },
  { _id: 's11', title: '群规与自动欢迎文案', descr: '按社群主题生成群公告、入群欢迎语与常见违规示例说明。', category: '社群工具', skill_kind: 'commercial', downloads: '22.1k' },
  { _id: 's12', title: '账号选题与爆款拆解', descr: '给定赛道与对标账号，提炼选题角度与标题结构模式。', category: '账号流量', skill_kind: 'commercial', downloads: '44.9k' },
  { _id: 's13', title: '多平台发帖日历', descr: '按平台节奏生成一周内容排期与话题标签建议。', category: '账号流量', skill_kind: 'commercial', downloads: '28.3k' },
  { _id: 's14', title: '短视频脚本与镜头表', descr: '把卖点拆成钩子—展开—行动号召，并给出分镜与时长建议。', category: '内容创作', skill_kind: 'commercial', downloads: '51.2k' },
  { _id: 's15', title: '图文长帖大纲助手', descr: '从核心观点生成章节结构、金句位与配图占位说明。', category: '内容创作', skill_kind: 'commercial', downloads: '33.7k' },
  { _id: 's16', title: 'PRD 要点提炼器', descr: '把零散需求对话整理成目标、用户故事与验收要点草案。', category: '产品设计', skill_kind: 'commercial', downloads: '29.8k' },
  { _id: 's17', title: '用户旅程草稿生成', descr: '快速产出关键触点、情绪曲线与机会点的旅程图文字版。', category: '产品设计', skill_kind: 'commercial', downloads: '17.1k' },
  { _id: 's18', title: 'VPS 线路对比清单', descr: '按地区与用途对比延迟、带宽策略与常见套餐坑点。', category: '主机代理', skill_kind: 'commercial', downloads: '14.5k' },
  { _id: 's19', title: '代理端口与风控备忘', descr: '整理端口用途、安全组建议与合规使用注意项（演示文案）。', category: '主机代理', skill_kind: 'commercial', downloads: '9.8k' },
];

const REQUESTS = [
  { _id: 'q1', title: '需要「小红书探店」图文一键骨架 Skill', budget: '¥3k–8k', deadline: '2026-05-28', status: '招募中', category: '美食', publisher: '本地生活 MCN', summary: '输入店名、人均与亮点，输出标题、分段小标题与话题标签建议。' },
  { _id: 'q2', title: '社群团购群促活 + 接龙话术', budget: '¥2k–5k', deadline: '2026-05-18', status: '招募中', category: '社群工具', publisher: '社区团购团队', summary: '按品类与档期生成早安提醒、开团话术与售后安抚模板。' },
  { _id: 'q3', title: '抖音带货脚本批量生成', budget: '¥8k–15k', deadline: '2026-06-02', status: '已对接', category: '内容创作', publisher: '品牌代运营', summary: '对接 SKU 与卖点库，输出 15–60 秒多版本脚本与禁用词检查。' },
  { _id: 'q4', title: '海外 VPS 选型咨询型 Skill', budget: '¥2k–4k', deadline: '2026-05-12', status: '已关闭', category: '主机代理', publisher: '独立开发者', summary: '根据业务地区与预算输出候选机房、线路与备份策略说明。' },
  { _id: 'q5', title: '私域引流落地页文案 + A/B 标题', budget: '¥5k–12k', deadline: '2026-06-15', status: '招募中', category: '账号流量', publisher: 'SaaS 增长团队', summary: '输入产品一句话价值与受众，输出首屏文案与两套对照标题。' },
  { _id: 'q6', title: 'B 端产品需求访谈纪要 → PRD 草案', budget: '¥10k–20k', deadline: '2026-05-25', status: '招募中', category: '产品设计', publisher: '企业服务初创', summary: '结构化整理访谈要点，并生成用户故事与里程碑验收表。' },
];

const PIONEERS = [
  { _id: 1, name: 'RiverFlow', role: '全栈 Skill 作者', metric: '贡献 14 个上架 Skills', badge: '金牌创作者' },
  { _id: 2, name: 'NeoLab', role: '企业内容方向', metric: '需求对接成功率 92%', badge: '增长顾问' },
  { _id: 3, name: 'AtlasChen', role: '自动化极客', metric: '累计下载 48k+', badge: '人气之星' },
  { _id: 4, name: 'Mira_7', role: '日常场景作者', metric: '6 个生活类爆款', badge: '新锐先锋' },
  { _id: 5, name: 'KiteWorks', role: '社群与工具链', metric: '企业客户 3 家签约', badge: '企业伙伴' },
];

export async function seed() {
  // ---- Demo users (upsert by email) ----
  const hashed = bcrypt.hashSync(DEMO_PASSWORD, 10);
  for (const u of DEMO_USERS) {
    await User.findOneAndUpdate(
      { email: u.email },
      { $setOnInsert: { email: u.email, password: hashed, name: u.name, avatar: u.avatar, headline: u.headline, bio: u.bio, is_demo: true } },
      { upsert: true, new: false }
    );
  }

  // ---- Skills (upsert by _id) ----
  const demoEmail = 'demo@pandora.ai';
  for (let i = 0; i < SKILLS.length; i++) {
    const s = SKILLS[i];
    await Skill.findOneAndUpdate(
      { _id: s._id },
      { $setOnInsert: { _id: s._id, title: s.title, descr: s.descr, category: s.category, skill_kind: s.skill_kind, downloads: s.downloads, slug: SKILL_SLUGS[s._id] || null, status: '已发布', author_email: demoEmail, is_hot: HOT_IDS.has(s._id), sort: i } },
      { upsert: true, new: false }
    );
  }

  // ---- Requests (upsert by _id) ----
  for (let i = 0; i < REQUESTS.length; i++) {
    const r = REQUESTS[i];
    await Request.findOneAndUpdate(
      { _id: r._id },
      { $setOnInsert: { _id: r._id, title: r.title, budget: r.budget, deadline: r.deadline, status: r.status, category: r.category, publisher: r.publisher, summary: r.summary, sort: i } },
      { upsert: true, new: false }
    );
  }

  // ---- Pioneers (upsert by _id) ----
  for (const p of PIONEERS) {
    await Pioneer.findOneAndUpdate(
      { _id: p._id },
      { $setOnInsert: { _id: p._id, name: p.name, role: p.role, metric: p.metric, badge: p.badge } },
      { upsert: true, new: false }
    );
  }

  // ---- Counts ----
  const [skills, requests, pioneers, demoUsers] = await Promise.all([
    Skill.countDocuments(),
    Request.countDocuments(),
    Pioneer.countDocuments(),
    User.countDocuments({ is_demo: true }),
  ]);

  return { skills, requests, pioneers, demoUsers };
}

// Allow `node src/seed.js` direct invocation.
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  // Need to connect first
  const { connectDB } = await import('./db.js');
  await connectDB();
  const c = await seed();
  console.log(`Seed complete → skills: ${c.skills}, requests: ${c.requests}, pioneers: ${c.pioneers}, demoUsers: ${c.demoUsers}`);
  process.exit(0);
}
