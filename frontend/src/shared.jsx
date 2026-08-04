import React from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// Session helpers
// ============================================================
export const SESSION_KEY = 'chuchu_session';
export const SEEN_KEY = 'chuchu_seen';
// API_BASE is now handled by api.js (reads VITE_API_BASE env var).
// Keep this export for backward compat but default to empty (= relative).
export const API_BASE = '';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function emitSession() { try { window.dispatchEvent(new Event('chuchu-session')); } catch { /* ignore */ } }
export function setSession(value) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch { /* ignore */ }
  emitSession();
}
export function clearSession() { localStorage.removeItem(SESSION_KEY); emitSession(); }
export function markSeen() { try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }
export function hasSeen() { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } }

// ============================================================
// Brand lockup (mark + wordmark)
// ============================================================
export function BrandMark({ size = 34 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* 城墙垛口 */}
        <path d="M4 16.6v-3.1h2.5v3.1h3v-3.1h2.5v3.1h3v-3.1h1.4v3.1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* 城门拱 */}
        <path d="M10.3 16.6v-1.7a1.7 1.7 0 0 1 3.4 0v1.7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        {/* 楚式云纹 */}
        <path d="M5.6 20c2.7 1 6 1 8.7 0s4.6-2 3.6-3.5c-.5-.8-1.4-.9-2-.4-.9.7-.7 1.9.2 2.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.92" />
        {/* 青铜钉 */}
        <circle cx="12" cy="13" r="1.05" fill="#d4a92c" />
      </svg>
    </span>
  );
}

