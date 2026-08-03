import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from './api.js';
import { getSession } from './shared.jsx';

// ============================================================
// 楚楚智创 — Social layer
// A sidebar dock with two sliding panes (Following / Chatted) plus
// a floating chat-window layer. State is shared through SocialContext
// so the dock and chat windows stay in sync, and unread counts poll
// in the background.
// ============================================================

const SocialContext = React.createContext(null);
export const useSocial = () => React.useContext(SocialContext);

const POLL_MS = 5000;

export function SocialProvider({ children }) {
  const location = useLocation();
  // Re-read the session token from storage on every navigation so that an
  // in-app login/logout (which only mutates localStorage) immediately flips
  // the dock between guest and member states without a full page reload.
  const [token, setToken] = React.useState(() => getSession()?.token || null);
  React.useEffect(() => {
    const t = getSession()?.token || null;
    setToken((prev) => (prev === t ? prev : t));
  }, [location.pathname, location.key]);
  React.useEffect(() => {
    function sync() { setToken(getSession()?.token || null); }
    window.addEventListener('storage', sync);
    window.addEventListener('chuchu-session', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('chuchu-session', sync); };
  }, []);
  const loggedIn = !!token;

  const [following, setFollowing] = React.useState([]);
  const [conversations, setConversations] = React.useState([]);
  const [openChats, setOpenChats] = React.useState([]); // array of user objects
  const [minimized, setMinimized] = React.useState({}); // userId -> bool

  const refreshFollowing = React.useCallback(async () => {
    if (!getSession()) return;
    try { setFollowing(await api.following()); } catch { /* offline */ }
  }, []);

  const refreshConversations = React.useCallback(async () => {
    if (!getSession()) return;
    try { setConversations(await api.conversations()); } catch { /* offline */ }
  }, []);

  React.useEffect(() => {
    if (!loggedIn) { setFollowing([]); setConversations([]); setOpenChats([]); return; }
    refreshFollowing();
    refreshConversations();
    const t = setInterval(refreshConversations, POLL_MS);
    return () => clearInterval(t);
  }, [loggedIn, refreshFollowing, refreshConversations]);

  const openChat = React.useCallback((user) => {
    setOpenChats((prev) => {
      if (prev.find((u) => u.id === user.id)) return prev;
      return [...prev.slice(-2), user]; // keep at most 3 windows
    });
    setMinimized((m) => ({ ...m, [user.id]: false }));
  }, []);

  const closeChat = React.useCallback((userId) => {
    setOpenChats((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const toggleMinimize = React.useCallback((userId) => {
    setMinimized((m) => ({ ...m, [userId]: !m[userId] }));
  }, []);

  const toggleFollow = React.useCallback(async (user) => {
    const isFollowing = following.some((f) => f.id === user.id);
    // optimistic
    setFollowing((prev) => isFollowing ? prev.filter((f) => f.id !== user.id) : [...prev, { ...user, following: true }]);
    try {
      if (isFollowing) await api.unfollow(user.id); else await api.follow(user.id);
    } catch { /* revert on error */ refreshFollowing(); }
  }, [following, refreshFollowing]);

  const totalUnread = conversations.reduce((n, c) => n + (c.unread || 0), 0);

  const value = {
    loggedIn, following, conversations, openChats, minimized, totalUnread,
    refreshFollowing, refreshConversations, openChat, closeChat, toggleMinimize, toggleFollow,
  };
  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

// ------------------------------------------------------------
// Avatar — gradient monogram (no emoji; derived from the name so
// every user gets a stable, premium-looking identity chip).
// ------------------------------------------------------------
const AVATAR_GRADIENTS = [
  'linear-gradient(140deg,#0d9488,#0f766e)',
  'linear-gradient(140deg,#0d9488,#0f766e)',
  'linear-gradient(140deg,#14b8a6,#0f766e)',
  'linear-gradient(140deg,#0d9488,#14b8a6)',
  'linear-gradient(140deg,#fbbf24,#d97706)',
  'linear-gradient(140deg,#b7950b,#8a6d0d)',
];
function monogram(user) {
  const s = (user.name || user.email || '?').trim();
  // first alphanumeric / CJK char, uppercased
  const m = s.match(/[A-Za-z0-9一-龥]/);
  return (m ? m[0] : s[0] || '?').toUpperCase();
}
function avatarGradient(user) {
  const key = String(user.id ?? user.email ?? user.name ?? '');
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}
function Avatar({ user, size = 36 }) {
  return (
    <span className="so-avatar" style={{ width: size, height: size, fontSize: size * 0.42, background: avatarGradient(user) }}>
      {monogram(user)}
    </span>
  );
}

const IconChatBubble = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-3.9-.9L3 21l1.9-5.6A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
  </svg>
);

// Friendly empty-state illustration (no emoji) — a soft glowing blob with a
// chat bubble, drawn entirely with SVG so it stays crisp and on-brand.
function SocialEmptyArt({ variant = 'follow' }) {
  return (
    <svg className="social-empty-art" viewBox="0 0 200 160" fill="none" aria-hidden>
      <defs>
        <radialGradient id="se-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#a3e635" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="se-blob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <ellipse className="se-halo" cx="100" cy="86" rx="62" ry="46" fill="url(#se-glow)" />
      {/* doodle strokes */}
      <path className="se-doodle" d="M44 120c14 8 34 10 52 4" stroke="#0d9488" strokeWidth="3" strokeOpacity="0.4" strokeLinecap="round" />
      <path className="se-doodle" d="M150 70c10 2 16 9 14 18" stroke="#0d9488" strokeWidth="3" strokeOpacity="0.4" strokeLinecap="round" />
      <path className="se-spark" d="M146 44c-2 6-2 6-8 8 6 2 6 2 8 8 2-6 2-6 8-8-6-2-6-2-8-8Z" fill="#b7950b" />
      {/* speech bubble */}
      <g className="se-bubble">
        <rect x="52" y="36" width="64" height="40" rx="12" fill="url(#se-blob)" opacity="0.9" />
        <path d="M70 72l-6 12 16-9Z" fill="url(#se-blob)" opacity="0.9" />
        <circle cx="70" cy="56" r="3.4" fill="#a3e635" />
        <circle cx="84" cy="56" r="3.4" fill="#cbd5e1" />
        <circle cx="98" cy="56" r="3.4" fill="#cbd5e1" />
      </g>
      {/* face blob */}
      <g className="se-face">
        <circle cx="112" cy="92" r="30" fill="url(#se-blob)" />
        <circle cx="103" cy="88" r="3.6" fill="#cde7de" />
        <circle cx="121" cy="88" r="3.6" fill="#cde7de" />
        <path d="M103 102h18" stroke="#cde7de" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function SocialEmpty({ variant, title, action }) {
  return (
    <div className="social-empty-state">
      <SocialEmptyArt variant={variant} />
      <p className="social-empty-title">{title}</p>
      {action}
    </div>
  );
}

function relTime(iso) {
  if (!iso) return '';
  const then = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z').getTime();
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 60) return '刚刚';
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  return `${Math.floor(s / 86400)} 天前`;
}

// ============================================================
// SocialDock — sidebar widget with Following / Chatted slider
// ============================================================
export function SocialDock() {
  const social = useSocial();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState('following');
  const [discovering, setDiscovering] = React.useState(false);
  const [people, setPeople] = React.useState([]);

  if (!social || !social.loggedIn) {
    return (
      <div className="social-dock social-dock--guest surface-card">
        <div className="social-dock-head"><span className="so-dot" /> 社区</div>
        <p className="social-guest-text">登录后即可关注创作者、私信交流，组建你的楚楚智创协作圈。</p>
        <button type="button" className="btn--primary btn--sm btn--full" onClick={() => navigate('/login')}>登录 / 注册</button>
      </div>
    );
  }

  const { following, conversations, openChat, toggleFollow } = social;

  async function startDiscover() {
    setDiscovering(true);
    try { setPeople(await api.listUsers()); } catch { setPeople([]); }
  }

  return (
    <div className="social-dock surface-card">
      <div className="social-dock-head">
        <span className="social-dock-title"><span className="so-dot" /> 社区</span>
        <button type="button" className="social-discover-btn" onClick={() => { if (discovering) { setDiscovering(false); } else startDiscover(); }}>
          {discovering ? '完成' : '+ 发现'}
        </button>
      </div>

      {discovering ? (
        <div className="social-list social-discover">
          {people.length === 0 && <p className="social-empty">加载中…</p>}
          {people.map((p) => {
            const isF = following.some((f) => f.id === p.id);
            return (
              <div className="social-row" key={p.id}>
                <Avatar user={p} />
                <div className="social-row-main">
                  <span className="social-row-name">{p.name}</span>
                  <span className="social-row-sub">{p.headline || p.email}</span>
                </div>
                <button type="button" className={`social-follow-btn${isF ? ' on' : ''}`} onClick={() => toggleFollow(p)}>
                  {isF ? '已关注' : '关注'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="social-tabs" role="tablist">
            <button type="button" role="tab" className={`social-tab${tab === 'following' ? ' active' : ''}`} onClick={() => setTab('following')}>
              关注中 {following.length > 0 && <span className="social-tab-count">{following.length}</span>}
            </button>
            <button type="button" role="tab" className={`social-tab${tab === 'chatted' ? ' active' : ''}`} onClick={() => setTab('chatted')}>
              聊过 {social.totalUnread > 0 && <span className="social-tab-badge">{social.totalUnread}</span>}
            </button>
            <span className={`social-tab-ink ${tab}`} aria-hidden />
          </div>

          <div className="social-pane-viewport">
            <div className={`social-pane-track ${tab}`}>
              {/* Following pane */}
              <div className="social-pane">
                {following.length === 0 ? (
                  <SocialEmpty
                    variant="follow"
                    title="还没有关注任何人"
                    action={<button type="button" className="social-empty-btn" onClick={startDiscover}>去发现创作者</button>}
                  />
                ) : (
                  <div className="social-list">
                    {following.map((u) => (
                      <button type="button" className="social-row social-row--btn" key={u.id} onClick={() => openChat(u)}>
                        <Avatar user={u} />
                        <div className="social-row-main">
                          <span className="social-row-name">{u.name}</span>
                          <span className="social-row-sub">{u.headline || '点击发消息'}</span>
                        </div>
                        <span className="social-row-chat" aria-hidden><IconChatBubble size={15} /></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chatted pane */}
              <div className="social-pane">
                {conversations.length === 0 ? (
                  <SocialEmpty
                    variant="chat"
                    title="还没有聊天记录"
                    action={<button type="button" className="social-empty-btn" onClick={() => setTab('following')}>去打个招呼</button>}
                  />
                ) : (
                  <div className="social-list">
                    {conversations.map((c) => (
                      <button type="button" className="social-row social-row--btn" key={c.convId} onClick={() => openChat(c.user)}>
                        <Avatar user={c.user} />
                        <div className="social-row-main">
                          <span className="social-row-name">{c.user.name}{c.unread > 0 && <span className="social-unread-dot" />}</span>
                          <span className="social-row-sub">{c.lastMessage ? (c.lastMessage.mine ? '我: ' : '') + c.lastMessage.body : '开始聊天'}</span>
                        </div>
                        <span className="social-row-time">{c.lastMessage ? relTime(c.lastMessage.createdAt) : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// ChatWindow — a single floating conversation
// ============================================================
function ChatWindow({ user, index }) {
  const social = useSocial();
  const { closeChat, toggleMinimize, minimized, refreshConversations } = social;
  const isMin = !!minimized[user.id];
  const [messages, setMessages] = React.useState([]);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const bodyRef = React.useRef(null);

  const load = React.useCallback(async () => {
    try {
      const data = await api.thread(user.id);
      setMessages(data.messages);
      setLoaded(true);
    } catch { setLoaded(true); }
  }, [user.id]);

  React.useEffect(() => {
    load();
    const t = setInterval(() => { if (!minimized[user.id]) load(); }, POLL_MS);
    return () => clearInterval(t);
  }, [load, user.id, minimized]);

  React.useEffect(() => {
    if (bodyRef.current && !isMin) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isMin]);

  async function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    // optimistic append
    const optimistic = { id: `tmp-${text.length}-${messages.length}`, body: text, mine: true, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      await api.sendMessage(user.id, text);
      await load();
      refreshConversations();
    } catch {
      // leave optimistic message; user can retry
    } finally { setSending(false); }
  }

  return (
    <div className={`chat-window${isMin ? ' minimized' : ''}`} style={{ right: 24 + index * 312 }}>
      <div className="chat-head" onClick={() => isMin && toggleMinimize(user.id)}>
        <Avatar user={user} size={34} />
        <div className="chat-head-main">
          <span className="chat-head-name">{user.name}</span>
          <span className="chat-head-sub">{user.isDemo ? '通常很快回复' : '在线'}</span>
        </div>
        <button type="button" className="chat-head-btn" onClick={(e) => { e.stopPropagation(); toggleMinimize(user.id); }} aria-label="最小化">{isMin ? '▴' : '▾'}</button>
        <button type="button" className="chat-head-btn" onClick={(e) => { e.stopPropagation(); closeChat(user.id); }} aria-label="关闭">✕</button>
      </div>
      {!isMin && (
        <>
          <div className="chat-body" ref={bodyRef}>
            {!loaded && <p className="chat-loading">加载中…</p>}
            {loaded && messages.length === 0 && <p className="chat-loading">发送第一条消息，开始聊天。</p>}
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg${m.mine ? ' mine' : ''}`}>
                <span className="chat-bubble">{m.body}</span>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="发消息…" maxLength={2000} />
            <button type="submit" className="chat-send" disabled={!draft.trim() || sending} aria-label="发送">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// ============================================================
// ChatLayer — renders all open chat windows
// ============================================================
export function ChatLayer() {
  const social = useSocial();
  if (!social || !social.loggedIn || social.openChats.length === 0) return null;
  return (
    <div className="chat-layer">
      {social.openChats.map((u, i) => <ChatWindow key={u.id} user={u} index={i} />)}
    </div>
  );
}
