import React from 'react';

// ============================================================
// Pandora X — API client
// Thin fetch wrapper around the backend. Centralizes base URL,
// JSON handling, and the bearer token. Token is persisted in the
// session object (localStorage) by shared.jsx.
//
// In dev:     Vite proxies /api → localhost:4000 (see vite.config.js)
// In prod:    Nginx proxies /api → backend (or use env var)
// ============================================================
export const API_BASE = import.meta.env.VITE_API_BASE || '';

const SESSION_KEY = 'pandora_session';

function readToken() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return s && s.token ? s.token : null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = readToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('网络错误，请确认后端服务已启动', 0);
  }
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    throw new ApiError((data && data.message) || `请求失败 (${res.status})`, res.status, data);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Convenience wrappers
export const api = {
  // Reads
  listSkills: (params = {}) => apiFetch(`/api/skills${qs(params)}`).then((r) => r.data),
  getSkill: (id) => apiFetch(`/api/skills/${encodeURIComponent(id)}`).then((r) => r.data),
  listRequests: (params = {}) => apiFetch(`/api/requests${qs(params)}`).then((r) => r.data),
  listPioneers: () => apiFetch('/api/pioneers').then((r) => r.data),
  // Auth
  sendCode: (email) => apiFetch('/api/send-code', { method: 'POST', body: { email } }),
  register: (payload) => apiFetch('/api/register', { method: 'POST', body: payload }),
  login: (payload) => apiFetch('/api/login', { method: 'POST', body: payload }),
  logout: () => apiFetch('/api/logout', { method: 'POST', auth: true }).catch(() => null),
  me: () => apiFetch('/api/me', { auth: true }).then((r) => r.user),
  // Authenticated
  mySkills: () => apiFetch('/api/my-skills', { auth: true }).then((r) => r.data),
  uploadSkill: (payload) => apiFetch('/api/upload-skill', { method: 'POST', body: payload, auth: true }),
  // Social
  listUsers: (q) => apiFetch(`/api/users${qs({ q })}`, { auth: true }).then((r) => r.data),
  following: () => apiFetch('/api/following', { auth: true }).then((r) => r.data),
  follow: (userId) => apiFetch('/api/follow', { method: 'POST', body: { userId }, auth: true }),
  unfollow: (userId) => apiFetch('/api/unfollow', { method: 'POST', body: { userId }, auth: true }),
  conversations: () => apiFetch('/api/conversations', { auth: true }).then((r) => r.data),
  thread: (userId) => apiFetch(`/api/messages${qs({ userId })}`, { auth: true }).then((r) => r.data),
  sendMessage: (userId, body) => apiFetch('/api/messages', { method: 'POST', body: { userId, body }, auth: true }).then((r) => r.data),
};

function qs(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

// ------------------------------------------------------------
// useAsync — load data from the API with loading/error state and
// a fallback value (so the UI still renders if backend is down).
// ------------------------------------------------------------
export function useAsync(loader, deps = [], fallback = null) {
  const [state, setState] = React.useState({ data: fallback, loading: true, error: null });
  const loaderRef = React.useRef(loader);
  loaderRef.current = loader;

  React.useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve(loaderRef.current())
      .then((data) => { if (alive) setState({ data, loading: false, error: null }); })
      .catch((error) => { if (alive) setState({ data: fallback, loading: false, error }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