export function Brand({ to = '/', markSize = 34, onClick }) {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = React.useState(false);

  function handleMascotClick(e) {
    e.stopPropagation();
    setShowIntro(true);
  }

  React.useEffect(() => {
    if (!showIntro) return;
    function close(e) { if (!e.target.closest('.brand-mascot-popup')) setShowIntro(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showIntro]);

  return (
    <span className="brand" onClick={() => { if (onClick) onClick(); else navigate(to); }} role="link" tabIndex={0} style={{ position: 'relative' }}>
      <BrandMark size={markSize} />
      <span className="brand-word">楚楚智创<b> OPC 孵化器</b></span>
      <img src="/xiaochu.png" alt="小楚" title="小楚" className="brand-mascot" style={{ height: markSize + 6, width: 'auto', marginLeft: 6 }} onClick={handleMascotClick} />
      {showIntro && (
        <div className="brand-mascot-popup" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="brand-mascot-popup-close" onClick={() => setShowIntro(false)}>✕</button>
          <img src="/xiaochu.png" alt="小楚" style={{ width: 80, height: 'auto', marginBottom: 10 }} />
          <h4>你好，我是小楚！</h4>
          <p>楚楚智创 OPC 平台的官方 IP 形象。我在这里陪你一起探索 AI 智能体的世界～</p>
          <p className="subtitle" style={{ fontSize: '0.8rem', margin: 0 }}>有任何问题，点击右下角找我聊天 💬</p>
        </div>
      )}
    </span>
  );
}

// ============================================================
// Icons
// ============================================================
export const IconExplore = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.25 : 0} />
    <circle cx="12" cy="12" r="2.2" fill={active ? 'currentColor' : 'none'} />
  </svg>
);
export const IconBox = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 8-9 4-9-4 9-4 9 4Z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.22 : 0} />
    <path d="M3 8v8l9 4 9-4V8" />
    <path d="M12 12v8" />
  </svg>
);
export const IconBounty = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
    <path d="M12 7v10M9 9.5h4.5a1.5 1.5 0 0 1 0 3H10m0 0h3.5a1.5 1.5 0 0 1 0 3H9" />
  </svg>
);
export const IconMedal = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
    <path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5" />
  </svg>
);
export const IconUser = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);
export const IconArrowRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
export const IconCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
export const IconCopy = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
);
export const IconBolt = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" /></svg>
);
export const IconDownload = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></svg>
);
export const ShareIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 3 4ZM6 14a3 3 0 1 0 2.83 4H9a3 3 0 0 0-3-4Zm12.17-4.41-9.2 4.6m9.2 0a3 3 0 1 0 0 5.82 3 3 0 0 0 0-5.82ZM9 14l9.2-4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconGitHub = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
);
export const IconTwitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
export const IconCpu = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
    <rect x="9" y="9" width="6" height="6" fill={active ? 'currentColor' : 'none'} />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
  </svg>
);
export const IconBook = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h12" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
export const IconDoc = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// ============================================================
// Category icons (premium line icons — replace emoji)
// ============================================================
const catPaths = {
  美食: <><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M20 3c-1.7 0-3 2.2-3 5s1 4 1 6-1 7-1 7" /></>,
  交友: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 8.5a3 3 0 0 1 0 5M18.5 20c0-2-.8-3.6-2-4.5" /></>,
  穿搭: <><path d="M9 3 6 5 3 8l2.5 2.5L7 9v11h10V9l1.5 1.5L21 8l-3-3-3-2c0 1.7-1.3 3-3 3s-3-1.3-3-3Z" /></>,
  旅游攻略: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  社群工具: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9s1.3-6.5 3.8-9Z" /></>,
  账号流量: <><path d="M4 19V5M4 19h16M7.5 16l3.5-4 3 2.5L20 8" /></>,
  AIGC: <><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m10 9 5 3-5 3V9Z"/></>,
  内容创作: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m10 9 5 3-5 3V9Z" /></>,
  'vibe coding': <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></>,
  产品设计: <><rect x="3" y="3" width="8" height="8" rx="1.6" /><rect x="13" y="3" width="8" height="8" rx="1.6" /><rect x="3" y="13" width="8" height="8" rx="1.6" /><rect x="13" y="13" width="8" height="8" rx="1.6" /></>,
  主机代理: <><rect x="3" y="4" width="18" height="6" rx="1.6" /><rect x="3" y="14" width="18" height="6" rx="1.6" /><path d="M7 7h.01M7 17h.01" /></>,
};
export const CategoryIcon = ({ category, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {catPaths[category] || <circle cx="12" cy="12" r="9" />}
  </svg>
);

// Chinese social media icons
const IconDouyin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 7.5a6.4 6.4 0 0 1-3.7-1.2v5.5c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8c.2 0 .4 0 .6.1v3.8a4.2 4.2 0 1 0 2.9 4V2.5h3.6c.4 2.8 2.6 5 4.6 5v3.8z" /></svg>
);
const IconXiaohongshu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H5.5A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 18.5 3zM8 7h2.5c.2 2.5 1 5 3.5 6.2V15c-3.2-.5-5-2.5-5.5-4.5V15H6V7h2zm8 10h-2v-5.5c-1.2-.8-2-2-2.2-3.5H14c.2 1.5 1 3 3 3.5V17z" /></svg>
);
const IconWeibo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 16.5c-4-.5-7-2-7.5-5-.2-1.2.4-2.4 1.5-3 2.3-1.3 6-.5 8.5 1.5 1.5 1.2 2.4 2.8 2.5 4.5 0 .8-.5 1.5-1 2-.8.7-2 .8-4 .7zm5-7c-.8-.3-1.5-.5-1.5-1.2 0-.7.8-.8 1.5-.6 1.8.5 3 2 3.5 3.8.3.8 0 1.5-.6 1.7-.8.3-1.2-.3-1.5-.8-.7-1.2-1.5-2.5-3-3zm-2.5-3c-1.5-.3-2.5-1-2.5-2 0-1 .8-1.5 2-1.2 3.5.8 6 4 6.5 7.5.2 1.5-.3 2.5-1.5 2.7-1.2.2-1.8-1-2.2-2-.7-1.8-1.8-4.5-2.8-5zm-4.8 11.5c-2.5.3-4.8-.2-5-2-.2-1.8 2-3 5-2.8 2.8.2 5 1.8 5 3.5-.2 1.8-2.5 1.3-5 1.3z" /></svg>
);
const IconBilibili = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 5h-3.8l-.7-2H10l-.7 2H5.5A2.5 2.5 0 0 0 3 7.5v9A2.5 2.5 0 0 0 5.5 19h13a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 18.5 5zM11 14.5V10l4 2.2-4 2.3z" /></svg>
);

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-grid footer-grid--single">
          <div className="footer-col footer-col--brand">
            <Brand />
            <p>汇聚荆楚智慧，为 AI 智能体时代的创新者提供发现、部署与协作的孵化平台。</p>
          </div>
          <div className="footer-col footer-col--social">
            <div className="footer-social">
              <a className="footer-social-icon" href="#" aria-label="抖音" title="抖音"><IconDouyin /></a>
              <a className="footer-social-icon" href="#" aria-label="小红书" title="小红书"><IconXiaohongshu /></a>
              <a className="footer-social-icon" href="#" aria-label="微博" title="微博"><IconWeibo /></a>
              <a className="footer-social-icon" href="#" aria-label="B站" title="B站"><IconBilibili /></a>
            </div>
            <a className="footer-email" href="mailto:support@weopc.com.cn">support@weopc.com.cn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} 楚楚智创 · OPC孵化器</span>
          <span className="footer-dot">·</span>
          <span>演示项目</span>
        </div>
      </div>
    </footer>
  );
}
