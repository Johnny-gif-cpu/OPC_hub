// ============================================================
// 楚楚智创 · OPC孵化器 — shared data (智能体, 分类, 部署配置)
// ============================================================

/** 三大分类 */
export const ALL_SKILL_CATEGORIES = ['AIGC', '内容创作', 'vibe coding'];

/** vibe coding 子分类 */
export const VIBE_CODING_SUBCATEGORIES = ['品牌官网', '游戏网站', '后台仪表盘', '企业官网', '电商页面', '博客模板', '小程序页面', 'H5活动页'];

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
  // ---- vibe coding ----
  { id: 's20', title: '品牌首页构建器', desc: '品牌官网首页一站式搭建方案，包含Hero区、功能介绍、CTA布局与现代响应式设计模板。', category: 'vibe coding', downloads: '29.3k', recommendedAgents: ['cursor'], subcategory: '品牌官网' },
  { id: 's21', title: '游戏网站快速原型', desc: '游戏官网/活动页快速原型方案：游戏展示区、下载引导、社区入口与新闻动态模块。', category: 'vibe coding', downloads: '21.7k', recommendedAgents: ['cursor', 'claude-code'], subcategory: '游戏网站' },
  { id: 's22', title: '后台仪表盘脚手架', desc: '数据仪表盘前端脚手架：图表面板、数据表格、侧边导航与用户管理界面模板。', category: 'vibe coding', downloads: '17.5k', recommendedAgents: ['cursor'], subcategory: '后台仪表盘' },
  { id: 's23', title: '企业官网生成器', desc: '企业官网多页面结构方案：关于我们、产品展示、新闻中心、联系表单一应俱全。', category: 'vibe coding', downloads: '26.1k', recommendedAgents: ['cursor', 'claude-code'], subcategory: '企业官网' },
];

const HOME_HOT_SKILL_IDS = ['s13', 's1', 's5', 's20', 's12'];
export const homeHotSkills = HOME_HOT_SKILL_IDS.map((id) => skills.find((s) => s.id === id)).filter(Boolean);

