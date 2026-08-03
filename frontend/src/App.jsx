import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { HomeHeroVisual } from './HomeHeroVisual.jsx';
import { LandingPage } from './LandingPage.jsx';
import { DeployPanel } from './DeployPanel.jsx';
import {
  Brand, Footer, getSession, clearSession, setSession, hasSeen, markSeen, SESSION_KEY,
  IconExplore, IconBox, IconBounty, IconMedal, IconUser, IconChevronDown,
  IconBolt, IconDownload, ShareIcon, CategoryIcon,
} from './shared.jsx';
import { api, useAsync } from './api.js';
import { SocialProvider, SocialDock, ChatLayer } from './Social.jsx';
import {
  skills as fallbackSkills, homeHotSkills as fallbackHot,
  plazaRequests as fallbackRequests, pioneerBoard as fallbackPioneers,
  DAILY_SKILL_CATEGORIES, COMMERCIAL_SKILL_CATEGORIES, ALL_SKILL_CATEGORIES,
  skillKindLabel, skillKindCornerLine, skillIdNumber, parseDownloads, skillSlug,
} from './data.js';

// ============================================================
// Nav links (shared by sidebar + topnav)
// ============================================================
const NAV_LINKS = [
  { path: '/', label: '首页', icon: IconExplore },
  { path: '/browse', label: 'Pandora Box', icon: IconBox },
  { path: '/requests', label: '需求广场', icon: IconBounty },
  { path: '/pioneer', label: 'Pandora X 先锋', icon: IconMedal },
  { path: '/profile', label: '个人中心', icon: IconUser },
];

