// ============================================================
// 楚楚智创 · OPC孵化器 — shared data (智能体, 分类, 部署配置)
// ============================================================

/** 三大分类 */
export const ALL_SKILL_CATEGORIES = ['AIGC', '内容创作', '前端网页'];

export function skillIdNumber(id) {
  const n = Number(String(id || '').replace(/\D/g, ''));
  return Number.isFinite(n) ? n : 0;
}
export function parseDownloads(downloads) {
  const raw = String(downloads || '').trim().toLowerCase();
  const k = raw.endsWith('k');
  const num = Number(raw.replace('k', ''));
  if (!Number.isFinite(num)) return 0;
  return k ? num * 1000 : num;
}

// Stable slug per skill — used to build deploy commands.
const SKILL_SLUGS = {
  s1: 'ai-comic-generator', s2: 'subtitle-video-studio', s3: 'campus-drama-writer',
  s4: 'ai-animation-factory', s5: 'funny-video-engine', s6: 'vtuber-script-helper',
  s7: 'ai-dubbing-studio', s8: 'video-style-transfer', s9: 'ai-drama-continuer',
  s10: 'digital-human-guide', s11: 'science-deep-writer', s12: 'finance-insight',
  s13: 'page-turner-engine', s14: 'xhs-viral-copy', s15: 'short-viral-script',
  s16: 'wechat-article-pro', s17: 'product-review-template', s18: 'whitepaper-framework',
  s19: 'hotspot-news-flash',
  s20: 'brand-landing-builder', s21: 'game-site-starter', s22: 'dashboard-scaffold',
  s23: 'corp-site-generator',
};
export function skillSlug(skill) {
  return SKILL_SLUGS[skill.id] || `skill-${skillIdNumber(skill.id)}`;
}