export const mySkills = [
  { title: '我的AI漫剧项目', category: 'AIGC', status: '已发布' },
  { title: '科普长文助手', category: '内容创作', status: '草稿' },
  { title: '品牌官网重构方案', category: 'vibe coding', status: '等待审核' },
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
// 算力中心 — 国产大模型
// ============================================================
export const computeModels = [
  { id: 'm1', name: '文心一言 4.0', provider: '百度', desc: '百度自研大语言模型，支持文本生成、对话、代码编写，中文理解能力领先。', tags: ['文本生成', '对话', '代码'], url: 'https://yiyan.baidu.com', logo: '文', logoColor: '#4E6EF2', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '文本生成', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.8', unit: '/万tokens', features: ['高级模型参数', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm2', name: '通义千问 2.5', provider: '阿里云', desc: '阿里云自研大模型，支持多轮对话、逻辑推理、文案创作，提供开源版本。', tags: ['文本生成', '多轮对话', '开源'], url: 'https://tongyi.aliyun.com', logo: '通', logoColor: '#FF6A00', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '文本生成', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.6', unit: '/万tokens', features: ['高级模型参数', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm3', name: '讯飞星火 4.0', provider: '科大讯飞', desc: '讯飞自研认知大模型，擅长语音交互、教育、办公场景，多模态能力突出。', tags: ['语音', '多模态', '教育'], url: 'https://xinghuo.xfyun.cn', logo: '星', logoColor: '#2B65F5', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '语音合成', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥1.0', unit: '/万tokens', features: ['多模态能力', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm4', name: '智谱 ChatGLM-4', provider: '智谱AI', desc: '清华系团队开源大模型，支持128K上下文，推理能力优异，学术与工业并重。', tags: ['开源', '长上下文', '推理'], url: 'https://open.bigmodel.cn', logo: '智', logoColor: '#3859F3', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '推理', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.5', unit: '/万tokens', features: ['长上下文', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm5', name: '百川 4.0', provider: '百川智能', desc: '王小川团队打造，搜索增强大模型，擅长知识问答与信息整合。', tags: ['搜索增强', '知识问答', '文本生成'], url: 'https://www.baichuan-ai.com', logo: '百', logoColor: '#1AAD19', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '搜索增强', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.7', unit: '/万tokens', features: ['高级搜索', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm6', name: 'MiniMax-abab7', provider: 'MiniMax', desc: '上海稀宇科技出品，支持长文本理解与多模态交互，海螺AI底层模型。', tags: ['多模态', '长文本', '对话'], url: 'https://www.minimaxi.com', logo: 'M', logoColor: '#8B5CF6', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '多模态', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.9', unit: '/万tokens', features: ['长文本', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm7', name: 'Moonshot v1', provider: '月之暗面', desc: '杨植麟团队出品，Kimi智能助手底层模型，专注长文档理解与问答。', tags: ['长文档', '问答', '上下文'], url: 'https://www.moonshot.cn', logo: '月', logoColor: '#A78BFA', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '长文档', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.6', unit: '/万tokens', features: ['超长文档', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm8', name: 'DeepSeek V3', provider: '深言科技', desc: '国产开源大模型标杆，代码与推理能力突出，训练成本极低。', tags: ['开源', '代码', '推理'], url: 'https://www.deepseek.com', logo: 'D', logoColor: '#4F46E5', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '代码生成', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.4', unit: '/万tokens', features: ['高级推理', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
  { id: 'm9', name: '腾讯混元', provider: '腾讯', desc: '腾讯自研大模型，覆盖文本、图像、视频等多模态场景，企业级应用。', tags: ['多模态', '企服', '视频'], url: 'https://hunyuan.tencent.com', logo: '混', logoColor: '#00C4C4', pricing: { free: { name: 'OPC免费额度', price: '0', quota: '1,000 tokens/月', features: ['基础对话', '多模态', 'OPC平台专属'] }, pro: { name: '专业版', price: '¥0.7', unit: '/万tokens', features: ['视频理解', '优先响应', 'API调用'] }, enterprise: { name: '企业版', price: '定制', unit: '', features: ['专属部署', '无限制调用', 'SLA保障'] } } },
];

// ============================================================
// OPC课程
// ============================================================
export const opcCourses = [
  { id: 'c1', title: 'OPC入门：从零到一', difficulty: '入门', duration: '2小时', desc: '了解OPC基本概念、应用场景与生态体系，快速上手第一Agent。', chapters: [
    { n: '课程1', title: '认识OPC生态', desc: '了解OPC平台的核心概念、架构与行业应用场景。' },
    { n: '课程2', title: '搭建开发环境', desc: '安装配置Node.js、MongoDB与开发工具链，准备就绪。' },
    { n: '课程3', title: '创建第一个Agent', desc: '从零编写一个可用的AI Agent，理解工具调用与提示词工程。' },
    { n: '课程4', title: '发布与分享', desc: '将你的Agent上传到OPC平台，让更多人使用。' },
  ]},
  { id: 'c2', title: 'Agent开发实战指南', difficulty: '中级', duration: '8小时', desc: '深入学习Agent架构设计、工具调用与多Agent协作，完成实战项目。', chapters: [
    { n: '课程1', title: 'Agent架构设计模式', desc: '掌握ReAct、Plan-Execute等主流Agent架构范式。' },
    { n: '课程2', title: '工具定义与调用', desc: '设计灵活的工具接口，实现Agent与外部系统的交互。' },
    { n: '课程3', title: '多Agent协作', desc: '编排多个Agent完成复杂任务：分工、通信与结果聚合。' },
    { n: '课程4', title: '实战：智能客服系统', desc: '综合运用所学，搭建一个多Agent智能客服系统。' },
  ]},
  { id: 'c3', title: '大模型微调与部署', difficulty: '高级', duration: '12小时', desc: '掌握LoRA/Q-LoRA微调技术，将开源模型部署到生产环境。', chapters: [
    { n: '课程1', title: '微调基础与数据准备', desc: '理解微调原理，构建高质量训练数据集。' },
    { n: '课程2', title: 'LoRA微调实战', desc: '使用LoRA技术高效微调大语言模型。' },
    { n: '课程3', title: '模型评估与优化', desc: '评估微调效果，进行推理优化与量化部署。' },
    { n: '课程4', title: '生产环境部署', desc: '将微调模型部署到GPU服务器，配置负载均衡与监控。' },
  ]},
  { id: 'c4', title: 'OPC平台运维最佳实践', difficulty: '中级', duration: '6小时', desc: '学习负载均衡、监控告警、成本优化等OPC平台运维核心技能。', chapters: [
    { n: '课程1', title: '容器化部署', desc: '使用Docker与K8s部署OPC服务，实现弹性伸缩。' },
    { n: '课程2', title: '监控与告警体系', desc: '搭建Prometheus+Grafana监控，设置智能告警规则。' },
    { n: '课程3', title: '成本优化策略', desc: 'GPU资源调度、模型缓存与请求合并，降低运营成本。' },
  ]},
  { id: 'c5', title: '企业级AI应用架构', difficulty: '高级', duration: '10小时', desc: '从需求分析到上线交付，完整的企业级AI应用开发流程。', chapters: [
    { n: '课程1', title: '需求分析与方案设计', desc: '将业务需求转化为AI技术方案，产出架构设计文档。' },
    { n: '课程2', title: 'RAG系统搭建', desc: '构建检索增强生成系统，连接企业知识库。' },
    { n: '课程3', title: '安全与权限控制', desc: '实现API鉴权、数据脱敏与内容安全审核。' },
    { n: '课程4', title: 'CI/CD与迭代交付', desc: '搭建AI应用的持续集成流水线，实现快速迭代。' },
  ]},
  { id: 'c6', title: 'AI安全与合规基础', difficulty: '入门', duration: '4小时', desc: '了解AI应用安全风险、数据隐私与合规要求，构建可信AI系统。', chapters: [
    { n: '课程1', title: 'AI安全威胁概览', desc: 'Prompt注入、数据泄露、模型投毒等常见安全风险。' },
    { n: '课程2', title: '数据隐私保护', desc: '个人信息保护法与数据安全法解读，隐私计算技术简介。' },
    { n: '课程3', title: '内容安全与审核', desc: '构建AI内容安全审核体系，防范有害内容生成。' },
  ]},
];

// ============================================================
// 政策栏 — 荆州相关政策
// ============================================================
export const localPolicies = [
  { id: 'p1', title: '荆州市数字经济发展三年行动方案（2024-2026）', dept: '荆州市人民政府', date: '2024-03-15', summary: '明确提出支持AI与大数据产业发展，建设数字荆州，为OPC企业提供税收优惠与创新补贴。', content: '本方案明确了荆州市2024至2026年数字经济发展的总体目标与重点任务。到2026年，全市数字经济核心产业增加值占GDP比重达到12%以上。方案提出建设荆州数字经济产业园、设立10亿元数字经济发展基金、对AI及大数据企业给予前三年免租、后两年减半的场地支持，企业所得税按15%优惠税率征收。同时，对OPC等创新平台企业，给予最高100万元的研发费用加计扣除补贴。方案还明确了人才引进、算力基础设施建设、数据要素市场化配置等配套措施，为荆州打造区域性数字经济发展高地提供了政策保障。' },
  { id: 'p2', title: '关于加快人工智能产业发展的若干措施', dept: '湖北省科学技术厅', date: '2024-06-01', summary: '对AI初创企业给予最高500万元研发补助，支持大模型训练与推理基础设施建设。', content: '本措施围绕人工智能技术创新、产业培育、生态构建三大方向，提出了一系列扶持政策。对在湖北省内注册的AI初创企业，按其上年度研发投入的30%给予补助，单个企业年度最高500万元。支持大模型训练与推理基础设施建设，对新建算力中心给予最高2000万元的建设补贴。鼓励高校与企业联合培养AI人才，设立AI专项奖学金，每年支持100名硕博研究生进入企业实习。同时，支持AI应用场景开放，政府各部门每年发布不少于50个AI应用场景需求，优先采购本地AI产品与服务。措施自发布之日起施行，有效期三年。' },
  { id: 'p3', title: '荆州市高层次人才引进与培养办法', dept: '荆州市委组织部', date: '2024-01-20', summary: 'AI领域高层次人才享受住房补贴、子女教育优待、创业启动资金等政策支持。', content: '本办法将AI、大数据、云计算等领域人才列为A类紧缺人才。A类人才来荆州工作的，给予50-200万元安家补贴，提供150平米以上人才公寓（前三年免租金）。子女就读公办中小学的，可在全市范围内择校。创业启动资金方面，A类人才领衔的项目经评审后，给予50-500万元的天使投资或无偿资助。同时设立"荆州英才卡"，持卡人享受医疗绿色通道、机场高铁贵宾厅等优待。对引才单位，每成功引进1名A类人才，给予10万元奖励。办法还建立了人才服务专员制度，为每位高层次人才配备专属服务团队。' },
  { id: 'p4', title: '湖北省算力基础设施建设规划（2025-2027）', dept: '湖北省发改委', date: '2025-01-10', summary: '规划在荆州建设区域算力中心，为本地OPC企业提供低成本高性能算力资源。', content: '规划提出"一核两翼多节点"的全省算力布局。其中荆州被定位为鄂西南算力节点城市，规划建设荆州智算中心（一期100P FLOPS算力，2025年底投运；二期扩容至500P，2027年完成）。中心建成后，可为本地OPC企业提供普惠算力，价格不超过市场价的60%。同时配套建设高速算力网络，荆州至武汉网络时延控制在5ms以内。规划还鼓励社会资本参与算力中心建设运营，给予不超过总投资30%的资金补助。到2027年，全省智能算力总规模达到3000P，其中荆州节点不低于500P，可满足本地及周边地区AI训练与推理需求。' },
  { id: 'p5', title: '关于促进OPC产业生态发展的指导意见', dept: '荆州市经信局', date: '2025-04-22', summary: '支持OPC平台建设与运营，鼓励企业上云用数赋智，打造荆州OPC产业集群。', content: '本意见是荆州市首个专门针对OPC（Open Platform for Creation）产业生态的指导性文件。意见明确将OPC产业纳入荆州市战略性新兴产业目录，享受与高新技术企业同等的优惠政策。对OPC平台运营企业，年度交易额超过1000万元的，按交易额的1%给予运营补贴，最高100万元。鼓励传统企业通过OPC平台实现数字化转型，对首次在OPC平台发布需求并完成对接的企业，给予5000元"上云"消费券。意见还提出建设OPC产业孵化基地，提供共享办公、路演厅、GPU算力等基础设施。到2027年目标：培育50家以上OPC生态企业，平台年度撮合交易额突破5亿元。' },
  { id: 'p6', title: '荆州市科技创新券管理办法', dept: '荆州市科技局', date: '2025-02-08', summary: '中小微企业可申领创新券，用于购买AI算力、技术咨询与培训服务，最高可抵扣50%。', content: '本办法建立了荆州市科技创新券制度，面向在荆州注册的中小微企业发放。每家企业每年可申领最高20万元的创新券，用于购买AI算力资源、技术咨询服务、参加OPC培训课程等。使用创新券时，企业自付50%，创新券抵扣50%。创新券采用"先申领、后使用、再兑付"的模式，服务机构凭创新券按季度向市科技局申请兑付。办法特别将OPC平台的技能培训课程纳入创新券适用范围，鼓励企业员工学习AI开发技能。同时建立了创新券使用的信用评价机制，对违规使用创新券的企业和服务机构，取消其申领或兑付资格，并纳入信用记录。' },
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