// ============================================================
// UserMenu — avatar dropdown
// ============================================================
function UserMenu({ session }) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initial = session?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div ref={ref} className="user-menu">
      <button type="button" className="btn--icon" onClick={() => setOpen((v) => !v)} aria-label="账户菜单">
        <span style={{ fontWeight: 800 }}>{initial}</span>
      </button>
      {open && (
        <div className="user-menu-panel">
          {session ? (
            <>
              <div className="user-menu-head">
                <div className="email">{session.email}</div>
                <div className="status">已登录</div>
              </div>
              <button type="button" className="dropdown-item" onClick={() => { navigate('/profile'); setOpen(false); }}>个人中心</button>
              <button type="button" className="dropdown-item" onClick={() => { navigate('/my-skills'); setOpen(false); }}>我的 Skills</button>
              <button type="button" className="dropdown-item" style={{ color: '#fca5a5' }} onClick={() => { api.logout(); clearSession(); setOpen(false); navigate('/'); }}>退出登录</button>
            </>
          ) : (
            <>
              <button type="button" className="dropdown-item" onClick={() => { navigate('/login'); setOpen(false); }}>登录</button>
              <button type="button" className="dropdown-item" onClick={() => { navigate('/register'); setOpen(false); }}>注册</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// AppSidebar
// ============================================================
function AppSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /></div>
      <nav className="side-links">
        {NAV_LINKS.map((link) => (
          <button key={link.path} type="button" className={`side-link${pathname === link.path ? ' active' : ''}`} onClick={() => navigate(link.path)}>
            <link.icon active={pathname === link.path} />
            {link.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-cta">
        <p>有好用的 Skill？上传分享，加入创作者激励计划。</p>
        <button type="button" className="btn--primary btn--sm btn--full" onClick={() => navigate('/upload')}>上传 Skill</button>
      </div>
      <SocialDock />
    </aside>
  );
}

// ============================================================
// TopNav — for shell pages (browse/detail/requests/pioneer/etc.)
// ============================================================
function TopNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const session = getSession();
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Brand />
        <nav className="topnav-links">
          {NAV_LINKS.map((l) => (
            <button key={l.path} type="button" className={`topnav-link${pathname === l.path ? ' active' : ''}`} onClick={() => navigate(l.path)}>{l.label}</button>
          ))}
        </nav>
        <div className="topnav-spacer" />
        <div className="topnav-actions">
          {!session && <button type="button" className="btn--ghost btn--sm" onClick={() => navigate('/login')}>登录</button>}
          {!session && <button type="button" className="btn--primary btn--sm" onClick={() => navigate('/register')}>注册</button>}
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Shell — TopNav + content + footer
// ============================================================
function Shell({ children, title, subtitle, badge, action }) {
  return (
    <div className="page">
      <TopNav />
      <div className="shell-wrap">
        {(title || action) && (
          <section className="page-hero">
            <div className="page-hero-copy">
              {badge && <p className="badge">{badge}</p>}
              {title && <h1>{title}</h1>}
              {subtitle && <p className="hero-text">{subtitle}</p>}
            </div>
            {action && <div className="topnav-actions">{action}</div>}
          </section>
        )}
        {children}
      </div>
      <Footer />
    </div>
  );
}

// ============================================================
// SkillCard — shared card
// ============================================================
function SkillCard({ skill }) {
  const navigate = useNavigate();
  return (
    <article className={`skill-card skill-card--hover-actions skill-card--${skill.skillKind}`}>
      <div className="skill-top">
        <span className="tag skill-corner-tag">{skillKindCornerLine(skill)}</span>
        <span className="downloads"><IconDownload /> {skill.downloads}</span>
      </div>
      <h3>{skill.title}</h3>
      <p>{skill.desc}</p>
      <div className="card-actions">
        <button type="button" className="btn--primary btn--sm" onClick={() => navigate(`/skill/${skill.id}`)}><IconBolt size={14} /> 部署</button>
        <button type="button" className="btn--ghost btn--sm" onClick={() => navigate(`/skill/${skill.id}`)}>详情</button>
        <button type="button" className="ghost icon-only" style={{ marginLeft: 'auto' }} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/skill/${skill.id}`)} aria-label="复制分享链接" title="复制分享链接"><ShareIcon /></button>
      </div>
    </article>
  );
}

// ============================================================
// Small UI helpers for async states
// ============================================================
function SkillGridSkeleton({ count = 8 }) {
  return (
    <section className="grid grid--4">
      {Array.from({ length: count }).map((_, i) => (
        <article className="skill-card skill-card--skeleton" key={i} aria-hidden>
          <div className="sk-line sk-tag" />
          <div className="sk-line sk-title" />
          <div className="sk-line" />
          <div className="sk-line sk-short" />
        </article>
      ))}
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="surface-card empty-state">
      <span className="empty-icon" aria-hidden>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21 8-9 4-9-4 9-4 9 4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" />
        </svg>
      </span>
      <p>{text}</p>
    </div>
  );
}

// ============================================================
// HomePage
// ============================================================
function HomePage() {
  const navigate = useNavigate();
  const session = getSession();
  const [recommendMode, setRecommendMode] = React.useState('hot');
  const [kindFilter, setKindFilter] = React.useState('all');
  const [kindFilterOpen, setKindFilterOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const dropdownRef = React.useRef(null);

  // Load the full catalog from the backend (fallback to bundled data if offline).
  const { data: skills, loading } = useAsync(() => api.listSkills(), [], fallbackSkills);

  React.useEffect(() => {
    function handleClickOutside(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setKindFilterOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const kindFilterLabel = kindFilter === 'all' ? '全部' : kindFilter === 'daily' ? '日常' : '企业';

  const featuredSkills = React.useMemo(() => {
    const list = skills || [];
    const base = recommendMode === 'hot'
      ? list.filter((s) => s.isHot ?? fallbackHot.some((h) => h.id === s.id))
      : [...list].sort((a, b) => skillIdNumber(b.id) - skillIdNumber(a.id)).slice(0, 12);
    const pool = (recommendMode === 'hot' && base.length === 0) ? list : base;
    const kindFiltered = kindFilter === 'all' ? pool : pool.filter((s) => s.skillKind === kindFilter);
    if (recommendMode === 'hot') return [...kindFiltered].sort((a, b) => parseDownloads(b.downloads) - parseDownloads(a.downloads)).slice(0, 12);
    return kindFiltered;
  }, [skills, recommendMode, kindFilter]);

  const categoryCounts = React.useMemo(() => {
    const m = {};
    (skills || []).forEach((s) => { m[s.category] = (m[s.category] || 0) + 1; });
    return m;
  }, [skills]);

  function submitSearch(e) {
    e.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/browse?q=${encodeURIComponent(term)}` : '/browse');
  }

  return (
    <div className="page page--home">
      <div className="app-layout">
        <AppSidebar />
        <main className="home-main">
          <div className="home-topbar">
            <form className="home-search" onSubmit={submitSearch} role="search">
              <span className="home-search-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              </span>
              <input
                type="search"
                className="home-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索 Skills、分类或场景关键词…"
                aria-label="搜索 Skills"
              />
              <button type="submit" className="home-search-go">搜索</button>
            </form>
            <div className="home-topbar-actions">
              {!session && <button type="button" className="btn--ghost btn--sm" onClick={() => navigate('/login')}>登录</button>}
              {!session && <button type="button" className="btn--primary btn--sm" onClick={() => navigate('/register')}>注册</button>}
              <UserMenu session={session} />
            </div>
          </div>

          <section className="home-hero-pro">
            <div className="home-hero-aurora" aria-hidden />
            <div className="home-hero-inner">
              <div className="hero-copy">
                <p className="badge">AI Skills Platform</p>
                <h1 className="home-hero-title">
                  <span className="home-hero-title-line">发现并一键部署</span>
                  <span className="home-hero-title-gradient">日常 · 企业 Skills</span>
                </h1>
                <p className="home-hero-lead">覆盖生活灵感与增长交付：浏览、部署、上传与分享，一套平台连接日常与企业场景。</p>
                <div className="hero-actions">
                  <button type="button" className="btn--primary" onClick={() => navigate('/browse')}>开始浏览 Skills</button>
                  <button type="button" className="btn--secondary" onClick={() => navigate('/upload')}>我是开发者，上传 Skill</button>
                </div>
                <ul className="home-hero-chips" aria-label="亮点">
                  <li>实时能力目录</li>
                  <li>日常 / 企业双轨</li>
                  <li>一键复制部署</li>
                </ul>
              </div>
              <aside className="hero-showcase"><HomeHeroVisual /></aside>
            </div>
          </section>

          {/* Category quick entry */}
          <section className="section-header"><h2>按分类探索</h2></section>
          <section className="grid grid--4">
            {ALL_SKILL_CATEGORIES.map((cat) => (
              <div key={cat} className="cat-card" onClick={() => navigate(`/browse?category=${encodeURIComponent(cat)}`)} role="button" tabIndex={0}>
                <span className="cat-icon"><CategoryIcon category={cat} size={24} /></span>
                <span className="cat-name">{cat}</span>
                <span className="cat-meta">{DAILY_SKILL_CATEGORIES.includes(cat) ? '日常' : '企业'} · {categoryCounts[cat] || 0} 个</span>
              </div>
            ))}
          </section>

          <section className="section-header" style={{ alignItems: 'center' }}>
            <h2>热门推荐</h2>
            <div className="section-filters">
              <div className="dropdown-wrapper" ref={dropdownRef}>
                <button type="button" className="dropdown-trigger" onClick={() => setKindFilterOpen(!kindFilterOpen)}>{kindFilterLabel}<IconChevronDown /></button>
                {kindFilterOpen && (
                  <div className="dropdown-menu">
                    <button type="button" className={`dropdown-item ${kindFilter === 'all' ? 'active' : ''}`} onClick={() => { setKindFilter('all'); setKindFilterOpen(false); }}>全部</button>
                    <button type="button" className={`dropdown-item ${kindFilter === 'daily' ? 'active' : ''}`} onClick={() => { setKindFilter('daily'); setKindFilterOpen(false); }}>日常</button>
                    <button type="button" className={`dropdown-item ${kindFilter === 'commercial' ? 'active' : ''}`} onClick={() => { setKindFilter('commercial'); setKindFilterOpen(false); }}>企业</button>
                  </div>
                )}
              </div>
              <div className="segmented" role="group" aria-label="排序方式">
                <button type="button" className={`seg ${recommendMode === 'hot' ? 'active' : ''}`} onClick={() => setRecommendMode('hot')}>热门</button>
                <button type="button" className={`seg ${recommendMode === 'latest' ? 'active' : ''}`} onClick={() => setRecommendMode('latest')}>最新</button>
              </div>
            </div>
          </section>
          {loading ? <SkillGridSkeleton count={8} /> : (
            <section className="grid grid--4">
              {featuredSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
            </section>
          )}

          <section className="section-header"><h2>小白入门区</h2></section>
          <section className="grid grid--4">
            {['什么是 Pandora X？', '如何安装第一个框架？', '如何一键部署 Skill？'].map((item) => (
              <article className="skill-card" key={item}><h3>{item}</h3><p>面向新用户的分步骤指引，帮助你快速上手。</p></article>
            ))}
            <article className="skill-card">
              <h3>开始学习</h3>
              <p>从新手教程开始，5 分钟了解核心流程。</p>
              <div className="card-actions"><button type="button" className="btn--secondary btn--sm" onClick={() => navigate('/browse')}>查看新手教程</button></div>
            </article>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

// ============================================================
// BrowsePage
// ============================================================
function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('category');
  const term = (searchParams.get('q') || '').trim();
  const activeCategory = q && ALL_SKILL_CATEGORIES.includes(q) ? q : '全部';

  const { data: skills, loading } = useAsync(
    () => api.listSkills(activeCategory === '全部' ? {} : { category: activeCategory }),
    [activeCategory],
    fallbackSkills,
  );
  const termLower = term.toLowerCase();
  const filtered = (skills || []).filter((s) => {
    if (!term) return true;
    return [s.title, s.desc, s.category, s.author]
      .filter(Boolean)
      .some((f) => String(f).toLowerCase().includes(termLower));
  });

  function setCategory(cat) {
    const next = {};
    if (cat !== '全部') next.category = cat;
    if (term) next.q = term;
    setSearchParams(next, { replace: true });
  }

  function clearSearch() {
    const next = {};
    if (activeCategory !== '全部') next.category = activeCategory;
    setSearchParams(next, { replace: true });
  }

  const activeSample = filtered.find((s) => s.category === activeCategory) || null;
  const titleHead = term
    ? `搜索 “${term}”`
    : activeCategory === '全部'
      ? '全部 Skills'
      : activeSample ? `${activeCategory} · ${skillKindLabel(activeSample.skillKind)} Skills` : `${activeCategory} Skills`;

  return (
    <Shell
      badge="Skills Directory"
      title={titleHead}
      subtitle={term ? `在全部 Skills 中按关键词匹配名称、描述、分类与作者，共 ${filtered.length} 个结果。` : '浏览全部 Pandora X Skills；用下方分类标签快速筛选，点击卡片即可一键部署。'}
      action={<button type="button" className="btn--secondary" onClick={() => navigate('/upload')}>上传 Skill</button>}
    >
      {term && (
        <div className="browse-search-tag">
          <span>关键词：<b>{term}</b></span>
          <button type="button" onClick={clearSearch} aria-label="清除搜索">清除 ✕</button>
        </div>
      )}
      <section className="filter-bar">
        <button type="button" className={`filter-pill ${activeCategory === '全部' ? 'active' : ''}`} onClick={() => setCategory('全部')}>全部</button>
        <div className="filter-group">
          <span className="filter-group-label">日常</span>
          {DAILY_SKILL_CATEGORIES.map((cat) => (
            <button key={cat} type="button" className={`filter-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-group-label">企业</span>
          {COMMERCIAL_SKILL_CATEGORIES.map((cat) => (
            <button key={cat} type="button" className={`filter-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
      </section>
      {loading ? <SkillGridSkeleton count={8} /> : filtered.length === 0 ? (
        <EmptyState text="该分类下暂时还没有 Skill，换个分类看看吧。" />
      ) : (
        <section className="grid grid--4">
          {filtered.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
        </section>
      )}
    </Shell>
  );
}

// ============================================================
// SkillDetailPage — with DeployPanel
// ============================================================
function SkillDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: skill, loading, error } = useAsync(
    () => api.getSkill(id),
    [id],
    fallbackSkills.find((item) => item.id === id) || null,
  );
  const [linkCopied, setLinkCopied] = React.useState(false);
  const shareUrl = `${window.location.origin}/skill/${id}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  }

  if (loading && !skill) {
    return <Shell action={<button type="button" className="btn--ghost" onClick={() => navigate(-1)}>← 返回</button>}><div className="surface-card detail-card"><div className="sk-line sk-title" /><div className="sk-line" /><div className="sk-line sk-short" /></div></Shell>;
  }
  if (!skill) {
    if (error && error.status === 404) return <Navigate to="/browse" replace />;
    return <Shell action={<button type="button" className="btn--ghost" onClick={() => navigate(-1)}>← 返回</button>}><EmptyState text="未找到该 Skill，可能已下架。" /></Shell>;
  }

  return (
    <Shell action={<button type="button" className="btn--ghost" onClick={() => navigate(-1)}>← 返回</button>}>
      <section className="detail-grid">
        <div className="surface-card detail-card">
          <div className="detail-card-header">
            <span className="tag skill-corner-tag" style={skill.skillKind === 'daily' ? { background: 'rgba(34,211,238,0.14)', color: '#67e8f9' } : { background: 'rgba(232,121,249,0.14)', color: '#f0abfc' }}>
              {skillKindLabel(skill.skillKind)} · {skill.category}
            </span>
            <span className="downloads"><IconDownload /> {skill.downloads} 下载</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', margin: '0 0 8px' }}>{skill.title}</h1>
          <p className="detail-card-desc" style={{ margin: '8px 0 0' }}>{skill.desc}</p>
          <hr className="divider" />
          <div className="detail-card-meta">
            <div className="detail-meta-item"><span className="detail-meta-label">功能分类</span><strong>{skill.category}</strong></div>
            <div className="detail-meta-item"><span className="detail-meta-label">Skill ID</span><strong>{skill.slug || skillSlug(skill)}</strong></div>
          </div>
          <div className="detail-card-actions">
            <button type="button" className="btn--secondary" onClick={copyLink}>{linkCopied ? '已复制链接' : '复制分享链接'}</button>
            <button type="button" className="btn--ghost" onClick={() => navigate('/browse')}>浏览更多</button>
          </div>
          <p className="share-line">{shareUrl}</p>
        </div>
        <DeployPanel skill={skill} />
      </section>
    </Shell>
  );
}

// ============================================================
// RequestsPlazaPage
// ============================================================
function requestStatusClass(status) {
  if (status === '招募中') return 'status-open';
  if (status === '已对接') return 'status-progress';
  return 'status-done';
}

function RequestsPlazaPage() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState('全部');
  const statusFilters = ['全部', '招募中', '已对接', '已关闭'];
  const { data: requests, loading } = useAsync(
    () => api.listRequests(status === '全部' ? {} : { status }),
    [status],
    fallbackRequests,
  );
  const filtered = requests || [];

  return (
    <Shell
      badge="Request Board · Demo"
      title="需求广场"
      subtitle="企业或团队发布需求，开发者浏览后报名对接。后续可接工单、合同与交付里程碑（演示数据）。"
      action={<button type="button" className="btn--secondary" onClick={() => navigate('/upload')}>我有 Skill，去上传</button>}
    >
      <section className="filter-bar">
        {statusFilters.map((item) => (
          <button key={item} type="button" className={`filter-pill ${status === item ? 'active' : ''}`} onClick={() => setStatus(item)}>{item}</button>
        ))}
      </section>
      {loading ? (
        <section className="grid grid--3">
          {Array.from({ length: 6 }).map((_, i) => (
            <article className="skill-card skill-card--skeleton" key={i} aria-hidden><div className="sk-line sk-tag" /><div className="sk-line sk-title" /><div className="sk-line" /><div className="sk-line sk-short" /></article>
          ))}
        </section>
      ) : filtered.length === 0 ? (
        <EmptyState text="该状态下暂无需求。" />
      ) : (
        <section className="grid grid--3">
          {filtered.map((req) => (
            <article className="skill-card" key={req.id}>
              <div className="skill-top">
                <span className="tag">{req.category}</span>
                <span className={`tag ${requestStatusClass(req.status)}`}>{req.status}</span>
              </div>
              <h3>{req.title}</h3>
              <p>{req.summary}</p>
              <div className="request-meta">
                <span><strong>预算</strong> {req.budget}</span>
                <span><strong>截止</strong> {req.deadline}</span>
              </div>
              <p className="subtitle" style={{ marginTop: 12, fontSize: '0.84rem' }}>{req.publisher}</p>
              <div className="card-actions">
                <button type="button" className="btn--primary btn--sm" onClick={() => navigate('/browse')}>查看相关 Skills</button>
                <button type="button" className="btn--ghost btn--sm">报名对接</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </Shell>
  );
}

// ============================================================
// PioneerPage
// ============================================================
function PioneerPage() {
  const { data: pioneers } = useAsync(() => api.listPioneers(), [], fallbackPioneers);
  const board = pioneers || [];
  return (
    <Shell badge="Pioneer Program · Demo" title="Pandora X 先锋" subtitle="面向深度贡献者与行业专家的成长计划：榜单、活动与优先对接权。当前页面为产品演示。">
      <section className="pioneer-banner">
        <p className="badge">先锋计划</p>
        <h2>成为下一代 Pandora X 生态的共建者</h2>
        <p className="hero-text" style={{ marginBottom: 0 }}>先锋成员可获得官方推荐位、企业需求优先匹配，以及季度线下闭门交流（演示文案）。</p>
        <div className="pioneer-stats">
          <div><span>累计先锋</span><strong>128</strong></div>
          <div><span>本月活跃</span><strong>42</strong></div>
          <div><span>企业对接</span><strong>19</strong></div>
        </div>
      </section>

      <section className="section-header"><h2>本月先锋榜</h2><p className="subtitle">按贡献度、下载与对接质量综合排序（演示）。</p></section>
      <div className="rank-list">
        {board.map((p) => (
          <div className="rank-row" key={p.name}>
            <span className="rank-num">{p.rank}</span>
            <span className="rank-avatar">{p.name.charAt(0)}</span>
            <div>
              <strong>{p.name}</strong>
              <p className="subtitle" style={{ margin: '4px 0 0', fontSize: '0.84rem' }}>{p.role} · {p.metric}</p>
            </div>
            <span className="tag">{p.badge}</span>
          </div>
        ))}
      </div>

      <section className="section-header"><h2>先锋任务（示例）</h2></section>
      <section className="grid grid--3">
        {[
          { t: '完成 1 个日常或企业 Skill 上架', d: '通过审核并收获 50+ 部署。' },
          { t: '参与 1 次需求对接', d: '在需求广场完成一次成功交付记录。' },
          { t: '撰写 Pandora X 实践案例', d: '分享真实业务落地故事，择优官方转载。' },
        ].map((item) => (
          <article className="skill-card" key={item.t}>
            <h3>{item.t}</h3>
            <p>{item.d}</p>
            <div className="card-actions"><button type="button" className="btn--ghost btn--sm">查看细则</button></div>
          </article>
        ))}
      </section>
    </Shell>
  );
}

// ============================================================
// Login gate (for upload / my-skills when not logged in)
// ============================================================
function LoginGate({ title, desc }) {
  const navigate = useNavigate();
  return (
    <div className="surface-card gate">
      <div className="gate-icon" aria-hidden>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="11" rx="2.2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.4" />
        </svg>
      </div>
      <h2 style={{ marginBottom: 10 }}>{title}</h2>
      <p className="hero-text" style={{ marginBottom: 24 }}>{desc}</p>
      <div className="topnav-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn--primary" onClick={() => navigate('/login')}>登录</button>
        <button type="button" className="btn--secondary" onClick={() => navigate('/register')}>注册</button>
      </div>
    </div>
  );
}

// ============================================================
// UploadPage
// ============================================================
function UploadPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState(DAILY_SKILL_CATEGORIES[0]);
  const [desc, setDesc] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [msgType, setMsgType] = React.useState('info');
  const [submitting, setSubmitting] = React.useState(false);

  const skillKind = COMMERCIAL_SKILL_CATEGORIES.includes(category) ? 'commercial' : 'daily';

  async function submit(e) {
    e.preventDefault();
    if (!session) return setMsg('请先登录后再上传');
    setSubmitting(true);
    setMsg('');
    try {
      const res = await api.uploadSkill({ title: name.trim(), category, description: desc.trim(), skillKind });
      setMsgType('success');
      setMsg(res.message || '已提交');
      setName(''); setDesc('');
      setTimeout(() => navigate('/my-skills'), 900);
    } catch (err) {
      setMsgType('error');
      setMsg(err.message || '上传失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return <Shell badge="Upload" title="上传 Skill"><LoginGate title="登录后即可上传" desc="发布与上传 Skill 需要登录账户；浏览与部署对访客开放。" /></Shell>;
  }

  return (
    <Shell badge="Upload" title="填写 Skill 信息" subtitle="选择日常或企业下的功能分类，填写名称与描述。提交后将保存为草稿，出现在「我的 Skills」。" action={<button type="button" className="btn--ghost" onClick={() => navigate('/browse')}>浏览 Skills</button>}>
      <form className="surface-card upload-form" onSubmit={submit}>
        <label>Skill 名称<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：周末路书助手" required /></label>
        <label>功能分类
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <optgroup label="日常 Skills">{DAILY_SKILL_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</optgroup>
            <optgroup label="企业 Skills">{COMMERCIAL_SKILL_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</optgroup>
          </select>
        </label>
        <label>简介<textarea rows="4" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="介绍这个 skill 的用途" required /></label>
        <label>上传附件<input type="file" /></label>
        <button type="submit" className="btn--primary" disabled={submitting}>{submitting ? '提交中...' : '提交 Skill'}</button>
        {msg && <p className="auth-form-msg" style={msgStyle(msgType)}>{msg}</p>}
      </form>
    </Shell>
  );
}

// ============================================================
// MySkillsPage
// ============================================================
function MySkillsPage() {
  const navigate = useNavigate();
  const session = getSession();
  const { data: mine, loading } = useAsync(() => (session ? api.mySkills() : Promise.resolve([])), [!!session], []);
  if (!session) {
    return <Shell badge="My Skills" title="我的 Skill"><LoginGate title="登录后查看你的 Skills" desc="登录账户即可管理你上传的 Skills 与发布状态。" /></Shell>;
  }
  const list = mine || [];
  return (
    <Shell badge="My Skills" title="我的 Skill" subtitle="查看你上传的 Skill 与发布状态。" action={<><button type="button" className="btn--secondary btn--sm" onClick={() => navigate('/browse')}>浏览 Skills</button><button type="button" className="btn--primary btn--sm" onClick={() => navigate('/upload')}>上传 Skill</button></>}>
      {loading ? (
        <section className="grid grid--3">
          {Array.from({ length: 3 }).map((_, i) => <article className="skill-card skill-card--skeleton" key={i} aria-hidden><div className="sk-line sk-tag" /><div className="sk-line sk-title" /><div className="sk-line sk-short" /></article>)}
        </section>
      ) : list.length === 0 ? (
        <EmptyState text="你还没有上传任何 Skill。点击右上角「上传 Skill」开始创作吧。" />
      ) : (
        <section className="grid grid--3">
          {list.map((skill) => (
            <article className="skill-card" key={skill.id}>
              <div className="skill-top">
                <span className="tag skill-corner-tag">{skillKindCornerLine(skill)}</span>
                <span className="downloads">{skill.status}</span>
              </div>
              <h3>{skill.title}</h3>
              <p>{skill.desc}</p>
              <div className="card-actions">
                <button type="button" className="btn--ghost btn--sm" onClick={() => navigate(`/skill/${skill.id}`)}>查看详情</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </Shell>
  );
}

// ============================================================
// ProfilePage
// ============================================================
function ProfilePage() {
  const navigate = useNavigate();
  const session = getSession();
  const { data: mine } = useAsync(() => (session ? api.mySkills() : Promise.resolve([])), [!!session], []);
  if (!session) {
    return <Shell badge="Account" title="个人中心"><LoginGate title="登录查看个人中心" desc="登录后查看账户信息、我的 Skills 与创作数据。浏览与部署无需登录。" /></Shell>;
  }
  const list = mine || [];
  const publishedCount = list.filter((s) => s.status === '已发布').length;
  const initial = session.email.charAt(0).toUpperCase();
  return (
    <Shell badge="Account" title="个人中心">
      <section className="surface-card profile-head">
        <div className="profile-avatar">{initial}</div>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>{session.email}</h2>
          <p className="subtitle" style={{ marginTop: 4 }}>已登录 · Pandora X 创作者</p>
        </div>
        <button type="button" className="btn--secondary btn--sm" style={{ marginLeft: 'auto' }} onClick={() => { api.logout(); clearSession(); navigate('/'); }}>退出登录</button>
      </section>

      <section className="profile-stat-grid">
        <div className="surface-card profile-stat"><span className="num">{list.length}</span><span className="lbl">我的 Skills</span></div>
        <div className="surface-card profile-stat"><span className="num">{publishedCount}</span><span className="lbl">已发布</span></div>
        <div className="surface-card profile-stat"><span className="num">0</span><span className="lbl">需求对接</span></div>
        <div className="surface-card profile-stat"><span className="num">新锐</span><span className="lbl">先锋等级</span></div>
      </section>

      <section className="section-header"><h2>快捷入口</h2></section>
      <section className="grid grid--3">
        <article className="skill-card">
          <h3>我的 Skills</h3>
          <p>查看与管理你上传的 Skills 及发布状态。</p>
          <div className="card-actions"><button type="button" className="btn--primary btn--sm" onClick={() => navigate('/my-skills')}>查看</button></div>
        </article>
        <article className="skill-card">
          <h3>上传新 Skill</h3>
          <p>把你的好用 Skill 分享给社区，参与创作者激励。</p>
          <div className="card-actions"><button type="button" className="btn--secondary btn--sm" onClick={() => navigate('/upload')}>上传</button></div>
        </article>
        <article className="skill-card">
          <h3>先锋计划</h3>
          <p>了解先锋任务与权益，冲击本月先锋榜。</p>
          <div className="card-actions"><button type="button" className="btn--ghost btn--sm" onClick={() => navigate('/pioneer')}>了解</button></div>
        </article>
      </section>
    </Shell>
  );
}

// ============================================================
// Auth Showcase — large auto-rotating animated product carousel
// that fills the entire left panel of login/register.
// ============================================================
const AUTH_SLIDES = [
  {
    key: 'discover',
    eyebrow: '探索',
    title: '浏览日常与企业级 Skills',
    text: '从美食穿搭到增长获客，数百个高质量 Skill 即开即用，按场景分类一键找到。',
    visual: 'cards',
  },
  {
    key: 'deploy',
    eyebrow: '部署',
    title: '一行命令，一键部署',
    text: '选择 Claude Code、Codex、Cursor 等框架，复制命令粘贴到终端，Skill 即刻就位。',
    visual: 'terminal',
  },
  {
    key: 'social',
    eyebrow: '社区',
    title: '关注创作者，私信协作',
    text: '关注活跃作者、即时私信交流，在 Pandora X 组建属于你的 AI 协作圈。',
    visual: 'chat',
  },
  {
    key: 'reward',
    eyebrow: '激励',
    title: '发布作品，赢得激励',
    text: '上传你的 Skill 进入创作者激励计划，登上先锋榜，让更多人用上你的创造。',
    visual: 'leaderboard',
  },
];

function AuthSlideVisual({ visual }) {
  if (visual === 'cards') {
    const cards = [
      { t: '美食', cat: '美食', g: 'linear-gradient(140deg,#fb923c,#ea580c)' },
      { t: '穿搭', cat: '穿搭', g: 'linear-gradient(140deg,#f472b6,#db2777)' },
      { t: '旅游', cat: '旅游攻略', g: 'linear-gradient(140deg,#38bdf8,#2563eb)' },
      { t: '社群', cat: '社群工具', g: 'linear-gradient(140deg,#34d399,#059669)' },
      { t: '内容', cat: '内容创作', g: 'linear-gradient(140deg,#a78bfa,#7c3aed)' },
      { t: '增长', cat: '账号流量', g: 'linear-gradient(140deg,#fbbf24,#d97706)' },
    ];
    return (
      <div className="auth-vis auth-vis--cards">
        {cards.map((c, i) => (
          <div className="auth-vis-card" style={{ '--i': i }} key={c.t}>
            <span className="auth-vis-card-dot" style={{ background: c.g }}><CategoryIcon category={c.cat} size={18} /></span>
            <span className="auth-vis-card-t">{c.t}</span>
            <span className="auth-vis-card-bar" />
          </div>
        ))}
      </div>
    );
  }
  if (visual === 'terminal') {
    return (
      <div className="auth-vis auth-vis--term">
        <div className="auth-term-bar"><i /><i /><i /></div>
        <div className="auth-term-body">
          <p><span className="auth-term-prompt">$</span> npx pandora add capsule-wardrobe</p>
          <p className="auth-term-dim">› 正在解析框架目标 …</p>
          <p className="auth-term-ok">✓ 已安装到 Claude Code</p>
          <p className="auth-term-cursor"><span className="auth-term-prompt">$</span> <span className="auth-caret" /></p>
        </div>
      </div>
    );
  }
  if (visual === 'chat') {
    return (
      <div className="auth-vis auth-vis--chat">
        <div className="auth-chat-row"><span className="auth-chat-av" style={{ background: 'linear-gradient(140deg,#8b5cf6,#6d28d9)' }}>R</span><span className="auth-chat-bubble">这个搭配 Skill 太好用了！</span></div>
        <div className="auth-chat-row mine"><span className="auth-chat-bubble mine">谢谢，刚更新了新版本</span></div>
        <div className="auth-chat-row"><span className="auth-chat-av" style={{ background: 'linear-gradient(140deg,#f472b6,#db2777)' }}>M</span><span className="auth-chat-bubble">求一个旅游路书的合作</span></div>
        <div className="auth-chat-typing"><i /><i /><i /></div>
      </div>
    );
  }
  return (
    <div className="auth-vis auth-vis--board">
      {[{ n: 'RiverFlow', g: 'linear-gradient(140deg,#8b5cf6,#6d28d9)', m: '14 个上架 Skills' }, { n: 'NeoLab', g: 'linear-gradient(140deg,#38bdf8,#2563eb)', m: '对接成功率 92%' }, { n: 'AtlasChen', g: 'linear-gradient(140deg,#34d399,#059669)', m: '下载 48k+' }].map((r, i) => (
        <div className="auth-board-row" style={{ '--i': i }} key={r.n}>
          <span className={`auth-board-rank rank-${i + 1}`}>{i + 1}</span>
          <span className="auth-chat-av" style={{ background: r.g }}>{r.n[0]}</span>
          <span className="auth-board-main"><b>{r.n}</b><i>{r.m}</i></span>
        </div>
      ))}
    </div>
  );
}

function AuthShowcase() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % AUTH_SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);
  const slide = AUTH_SLIDES[idx];
  return (
    <div className="auth-showcase">
      <div className="auth-showcase-aurora" aria-hidden />
      <div className="auth-showcase-top">
        <Brand />
      </div>

      <div className="auth-showcase-stage">
        {AUTH_SLIDES.map((s, i) => (
          <div className={`auth-stage-panel${i === idx ? ' active' : ''}`} key={s.key} aria-hidden={i !== idx}>
            <AuthSlideVisual visual={s.visual} />
          </div>
        ))}
      </div>

      <div className="auth-showcase-copy">
        <span className="auth-showcase-eyebrow">{slide.eyebrow}</span>
        <h2 key={slide.key}>{slide.title}</h2>
        <p key={slide.key + '-t'}>{slide.text}</p>
      </div>

      <div className="auth-showcase-dots">
        {AUTH_SLIDES.map((s, i) => (
          <button type="button" key={s.key} className={`auth-dot${i === idx ? ' on' : ''}`} onClick={() => setIdx(i)} aria-label={s.title} />
        ))}
      </div>
    </div>
  );
}

function msgStyle(msgType) {
  const bg = msgType === 'success' ? 'rgba(16,185,129,0.16)' : msgType === 'error' ? 'rgba(239,68,68,0.16)' : 'rgba(139,92,246,0.16)';
  const color = msgType === 'success' ? '#6ee7b7' : msgType === 'error' ? '#fca5a5' : '#c4b5fd';
  return { background: bg, color };
}

// ============================================================
// LoginPage
// ============================================================
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [msgType, setMsgType] = React.useState('info');
  const [loading, setLoading] = React.useState(false);

  async function login(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const data = await api.login({ email: email.trim(), password });
      setSession({ email: data.user.email, name: data.user.name, token: data.token });
      markSeen();
      setMsgType('success');
      setMsg('登录成功！即将跳转...');
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setMsgType('error');
      setMsg(err.message || '登录失败');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-split">
      <AuthShowcase />
      <div className="auth-form-side">
        <div className="auth-form-card">
          <button type="button" className="auth-back" onClick={() => navigate('/welcome')}>← 返回首页</button>
          <h1>登录</h1>
          <p className="subtitle">使用邮箱和密码登录</p>
          <form onSubmit={login}>
            <div className="form-group"><label>邮箱地址</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required /></div>
            <div className="form-group"><label>密码</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" minLength={6} required /></div>
            <button type="submit" className="btn--primary btn--full" disabled={loading}>{loading ? '登录中...' : '登录'}</button>
          </form>
          {msg && <div className="auth-form-msg" style={msgStyle(msgType)}>{msg}</div>}
          <div className="auth-form-footer">还没有账户？<a onClick={() => navigate('/register')}>立即注册</a></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RegisterPage
// ============================================================
function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [msgType, setMsgType] = React.useState('info');
  const [sending, setSending] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);

  async function handleSendCode() {
    if (!email.trim()) { setMsgType('error'); return setMsg('请先输入邮箱'); }
    setMsg('');
    setSending(true);
    try {
      const data = await api.sendCode(email.trim());
      setStep(2);
      if (data.devCode) {
        setCode(data.devCode);
        setMsgType('info');
        setMsg(`开发模式：验证码 ${data.devCode} 已自动填入（线上将改为邮件发送）`);
      } else {
        setMsgType('info');
        setMsg('验证码已发送至你的邮箱，10 分钟内有效');
      }
    } catch (err) {
      setMsgType('error');
      setMsg(err.message || '发送失败');
    } finally { setSending(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!code.trim()) { setMsgType('error'); return setMsg('请输入验证码'); }
    if (password !== confirmPassword) { setMsgType('error'); return setMsg('两次输入的密码不一致'); }
    setMsg('');
    setRegistering(true);
    try {
      const data = await api.register({ email: email.trim(), password, code: code.trim() });
      // Backend auto-creates a session on register — log in immediately.
      setSession({ email: data.user.email, name: data.user.name, token: data.token });
      markSeen();
      setMsgType('success');
      setMsg('注册成功，正在跳转...');
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setMsgType('error');
      setMsg(err.message || '注册失败');
    } finally { setRegistering(false); }
  }

  return (
    <div className="auth-split">
      <AuthShowcase />
      <div className="auth-form-side">
        <div className="auth-form-card">
          <button type="button" className="auth-back" onClick={() => navigate('/welcome')}>← 返回首页</button>
          <h1>注册</h1>
          <p className="subtitle">邮箱验证码注册，安全快捷</p>
          <div className="auth-steps">
            <div className={`auth-step${step >= 1 ? ' on' : ''}`} />
            <div className={`auth-step${step >= 2 ? ' on' : ''}`} />
          </div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>邮箱地址</label>
              <div className="form-row">
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStep(1); }} placeholder="name@example.com" required />
                <button type="button" className="btn--secondary btn--sm" onClick={handleSendCode} disabled={sending || !email.trim()} style={{ whiteSpace: 'nowrap' }}>{sending ? '发送中...' : '获取验证码'}</button>
              </div>
            </div>
            <div className="form-group"><label>验证码</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入 6 位验证码" maxLength={6} required /></div>
            <div className="form-group"><label>设置密码</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位密码" minLength={6} required /></div>
            <div className="form-group"><label>确认密码</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入密码" minLength={6} required /></div>
            <button type="submit" className="btn--primary btn--full" disabled={registering}>{registering ? '注册中...' : '注册'}</button>
          </form>
          {msg && <div className="auth-form-msg" style={msgStyle(msgType)}>{msg}</div>}
          <div className="auth-form-footer">已有账户？<a onClick={() => navigate('/login')}>立即登录</a></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RootRedirect — first-time visitors see the landing page
// ============================================================
function RootRedirect() {
  const session = getSession();
  if (!session && !hasSeen()) return <Navigate to="/welcome" replace />;
  return <HomePage />;
}

// ============================================================
// App — root router
// ============================================================
export default function App() {
  return (
    <SocialProvider>
      <Routes>
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/my-skills" element={<MySkillsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/skill/:id" element={<SkillDetailPage />} />
        <Route path="/requests" element={<RequestsPlazaPage />} />
        <Route path="/pioneer" element={<PioneerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatLayer />
    </SocialProvider>
  );
}
