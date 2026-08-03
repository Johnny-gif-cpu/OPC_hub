// ============================================================
// 楚楚智创 — seed data (idempotent, MongoDB).
// Mirrors the frontend's original hardcoded content so the DB
// ships pre-populated. Safe to run repeatedly: uses upsert.
// Run automatically on server start, or manually: npm run seed
// ============================================================
import bcrypt from 'bcryptjs';
import { User, Skill, Request, Pioneer } from './models.js';

// ------------------------------------------------------------
// Demo community members. These are real accounts (hashed password
// "chuchu123") so a curious user can even log in as them. New users
// are auto-connected to a few of them on registration so the social
// dock is never empty. Avatars are emoji for zero-asset portability.
// ------------------------------------------------------------
const DEMO_PASSWORD = 'chuchu123';
const DEMO_USERS = [
  { email: 'riverflow@chuchu-ai.cn', name: 'RiverFlow', avatar: '🦦', headline: '金牌创作者 · 全栈 Skill 作者', bio: '14 个上架 Skills，专注把复杂流程做成一键可用的 Skill。' },
  { email: 'neolab@chuchu-ai.cn', name: 'NeoLab', avatar: '🧪', headline: '增长顾问 · 企业内容方向', bio: '帮品牌把内容生产标准化，需求对接成功率 92%。' },
  { email: 'atlas@chuchu-ai.cn', name: 'AtlasChen', avatar: '🛰️', headline: '人气之星 · 自动化极客', bio: '累计下载 48k+，喜欢折腾自动化与工作流。' },
  { email: 'mira@chuchu-ai.cn', name: 'Mira_7', avatar: '🌷', headline: '新锐先锋 · 日常场景作者', bio: '6 个生活类爆款，热衷穿搭、美食与微旅行。' },
  { email: 'kite@chuchu-ai.cn', name: 'KiteWorks', avatar: '🪁', headline: '企业伙伴 · 社群与工具链', bio: '已签约 3 家企业客户，主攻社群冷启动与工具链。' },
  { email: 'assistant@chuchu-ai.cn', name: '楚楚小助手', avatar: '🏛️', headline: '官方账号 · 你的向导', bio: '有任何关于发布、部署与激励的问题，随时找我。' },
];

// Welcome DM that the official assistant sends to every new user.
export const WELCOME_FROM = 'assistant@chuchu-ai.cn';
export const WELCOME_TEXT = '欢迎加入楚楚智创 · OPC 孵化器！在这里你可以发现、部署并发布 AI 智能体。左侧已经帮你关注了几位活跃创作者，随时可以和他们打个招呼。';

const SKILL_SLUGS = {
  s1: 'ai-comic-generator', s2: 'subtitle-video-studio', s3: 'campus-drama-writer',
  s4: 'ai-animation-factory', s5: 'funny-video-engine', s6: 'vtuber-script-helper',
  s7: 'ai-dubbing-studio', s8: 'video-style-transfer', s9: 'ai-drama-continuer',
  s10: 'digital-human-guide', s11: 'science-deep-writer', s12: 'finance-insight',
  s13: 'page-turner-engine', s14: 'xhs-viral-copy', s15: 'short-viral-script',
  s16: 'wechat-article-pro', s17: 'product-review-template', s18: 'whitepaper-framework',
  s19: 'hotspot-news-flash',
};

const HOT_IDS = new Set(['s13', 's15', 's5', 's1', 's19', 's14', 's12', 's3', 's7']);

