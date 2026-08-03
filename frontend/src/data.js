// ============================================================
// Pandora X — shared data (skills, categories, deploy config)
// ============================================================

/** 日常 Skills 功能分类 */
export const DAILY_SKILL_CATEGORIES = ['美食', '交友', '穿搭', '旅游攻略'];
/** 企业 Skills 功能分类（数据字段仍为 commercial） */
export const COMMERCIAL_SKILL_CATEGORIES = ['社群工具', '账号流量', '内容创作', '产品设计', '主机代理'];
export const ALL_SKILL_CATEGORIES = [...DAILY_SKILL_CATEGORIES, ...COMMERCIAL_SKILL_CATEGORIES];

export const CATEGORY_EMOJI = {
  美食: '🍜', 交友: '🤝', 穿搭: '👗', 旅游攻略: '🧭',
  社群工具: '🌐', 账号流量: '📈', 内容创作: '🎬', 产品设计: '🧩', 主机代理: '🖥️',
};

export function skillKindLabel(kind) { return kind === 'daily' ? '日常' : '企业'; }

const ENTERPRISE_CORNER_LABEL = { 社群工具: '社群增长' };
export function cornerCategoryLabel(category, skillKind) {
  if (skillKind === 'commercial') return ENTERPRISE_CORNER_LABEL[category] || category;
  return category;
}
export function skillKindCornerLine(skill) {
  return `${skillKindLabel(skill.skillKind)} · ${cornerCategoryLabel(skill.category, skill.skillKind)}`;
}
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
  s1: 'home-recipe-muse', s2: 'shop-visit-notes', s3: 'takeout-ranking', s4: 'icebreaker-cards',
  s5: 'interest-intro', s6: 'capsule-wardrobe', s7: 'dress-code-lookup', s8: 'weekend-microtrip',
  s9: 'budget-travel-split', s10: 'community-coldstart', s11: 'group-rules-welcome', s12: 'account-topic-decode',
  s13: 'multi-platform-calendar', s14: 'short-video-script', s15: 'longform-outline', s16: 'prd-extractor',
  s17: 'user-journey-draft', s18: 'vps-route-compare', s19: 'proxy-port-memo',
};
export function skillSlug(skill) {
  return SKILL_SLUGS[skill.id] || `skill-${skillIdNumber(skill.id)}`;
}

export const skills = [
  { id: 's1', title: '今日私房菜灵感', desc: '根据冰箱食材与口味偏好，生成快手菜与营养小贴士。', category: '美食', skillKind: 'daily', downloads: '24.1k' },
  { id: 's2', title: '探店笔记生成器', desc: '把人均、菜系与亮点关键词整理成适合发社交平台的长图文骨架。', category: '美食', skillKind: 'daily', downloads: '11.3k' },
  { id: 's3', title: '外卖红黑榜摘要', desc: '从订单与评价里提炼「值得回购」和「避雷」要点，方便分享。', category: '美食', skillKind: 'daily', downloads: '18.6k' },
  { id: 's4', title: '破冰话题卡', desc: '按场景（同事/兴趣群/线下局）生成轻松不尬的聊天开场与接话。', category: '交友', skillKind: 'daily', downloads: '31.8k' },
  { id: 's5', title: '兴趣名片自我介绍', desc: '把爱好与性格关键词写成简短自我介绍，适合社群简介或活动签到。', category: '交友', skillKind: 'daily', downloads: '15.4k' },
  { id: 's6', title: '胶囊衣橱七日搭配', desc: '输入单品与场合，输出一周不重样的搭配思路与配饰建议。', category: '穿搭', skillKind: 'daily', downloads: '42.7k' },
  { id: 's7', title: '场合 Dress Code 速查', desc: '婚礼、面试、年会等场合的着装要点与常见踩雷提醒。', category: '穿搭', skillKind: 'daily', downloads: '19.5k' },
  { id: 's8', title: '周末微旅行路书', desc: '基于出发地与天数，生成松弛感行程、交通与打卡节奏建议。', category: '旅游攻略', skillKind: 'daily', downloads: '38.2k' },
  { id: 's9', title: '穷游预算拆分表', desc: '按交通/住宿/门票/餐饮自动分摊预算并给省钱优先级。', category: '旅游攻略', skillKind: 'daily', downloads: '12.6k' },
  { id: 's10', title: '社群冷启动 SOP', desc: '从拉新到首周活跃，输出可执行的任务清单与话术模板。', category: '社群工具', skillKind: 'commercial', downloads: '36.4k' },
  { id: 's11', title: '群规与自动欢迎文案', desc: '按社群主题生成群公告、入群欢迎语与常见违规示例说明。', category: '社群工具', skillKind: 'commercial', downloads: '22.1k' },
  { id: 's12', title: '账号选题与爆款拆解', desc: '给定赛道与对标账号，提炼选题角度与标题结构模式。', category: '账号流量', skillKind: 'commercial', downloads: '44.9k' },
  { id: 's13', title: '多平台发帖日历', desc: '按平台节奏生成一周内容排期与话题标签建议。', category: '账号流量', skillKind: 'commercial', downloads: '28.3k' },
  { id: 's14', title: '短视频脚本与镜头表', desc: '把卖点拆成钩子—展开—行动号召，并给出分镜与时长建议。', category: '内容创作', skillKind: 'commercial', downloads: '51.2k' },
  { id: 's15', title: '图文长帖大纲助手', desc: '从核心观点生成章节结构、金句位与配图占位说明。', category: '内容创作', skillKind: 'commercial', downloads: '33.7k' },
  { id: 's16', title: 'PRD 要点提炼器', desc: '把零散需求对话整理成目标、用户故事与验收要点草案。', category: '产品设计', skillKind: 'commercial', downloads: '29.8k' },
  { id: 's17', title: '用户旅程草稿生成', desc: '快速产出关键触点、情绪曲线与机会点的旅程图文字版。', category: '产品设计', skillKind: 'commercial', downloads: '17.1k' },
  { id: 's18', title: 'VPS 线路对比清单', desc: '按地区与用途对比延迟、带宽策略与常见套餐坑点。', category: '主机代理', skillKind: 'commercial', downloads: '14.5k' },
  { id: 's19', title: '代理端口与风控备忘', desc: '整理端口用途、安全组建议与合规使用注意项（演示文案）。', category: '主机代理', skillKind: 'commercial', downloads: '9.8k' },
];