// ============================================================
// Demo skills
// ============================================================
export const skills = [
  // ---- AIGC（AI视频方向）----
  { id: 's1', title: 'AI漫剧生成器', desc: '一键生成漫画风格短剧，从分镜脚本到AI配音全流程辅助，适合漫剧创作者快速出片。', category: 'AIGC', downloads: '38.2k', recommendedAgents: ['claude-code'] },
  { id: 's2', title: '字幕讲解视频工坊', desc: '自动生成知识讲解类视频的字幕与配图建议，适合科普UP主和教育类创作者。', category: 'AIGC', downloads: '24.7k', recommendedAgents: ['claude-code', 'cursor'] },
  { id: 's3', title: '校园短剧编剧', desc: '校园题材短剧剧本+分镜+台词一键输出，青春校园故事从创意到成稿。', category: 'AIGC', downloads: '19.5k', recommendedAgents: ['claude-code'] },
  { id: 's4', title: 'AI动画短片工厂', desc: '从故事创意到成片方案，AI驱动动画短片全流程规划与脚本生成。', category: 'AIGC', downloads: '31.4k', recommendedAgents: ['claude-code', 'cursor'] },
  { id: 's5', title: '搞笑视频灵感引擎', desc: '爆款搞笑视频创意+反转脚本+节奏设计，帮你抓住流量密码。', category: 'AIGC', downloads: '45.1k', recommendedAgents: ['claude-code'] },
  { id: 's6', title: '虚拟主播台本助手', desc: '虚拟主播日常直播台本自动生成，包含互动环节与话题切换设计。', category: 'AIGC', downloads: '16.8k', recommendedAgents: ['claude-code'] },
  { id: 's7', title: 'AI配音与口播工坊', desc: '多语种AI配音方案+口播视频脚本一站式生成，支持情感语调调节。', category: 'AIGC', downloads: '22.3k', recommendedAgents: ['claude-code', 'cursor'] },
  { id: 's8', title: '视频风格迁移师', desc: '将普通视频转换为特定艺术风格方案：水墨风、赛博朋克、复古胶片等。', category: 'AIGC', downloads: '13.6k', recommendedAgents: ['claude-code', 'cursor'] },
  { id: 's9', title: 'AI短剧续写器', desc: '已有短剧的AI续写+多结局分支创作，保持角色一致性与情节连贯。', category: 'AIGC', downloads: '11.2k', recommendedAgents: ['claude-code'] },
  { id: 's10', title: '数字人出镜方案', desc: '数字人视频制作全流程指南：形象选择、动作捕捉、口型同步与后期。', category: 'AIGC', downloads: '18.9k', recommendedAgents: ['claude-code', 'cursor'] },
  // ---- 内容创作 ----
  { id: 's11', title: '科普深度长文', desc: '将复杂科学概念转化为通俗易懂的深度长文，引用+图解+案例一键生成。', category: '内容创作', downloads: '28.6k', recommendedAgents: ['codex'] },
  { id: 's12', title: '金融分析与洞察', desc: '市场数据解读+趋势预判+投资逻辑分析，输出专业级金融洞察报告。', category: '内容创作', downloads: '33.9k', recommendedAgents: ['codex', 'claude-code'] },
  { id: 's13', title: '爽文生成引擎', desc: '快节奏高爽感网文创作引擎，人物设定+冲突设计+反转节奏一键输出。', category: '内容创作', downloads: '52.4k', recommendedAgents: ['codex'] },
  { id: 's14', title: '小红书爆款文案', desc: '种草文案+封面设计建议+话题标签优化，提升小红书内容传播力。', category: '内容创作', downloads: '44.8k', recommendedAgents: ['codex', 'claude-code'] },
  { id: 's15', title: '短视频爆款脚本', desc: '15—60秒爆款短视频结构：钩子→展开→反转→行动号召，多赛道适配。', category: '内容创作', downloads: '51.2k', recommendedAgents: ['codex'] },
  { id: 's16', title: '公众号深度排版', desc: '长文排版优化+段落节奏设计+配图建议，提升公众号阅读体验。', category: '内容创作', downloads: '20.3k', recommendedAgents: ['codex'] },
  { id: 's17', title: '产品评测模板', desc: '结构化评测框架：开箱→深度体验→竞品对比→购买建议，专业又易读。', category: '内容创作', downloads: '15.7k', recommendedAgents: ['codex', 'claude-code'] },
  { id: 's18', title: '行业白皮书框架', desc: '专业报告结构设计+数据可视化建议+核心结论提炼，企业级白皮书模板。', category: '内容创作', downloads: '25.1k', recommendedAgents: ['codex', 'claude-code'] },
  { id: 's19', title: '热点追踪快讯', desc: '实时热点监控+快速评论角度+传播策略建议，抢占内容先机。', category: '内容创作', downloads: '36.5k', recommendedAgents: ['codex'] },
  // ---- 前端网页 ----
  { id: 's20', title: '品牌首页构建器', desc: '品牌官网首页一站式搭建方案，包含Hero区、功能介绍、CTA布局与现代响应式设计模板。', category: '前端网页', downloads: '29.3k', recommendedAgents: ['cursor'] },
  { id: 's21', title: '游戏网站快速原型', desc: '游戏官网/活动页快速原型方案：游戏展示区、下载引导、社区入口与新闻动态模块。', category: '前端网页', downloads: '21.7k', recommendedAgents: ['cursor', 'claude-code'] },
  { id: 's22', title: '后台仪表盘脚手架', desc: '数据仪表盘前端脚手架：图表面板、数据表格、侧边导航与用户管理界面模板。', category: '前端网页', downloads: '17.5k', recommendedAgents: ['cursor'] },
  { id: 's23', title: '企业官网生成器', desc: '企业官网多页面结构方案：关于我们、产品展示、新闻中心、联系表单一应俱全。', category: '前端网页', downloads: '26.1k', recommendedAgents: ['cursor', 'claude-code'] },
];

const HOME_HOT_SKILL_IDS = ['s13', 's1', 's5', 's20', 's12'];
export const homeHotSkills = HOME_HOT_SKILL_IDS.map((id) => skills.find((s) => s.id === id)).filter(Boolean);

export const mySkills = [
  { title: '我的AI漫剧项目', category: 'AIGC', status: '已发布' },
  { title: '科普长文助手', category: '内容创作', status: '草稿' },
  { title: '品牌官网重构方案', category: '前端网页', status: '等待审核' },
];

