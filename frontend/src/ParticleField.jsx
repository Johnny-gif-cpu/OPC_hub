import React, { useEffect, useRef } from 'react';

/**
 * ParticleField — animated connected-particle canvas background.
 * Reusable across HomeHeroVisual and the LandingPage.
 *
 * Props:
 *  - count: number of particles (default 40)
 *  - linkDist: max distance to draw links (default 86)
 *  - paintBg: whether to paint the dark gradient + glow background (default true)
 *  - className: extra class for the canvas
 */
export function ParticleField({ count = 40, linkDist = 86, paintBg = true, className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const reduceRef = useRef(false);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      dimsRef.current = { w, h };
      if (w < 2 || h < 2) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      const { w, h } = dimsRef.current;
      if (w < 2 || h < 2) return;
      const particles = [];
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 2 + 0.7,
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = particles;
    }

    function drawStatic() {
      const { w, h } = dimsRef.current;
      if (w < 2 || h < 2) return;
      if (paintBg) {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, 'rgba(13, 148, 136, 0.18)');
        g.addColorStop(0.5, 'rgba(45, 212, 191, 0.10)');
        g.addColorStop(1, 'rgba(52, 211, 153, 0.12)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      const particles = particlesRef.current;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(13, 148, 136, 0.45)';
        ctx.fill();
      }
    }

    function onResize() {
      resize();
      initParticles();
      if (reduceRef.current) drawStatic();
    }

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    onResize();

    if (reduceRef.current) return () => ro.disconnect();

    function frame(t) {
      const { w, h } = dimsRef.current;
      if (w < 2 || h < 2) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      const time = t * 0.001;
      ctx.clearRect(0, 0, w, h);

      if (paintBg) {
        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, `rgba(240, 250, 246, ${0.45 + Math.sin(time * 0.4) * 0.06})`);
        bg.addColorStop(0.45, `rgba(230, 242, 236, ${0.3 + Math.cos(time * 0.35) * 0.05})`);
        bg.addColorStop(1, `rgba(220, 235, 228, ${0.35 + Math.sin(time * 0.25) * 0.05})`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const glow = ctx.createRadialGradient(w * 0.32, h * 0.18, 0, w * 0.42, h * 0.32, h * 0.95);
        glow.addColorStop(0, `rgba(45, 212, 191, ${0.2 + Math.sin(time) * 0.06})`);
        glow.addColorStop(0.42, 'rgba(13, 148, 136, 0.06)');
        glow.addColorStop(1, 'rgba(183, 149, 11, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      const particles = particlesRef.current;
      for (const p of particles) {
        p.x += p.vx + Math.sin(time + p.phase) * 0.12;
        p.y += p.vy + Math.cos(time * 0.75 + p.phase) * 0.1;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = 0.22 * (1 - d / linkDist);
            ctx.strokeStyle = `rgba(13, 148, 136, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.2 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + pulse * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13, 148, 136, ${0.3 + pulse * 0.22})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 228, 215, 0.90)';
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [count, linkDist, paintBg]);

  return (
    <div ref={wrapRef} className="particle-field-wrap" style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} className={className} aria-hidden style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
    </div>
  );
}

/** Animated count-up hook shared by hero + landing metrics. */
export function useCountUp(target, duration = 2000) {
  const [value, setValue] = React.useState(0);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setValue(target); return undefined; }
    const start = performance.now();
    let raf;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      setValue(Math.round(target * e));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
