import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleField, useCountUp } from './ParticleField.jsx';
import { Brand, IconArrowRight, IconGitHub, IconTwitter, IconCheck, CategoryIcon, markSeen } from './shared.jsx';

const sw = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
const FeatIconCatalog = () => (<svg width="26" height="26" viewBox="0 0 24 24" {...sw}><path d="m21 8-9 4-9-4 9-4 9 4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></svg>);
const FeatIconDeploy = () => (<svg width="26" height="26" viewBox="0 0 24 24" {...sw}><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" /></svg>);
const FeatIconPlaza = () => (<svg width="26" height="26" viewBox="0 0 24 24" {...sw}><path d="M3 9h18l-1.4 9.3a2 2 0 0 1-2 1.7H6.4a2 2 0 0 1-2-1.7L3 9Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg>);
const FeatIconReward = () => (<svg width="26" height="26" viewBox="0 0 24 24" {...sw}><circle cx="12" cy="9" r="5" /><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5" /></svg>);

const FEATURES = [
  { Icon: FeatIconCatalog, title: 'Skills 集合', text: '三大分类能力目录，覆盖提示词、文生图、视频生成、写作分发与网页开发等场景，开箱即用。' },
  { Icon: FeatIconDeploy, title: '一键部署', text: '选择 Claude Code、Codex、Cursor 等框架，复制命令粘贴到终端即可安装，门槛最低。' },
  { Icon: FeatIconPlaza, title: 'OPC订单', text: '企业发布需求，创作者报名对接，从工单到交付，让好 Skill 直接变现。' },
  { Icon: FeatIconReward, title: '创作者激励', text: '楚楚先锋榜：榜单、官方推荐位与企业优先匹配，激励下一代 OPC 创业者。' },
];

// ============================================================
// Animated visuals — one per detailed feature section (no emoji,
// everything is SVG + CSS keyframes for a premium animated feel).
// ============================================================
const CAT_CARDS = [
  { t: 'AIGC', cat: 'AIGC', g: 'linear-gradient(140deg,#0d9488,#14b8a6)' },
  { t: '内容创作', cat: '内容创作', g: 'linear-gradient(140deg,#b7950b,#d97706)' },
  { t: 'vibe coding', cat: 'vibe coding', g: 'linear-gradient(140deg,#8b5cf6,#7c3aed)' },
];

function VisualCatalog() {
  return (
    <div className="lf-vis lf-vis--cards">
      {CAT_CARDS.map((c, i) => (
        <div className="lf-card" style={{ '--i': i }} key={c.t}>
          <span className="lf-card-icon" style={{ background: c.g }}><CategoryIcon category={c.cat} size={20} /></span>
          <span className="lf-card-t">{c.t}</span>
          <span className="lf-card-bar" />
        </div>
      ))}
    </div>
  );
}

const FRAMEWORKS = ['Claude Code', 'Codex', 'Cursor'];
function VisualDeploy() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % FRAMEWORKS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="lf-vis lf-vis--term">
      <div className="lf-term-tabs">
        {FRAMEWORKS.map((f, i) => (
          <span className={`lf-term-tab${i === active ? ' on' : ''}`} key={f}>{f}</span>
        ))}
      </div>
      <div className="lf-term-body">
        <p><span className="lf-term-prompt">$</span> npx opc add capsule-wardrobe</p>
        <p className="lf-term-dim">› 目标框架：{FRAMEWORKS[active]}</p>
        <p className="lf-term-dim">› 正在写入 skill 配置 …</p>
        <p className="lf-term-ok"><IconCheck size={13} /> 已安装到 {FRAMEWORKS[active]}</p>
        <p className="lf-term-cursor"><span className="lf-term-prompt">$</span> <span className="lf-caret" /></p>
      </div>
    </div>
  );
}

const PLAZA_ROWS = [
  { t: '电商客服话术自动化', budget: '¥8,000', status: '招募中', cls: 'open' },
  { t: '小红书种草内容批量产出', budget: '¥5,200', status: '已对接', cls: 'progress' },
  { t: '私域社群运营 SOP', budget: '¥12,000', status: '招募中', cls: 'open' },
];
function VisualPlaza() {
  return (
    <div className="lf-vis lf-vis--plaza">
      {PLAZA_ROWS.map((r, i) => (
        <div className="lf-plaza-row" style={{ '--i': i }} key={r.t}>
          <div className="lf-plaza-main">
            <span className="lf-plaza-t">{r.t}</span>
            <span className="lf-plaza-budget">预算 {r.budget}</span>
          </div>
          <span className={`lf-plaza-status lf-plaza-status--${r.cls}`}>{r.status}</span>
        </div>
      ))}
    </div>
  );
}

const BOARD_ROWS = [
  { n: 'RiverFlow', g: 'linear-gradient(140deg,#0d9488,#0f766e)', m: '14 个上架 · 下载 48k+' },
  { n: 'NeoLab', g: 'linear-gradient(140deg,#14b8a6,#0f766e)', m: '对接成功率 92%' },
  { n: 'AtlasChen', g: 'linear-gradient(140deg,#34d399,#059669)', m: '本月新增 6 个企业 Skill' },
];
function VisualReward() {
  return (
    <div className="lf-vis lf-vis--board">
      {BOARD_ROWS.map((r, i) => (
        <div className="lf-board-row" style={{ '--i': i }} key={r.n}>
          <span className={`lf-board-rank rank-${i + 1}`}>{i + 1}</span>
          <span className="lf-board-av" style={{ background: r.g }}>{r.n[0]}</span>
          <span className="lf-board-main"><b>{r.n}</b><i>{r.m}</i></span>
          <svg className="lf-board-medal" width="22" height="22" viewBox="0 0 24 24" {...sw}><circle cx="12" cy="9" r="5" /><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5" /></svg>
        </div>
      ))}
    </div>
  );
}

const DETAILS = [
  {
    key: 'catalog', no: '01', eyebrow: 'Skills 集合', Visual: VisualCatalog, flip: false,
    title: '一个目录，连接 AIGC、内容创作与 vibe coding',
    text: '我们把零散的 AI 能力沉淀成结构化的 Skill 目录：AIGC 覆盖提示词、文生图、视频生成与 AI 工具链；内容创作覆盖写作、脚本、排版与多平台分发；vibe coding 覆盖品牌官网、游戏网站、后台仪表盘、企业官网等网页开发场景。每个 Skill 都标注场景、分类与部署量，找得到、选得准。',
    points: ['AIGC / 内容创作 / vibe coding 三大分类，按场景快速定位', '统一描述与部署量，质量一目了然', '持续扩充的精选目录，开箱即用'],
  },
  {
    key: 'deploy', no: '02', eyebrow: '一键部署', Visual: VisualDeploy, flip: true,
    title: '复制一行命令，Skill 即刻就位',
    text: '不必再研究复杂的安装流程。选择你正在用的框架——Claude Code、Codex、Cursor、OpenClaw、Hermes——平台自动生成对应的安装命令，复制粘贴到终端即可完成部署，这是上手门槛最低的方式。',
    points: ['支持主流 Agent 框架，命令自动适配', '复制即用，无需手动配置路径', '部署前展示来源与权限，安全透明'],
  },
  {
    key: 'plaza', no: '03', eyebrow: 'OPC订单', Visual: VisualPlaza, flip: false,
    title: '让好 Skill 直接对接真实需求',
    text: '企业和团队在OPC订单发布真实诉求，标注预算与截止时间；创作者浏览后报名对接，从工单、沟通到交付形成闭环。这是把创作能力变现的最短路径。',
    points: ['企业发布需求，预算与状态清晰可见', '创作者报名对接，双向匹配', '从工单到交付的完整协作链路'],
  },
  {
    key: 'reward', no: '04', eyebrow: '创作者激励', Visual: VisualReward, flip: true,
    title: '楚楚先锋榜，激励下一代 OPC 创业者',
    text: '上传你的智能体即进入创作者激励计划：通过先锋榜、官方推荐位与企业优先匹配，让更多人用上你的创造，也让你的影响力沉淀为长期收益。',
    points: ['先锋榜与官方推荐位，放大优质作品', '企业需求优先匹配，机会先到先得', '社区关注与私信，沉淀你的协作圈'],
  },
];

function FeatureDetail({ item }) {
  const { Visual } = item;
  return (
    <section className={`lf-section${item.flip ? ' lf-section--flip' : ''}`}>
      <div className="lf-copy">
        <span className="lf-eyebrow"><span className="lf-no">{item.no}</span>{item.eyebrow}</span>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
        <ul className="lf-points">
          {item.points.map((p) => (
            <li key={p}><span className="lf-check"><IconCheck size={13} /></span>{p}</li>
          ))}
        </ul>
      </div>
      <div className="lf-visual-wrap"><Visual /></div>
    </section>
  );
}

const STEPS = [
  { n: '1', t: '发现', d: '在Skill广场按分类浏览，找到契合场景的智能体。' },
  { n: '2', t: '部署', d: '选择框架，复制生成的命令，粘贴到终端一键安装。' },
  { n: '3', t: '协作', d: '关注创作者、私信交流，或在OPC订单发布与对接。' },
  { n: '4', t: '变现', d: '上传作品进入激励计划，登上先锋榜，让创造产生收益。' },
];

export function LandingPage() {
  const navigate = useNavigate();

  function startAsGuest() {
    markSeen();
    navigate('/');
  }

  const nSkills = useCountUp(23);
  const nAuthors = useCountUp(5);
  const nDownloads = useCountUp(645);

  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden>
        <ParticleField count={56} linkDist={120} paintBg={false} className="landing-canvas" />
        <span className="landing-orb landing-orb--1" />
        <span className="landing-orb landing-orb--2" />
      </div>

      <div className="landing-content">
        <nav className="landing-nav">
          <Brand onClick={() => {}} />
          <div className="landing-nav-actions">
            <button type="button" className="btn--ghost" onClick={() => navigate('/login')}>登录</button>
            <button type="button" className="btn--secondary btn--sm" onClick={() => navigate('/register')}>注册</button>
          </div>
        </nav>

        <header className="landing-hero">
          <span className="landing-pill"><span className="dot" />面向 AI 智能体时代的 OPC 孵化平台</span>
          <h1 className="landing-title">
            汇聚荆楚智慧<br />
            <span className="text-gradient">开启智能体新篇章</span>
          </h1>
          <p className="landing-lead">
            楚楚智创汇集众智，提供好用的 AI 智能体集合与一键部署能力。无论你是本地企业还是 OPC 创业者，都能在这里发现、部署与协作。
          </p>
          <div className="landing-ctas">
            <button type="button" className="btn--primary" onClick={() => navigate('/register')}>免费注册</button>
            <button type="button" className="btn--secondary" onClick={() => navigate('/login')}>登录账户</button>
            <button type="button" className="landing-guest" onClick={startAsGuest}>
              访客直接开始 <span className="arrow"><IconArrowRight size={18} /></span>
            </button>
          </div>

          <div className="landing-metrics">
            <div className="landing-metric"><span className="num">{nSkills}+</span><span className="lbl">精选 Skills</span></div>
            <div className="landing-metric"><span className="num">{nAuthors}</span><span className="lbl">创作者</span></div>
            <div className="landing-metric"><span className="num">{nDownloads}k+</span><span className="lbl">累计部署</span></div>
          </div>
        </header>

        <section className="landing-features">
          <div className="landing-features-head">
            <h2>一个平台，连接<span className="text-gradient">AIGC</span>、<span className="text-gradient">内容创作</span>与<span className="text-gradient">vibe coding</span></h2>
            <p>从发现到部署，从需求到变现 —— 楚楚智创为下一代 AI 使用者降低每一道门槛。</p>
          </div>
          <div className="landing-feature-grid">
            {FEATURES.map((f, i) => (
              <article className="landing-feature" key={f.title} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="landing-feature-icon"><f.Icon /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Detailed alternating feature sections */}
        <div className="landing-details">
          {DETAILS.map((item) => <FeatureDetail key={item.key} item={item} />)}
        </div>

        {/* How it works */}
        <section className="landing-steps">
          <div className="landing-features-head">
            <h2>四步走进 <span className="text-gradient">楚楚智创</span></h2>
            <p>从第一次浏览到靠创作获得激励，整条路径清晰顺畅。</p>
          </div>
          <div className="landing-steps-grid">
            {STEPS.map((s, i) => (
              <div className="landing-step" key={s.n} style={{ '--i': i }}>
                <span className="landing-step-no">{s.n}</span>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
                {i < STEPS.length - 1 && <span className="landing-step-arrow" aria-hidden><IconArrowRight size={18} /></span>}
              </div>
            ))}
          </div>
        </section>

        <section className="landing-cta-band">
          <div className="landing-cta-inner">
            <h2>准备好开启你的智能体之旅了吗？</h2>
            <p>立即注册，或以访客身份开始浏览与部署智能体。</p>
            <div className="landing-ctas" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn--primary" onClick={() => navigate('/register')}>免费注册</button>
              <button type="button" className="landing-guest" onClick={startAsGuest}>
                访客直接开始 <span className="arrow"><IconArrowRight size={18} /></span>
              </button>
            </div>
          </div>
        </section>

        <footer className="app-footer" style={{ marginTop: 0 }}>
          <div className="footer-inner">
            <div className="footer-bottom" style={{ marginTop: 0, borderTop: 0, justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Brand /> <span className="footer-dot">·</span> &copy; {new Date().getFullYear()} 演示项目
              </span>
              <span style={{ display: 'inline-flex', gap: 10 }}>
                <span className="footer-social-icon" aria-label="GitHub"><IconGitHub /></span>
                <span className="footer-social-icon" aria-label="Twitter"><IconTwitter /></span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