const SKILLS = [
  // ---- AIGC ----
  { _id: 's1', title: 'AI漫剧生成器', descr: '一键生成漫画风格短剧，从分镜脚本到AI配音全流程辅助，适合漫剧创作者快速出片。', category: 'AIGC', downloads: '38.2k' },
  { _id: 's2', title: '字幕讲解视频工坊', descr: '自动生成知识讲解类视频的字幕与配图建议，适合科普UP主和教育类创作者。', category: 'AIGC', downloads: '24.7k' },
  { _id: 's3', title: '校园短剧编剧', descr: '校园题材短剧剧本+分镜+台词一键输出，青春校园故事从创意到成稿。', category: 'AIGC', downloads: '19.5k' },
  { _id: 's4', title: 'AI动画短片工厂', descr: '从故事创意到成片方案，AI驱动动画短片全流程规划与脚本生成。', category: 'AIGC', downloads: '31.4k' },
  { _id: 's5', title: '搞笑视频灵感引擎', descr: '爆款搞笑视频创意+反转脚本+节奏设计，帮你抓住流量密码。', category: 'AIGC', downloads: '45.1k' },
  { _id: 's6', title: '虚拟主播台本助手', descr: '虚拟主播日常直播台本自动生成，包含互动环节与话题切换设计。', category: 'AIGC', downloads: '16.8k' },
  { _id: 's7', title: 'AI配音与口播工坊', descr: '多语种AI配音方案+口播视频脚本一站式生成，支持情感语调调节。', category: 'AIGC', downloads: '22.3k' },
  { _id: 's8', title: '视频风格迁移师', descr: '将普通视频转换为特定艺术风格方案：水墨风、赛博朋克、复古胶片等。', category: 'AIGC', downloads: '13.6k' },
  { _id: 's9', title: 'AI短剧续写器', descr: '已有短剧的AI续写+多结局分支创作，保持角色一致性与情节连贯。', category: 'AIGC', downloads: '11.2k' },
  { _id: 's10', title: '数字人出镜方案', descr: '数字人视频制作全流程指南：形象选择、动作捕捉、口型同步与后期。', category: 'AIGC', downloads: '18.9k' },
  // ---- 内容创作 ----
  { _id: 's11', title: '科普深度长文', descr: '将复杂科学概念转化为通俗易懂的深度长文，引用+图解+案例一键生成。', category: '内容创作', downloads: '28.6k' },
  { _id: 's12', title: '金融分析与洞察', descr: '市场数据解读+趋势预判+投资逻辑分析，输出专业级金融洞察报告。', category: '内容创作', downloads: '33.9k' },
  { _id: 's13', title: '爽文生成引擎', descr: '快节奏高爽感网文创作引擎，人物设定+冲突设计+反转节奏一键输出。', category: '内容创作', downloads: '52.4k' },
  { _id: 's14', title: '小红书爆款文案', descr: '种草文案+封面设计建议+话题标签优化，提升小红书内容传播力。', category: '内容创作', downloads: '44.8k' },
  { _id: 's15', title: '短视频爆款脚本', descr: '15—60秒爆款短视频结构：钩子→展开→反转→行动号召，多赛道适配。', category: '内容创作', downloads: '51.2k' },
  { _id: 's16', title: '公众号深度排版', descr: '长文排版优化+段落节奏设计+配图建议，提升公众号阅读体验。', category: '内容创作', downloads: '20.3k' },
  { _id: 's17', title: '产品评测模板', descr: '结构化评测框架：开箱→深度体验→竞品对比→购买建议，专业又易读。', category: '内容创作', downloads: '15.7k' },
  { _id: 's18', title: '行业白皮书框架', descr: '专业报告结构设计+数据可视化建议+核心结论提炼，企业级白皮书模板。', category: '内容创作', downloads: '25.1k' },
  { _id: 's19', title: '热点追踪快讯', descr: '实时热点监控+快速评论角度+传播策略建议，抢占内容先机。', category: '内容创作', downloads: '36.5k' },
];

const REQUESTS = [
  { _id: 'q1', title: '需要「AI漫剧」批量生成方案', budget: '¥5k–10k', deadline: '2026-08-15', status: '招募中', category: 'AIGC', publisher: '短视频MCN', summary: '输入故事大纲，自动生成分镜脚本+AI配音方案，适配多平台发布。' },
  { _id: 'q2', title: '校园短剧剧本批量创作', budget: '¥3k–8k', deadline: '2026-08-10', status: '招募中', category: 'AIGC', publisher: '高校新媒体团队', summary: '校园青春题材短剧剧本需求，每集3-5分钟，需要反转结构和金句。' },
  { _id: 'q3', title: '金融科普类深度内容创作', budget: '¥8k–15k', deadline: '2026-08-20', status: '已对接', category: '内容创作', publisher: '财经自媒体', summary: '将专业金融报告转化为大众可读的科普长文，包含数据可视化建议。' },
  { _id: 'q4', title: '小红书品牌种草文案矩阵', budget: '¥5k–12k', deadline: '2026-08-18', status: '招募中', category: '内容创作', publisher: '新消费品牌', summary: '围绕新品上市，产出30篇差异化种草文案+封面方案+话题策略。' },
  { _id: 'q5', title: '爽文创作引擎定制', budget: '¥10k–20k', deadline: '2026-08-25', status: '招募中', category: '内容创作', publisher: '网文平台', summary: '定制化爽文生成模板：都市/玄幻/言情多赛道，支持人设与世界观设定。' },
  { _id: 'q6', title: '数字人直播方案全案', budget: '¥15k–30k', deadline: '2026-08-30', status: '招募中', category: 'AIGC', publisher: '品牌电商团队', summary: '数字人直播带货全流程方案：形象设计+台本生成+互动脚本+技术部署。' },
];

const PIONEERS = [
  { _id: 1, name: 'RiverFlow', role: 'AIGC创作者', metric: '贡献 14 个上架智能体', badge: '金牌创作者' },
  { _id: 2, name: 'NeoLab', role: '内容创作方向', metric: '需求对接成功率 92%', badge: '增长顾问' },
  { _id: 3, name: 'AtlasChen', role: 'AI视频极客', metric: '累计下载 48k+', badge: '人气之星' },
  { _id: 4, name: 'Mira_7', role: 'AIGC场景作者', metric: '6 个AI视频类爆款', badge: '新锐先锋' },
  { _id: 5, name: 'KiteWorks', role: '内容创作工具链', metric: '企业客户 3 家签约', badge: '企业伙伴' },
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
  const demoEmail = 'demo@chuchu-ai.cn';
  for (let i = 0; i < SKILLS.length; i++) {
    const s = SKILLS[i];
    await Skill.findOneAndUpdate(
      { _id: s._id },
      { $setOnInsert: { _id: s._id, title: s.title, descr: s.descr, category: s.category, downloads: s.downloads, slug: SKILL_SLUGS[s._id] || null, status: '已发布', author_email: demoEmail, is_hot: HOT_IDS.has(s._id), sort: i } },
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
