// ============================================================
// Pandora X — In-memory rate limiter (zero dependency)
// Limits requests per IP within a sliding window.
// Designed for single-process use behind Nginx (uses
// X-Forwarded-For / X-Real-IP when TRUST_PROXY is set).
// ============================================================

const windows = new Map();

/**
 * @param {string} key  — unique identifier (usually IP + endpoint)
 * @param {number} max  — max requests allowed in the window
 * @param {number} windowMs — sliding window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(key, max = 5, windowMs = 60_000) {
  const now = Date.now();
  let entry = windows.get(key);

  // Clean up stale entries
  if (entry && now - entry.windowStart >= windowMs) {
    windows.delete(key);
    entry = null;
  }

  if (!entry) {
    entry = { count: 0, windowStart: now };
    windows.set(key, entry);
  }

  entry.count += 1;
  const elapsed = now - entry.windowStart;
  const resetMs = Math.max(0, windowMs - elapsed);
  const allowed = entry.count <= max;

  return { allowed, remaining: Math.max(0, max - entry.count), resetMs };
}

/**
 * Extract client IP from request, respecting reverse proxy headers.
 */
export function getClientIp(req, trustProxy = false) {
  if (trustProxy) {
    const xff = req.headers['x-forwarded-for'];
    if (xff) return xff.split(',')[0].trim();
    const xri = req.headers['x-real-ip'];
    if (xri) return xri.trim();
  }
  // Fallback: remote address (strip IPv6 prefix if present)
  const addr = req.socket?.remoteAddress || '127.0.0.1';
  return addr.replace(/^::ffff:/, '');
}

// Periodically prune stale entries (every 2 minutes) to prevent
// memory leaks from short-lived IP keys.
const CLEANUP_MS = 120_000;
let cleanupTimer;

function startCleanup() {
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of windows) {
      if (now - entry.windowStart >= 3600_000 /* 1 hour */) {
        windows.delete(key);
      }
    }
  }, CLEANUP_MS);
  // Let the timer not block process exit
  if (cleanupTimer.unref) cleanupTimer.unref();
}

startCleanup();