export const plazaRequests = [
  { id: 'q1', title: '需要「AI漫剧」批量生成方案', budget: '¥5k–10k', deadline: '2026-08-15', status: '招募中', category: 'AIGC', publisher: '短视频MCN', summary: '输入故事大纲，自动生成分镜脚本+AI配音方案，适配多平台发布。' },
  { id: 'q2', title: '校园短剧剧本批量创作', budget: '¥3k–8k', deadline: '2026-08-10', status: '招募中', category: 'AIGC', publisher: '高校新媒体团队', summary: '校园青春题材短剧剧本需求，每集3-5分钟，需要反转结构和金句。' },
  { id: 'q3', title: '金融科普类深度内容创作', budget: '¥8k–15k', deadline: '2026-08-20', status: '已对接', category: '内容创作', publisher: '财经自媒体', summary: '将专业金融报告转化为大众可读的科普长文，包含数据可视化建议。' },
  { id: 'q4', title: '小红书品牌种草文案矩阵', budget: '¥5k–12k', deadline: '2026-08-18', status: '招募中', category: '内容创作', publisher: '新消费品牌', summary: '围绕新品上市，产出30篇差异化种草文案+封面方案+话题策略。' },
  { id: 'q5', title: '爽文创作引擎定制', budget: '¥10k–20k', deadline: '2026-08-25', status: '招募中', category: '内容创作', publisher: '网文平台', summary: '定制化爽文生成模板：都市/玄幻/言情多赛道，支持人设与世界观设定。' },
  { id: 'q6', title: '数字人直播方案全案', budget: '¥15k–30k', deadline: '2026-08-30', status: '招募中', category: 'AIGC', publisher: '品牌电商团队', summary: '数字人直播带货全流程方案：形象设计+台本生成+互动脚本+技术部署。' },
];

export const pioneerBoard = [
  { rank: 1, name: 'RiverFlow', role: 'AIGC创作者', metric: '贡献 14 个上架智能体', badge: '金牌创作者' },
  { rank: 2, name: 'NeoLab', role: '内容创作方向', metric: '需求对接成功率 92%', badge: '增长顾问' },
  { rank: 3, name: 'AtlasChen', role: 'AI视频极客', metric: '累计下载 48k+', badge: '人气之星' },
  { rank: 4, name: 'Mira_7', role: 'AIGC场景作者', metric: '6 个AI视频类爆款', badge: '新锐先锋' },
  { rank: 5, name: 'KiteWorks', role: '内容创作工具链', metric: '企业客户 3 家签约', badge: '企业伙伴' },
];

// ============================================================
// One-click deploy — framework targets
// ============================================================
export const DEPLOY_FRAMEWORKS = [
  { id: 'claude-code', name: 'Claude Code', short: 'CC', accent: '#d97757', cmd: (slug) => `npx opc add ${slug} --target claude-code`, downloadUrl: 'https://claude.ai/download' },
  { id: 'codex', name: 'Codex', short: 'Cx', accent: '#10a37f', cmd: (slug) => `npx opc add ${slug} --target codex`, downloadUrl: 'https://openai.com/index/codex/' },
  { id: 'cursor', name: 'Cursor', short: 'Cu', accent: '#6e9bff', cmd: (slug) => `npx opc add ${slug} --target cursor`, downloadUrl: 'https://cursor.sh' },
  { id: 'openclaw', name: 'OpenClaw', short: 'OC', accent: '#f59e0b', cmd: (slug) => `npx opc add ${slug} --target openclaw`, downloadUrl: 'https://openclaw.ai' },
  { id: 'hermes', name: 'Hermes', short: 'Hm', accent: '#22d3ee', cmd: (slug) => `npx opc add ${slug} --target hermes`, downloadUrl: 'https://hermes.ai' },
  { id: 'generic', name: '通用 / 更多', short: '··', accent: '#0d9488', cmd: (slug) => `npx opc pull ${slug}   # 下载 .skill.md，放入对应工具目录`, downloadUrl: '' },
];