const HOME_HOT_SKILL_IDS = ['s6', 's14', 's8', 's10', 's2', 's16', 's4', 's12', 's1'];
export const homeHotSkills = HOME_HOT_SKILL_IDS.map((id) => skills.find((s) => s.id === id)).filter(Boolean);

export const mySkills = [
  { title: '我的选题日历 Skill', category: '账号流量', skillKind: 'commercial', status: '已发布' },
  { title: '周末路书助手', category: '旅游攻略', skillKind: 'daily', status: '草稿' },
];

export const plazaRequests = [
  { id: 'q1', title: '需要「小红书探店」图文一键骨架 Skill', budget: '¥3k–8k', deadline: '2026-05-28', status: '招募中', category: '美食', publisher: '本地生活 MCN', summary: '输入店名、人均与亮点，输出标题、分段小标题与话题标签建议。' },
  { id: 'q2', title: '社群团购群促活 + 接龙话术', budget: '¥2k–5k', deadline: '2026-05-18', status: '招募中', category: '社群工具', publisher: '社区团购团队', summary: '按品类与档期生成早安提醒、开团话术与售后安抚模板。' },
  { id: 'q3', title: '抖音带货脚本批量生成', budget: '¥8k–15k', deadline: '2026-06-02', status: '已对接', category: '内容创作', publisher: '品牌代运营', summary: '对接 SKU 与卖点库，输出 15–60 秒多版本脚本与禁用词检查。' },
  { id: 'q4', title: '海外 VPS 选型咨询型 Skill', budget: '¥2k–4k', deadline: '2026-05-12', status: '已关闭', category: '主机代理', publisher: '独立开发者', summary: '根据业务地区与预算输出候选机房、线路与备份策略说明。' },
  { id: 'q5', title: '私域引流落地页文案 + A/B 标题', budget: '¥5k–12k', deadline: '2026-06-15', status: '招募中', category: '账号流量', publisher: 'SaaS 增长团队', summary: '输入产品一句话价值与受众，输出首屏文案与两套对照标题。' },
  { id: 'q6', title: 'B 端产品需求访谈纪要 → PRD 草案', budget: '¥10k–20k', deadline: '2026-05-25', status: '招募中', category: '产品设计', publisher: '企业服务初创', summary: '结构化整理访谈要点，并生成用户故事与里程碑验收表。' },
];

export const pioneerBoard = [
  { rank: 1, name: 'RiverFlow', role: '全栈 Skill 作者', metric: '贡献 14 个上架 Skills', badge: '金牌创作者' },
  { rank: 2, name: 'NeoLab', role: '企业内容方向', metric: '需求对接成功率 92%', badge: '增长顾问' },
  { rank: 3, name: 'AtlasChen', role: '自动化极客', metric: '累计下载 48k+', badge: '人气之星' },
  { rank: 4, name: 'Mira_7', role: '日常场景作者', metric: '6 个生活类爆款', badge: '新锐先锋' },
  { rank: 5, name: 'KiteWorks', role: '社群与工具链', metric: '企业客户 3 家签约', badge: '企业伙伴' },
];

// ============================================================
// One-click deploy — framework targets
// 命令为展示版；接真实 CLI 时只改此处。
// ============================================================
export const DEPLOY_FRAMEWORKS = [
  { id: 'claude-code', name: 'Claude Code', short: 'CC', accent: '#d97757', cmd: (slug) => `npx pandora add ${slug} --target claude-code` },
  { id: 'codex', name: 'Codex', short: 'Cx', accent: '#10a37f', cmd: (slug) => `npx pandora add ${slug} --target codex` },
  { id: 'cursor', name: 'Cursor', short: 'Cu', accent: '#6e9bff', cmd: (slug) => `npx pandora add ${slug} --target cursor` },
  { id: 'openclaw', name: 'OpenClaw', short: 'OC', accent: '#f59e0b', cmd: (slug) => `npx pandora add ${slug} --target openclaw` },
  { id: 'hermes', name: 'Hermes', short: 'Hm', accent: '#22d3ee', cmd: (slug) => `npx pandora add ${slug} --target hermes` },
  { id: 'generic', name: '通用 / 更多', short: '··', accent: '#a78bfa', cmd: (slug) => `npx pandora pull ${slug}   # 下载 .skill.md，放入对应工具目录` },
];
