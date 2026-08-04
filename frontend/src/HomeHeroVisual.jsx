import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleField, useCountUp } from './ParticleField.jsx';

const TARGET_SKILLS = 23;
const TARGET_AUTHORS = 5;
const TARGET_DOWNLOADS_K = 645;

/** 悬停小圆片：点击跳转对应分类（browseCategory 须与 Browse 页分类一致） */
const HERO_FLOATERS = [
  { id: 'aigc', color: 'linear-gradient(135deg,#0d9488,#14b8a6)', icon: 'play', label: 'AIGC', browseCategory: 'AIGC' },
  { id: 'content', color: 'linear-gradient(135deg,#b7950b,#d97706)', icon: 'pen', label: '内容创作', browseCategory: '内容创作' },
  { id: 'web', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', icon: 'code', label: 'vibe coding', browseCategory: 'vibe coding' },
];

export function HomeHeroVisual() {
  const navigate = useNavigate();

  const nSkills = useCountUp(TARGET_SKILLS);
  const nAuthors = useCountUp(TARGET_AUTHORS);
  const nDlK = useCountUp(TARGET_DOWNLOADS_K);

  return (
    <div className="home-hero-visual">
      <ParticleField className="home-hero-canvas" />
      <div className="home-hero-visual__grid" aria-hidden />
      <div className="home-hero-visual__shine" aria-hidden />
      <div className="home-hero-visual__scatter">
        {HERO_FLOATERS.map((f) => (
          <button key={f.id} className={`home-hero-floater home-hero-floater--${f.id}`} onClick={() => navigate(`/browse?category=${encodeURIComponent(f.browseCategory)}`)} aria-label={f.label}>
            <span className="home-hero-floater-wobble">
              <span className="home-hero-floater-inner" style={{ background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.icon === 'play' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                )}
                {f.icon === 'pen' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                )}
                {f.icon === 'code' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="home-hero-visual__bottom-stack">
        <div className="home-hero-visual__metrics">
          <div className="home-hero-metric"><span>精选 Skills</span><strong className="home-hero-metric-num">{nSkills}</strong></div>
          <div className="home-hero-metric"><span>作者</span><strong className="home-hero-metric-num">{nAuthors}</strong></div>
          <div className="home-hero-metric"><span>下载量</span><strong className="home-hero-metric-num">{nDlK}k+</strong></div>
        </div>
      </div>
    </div>
  );
}
