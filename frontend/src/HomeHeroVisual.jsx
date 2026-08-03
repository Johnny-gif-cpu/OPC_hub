import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleField, useCountUp } from './ParticleField.jsx';

const TARGET_SKILLS = 128;
const TARGET_AUTHORS = 36;
const TARGET_DOWNLOADS_K = 240;

/** 悬停小方图：点击跳转对应分类（browseCategory 须与 Browse 页分类一致） */
const HERO_FLOATERS = [
  { id: 'aigc', posClass: 'home-hero-floater--travel', src: '/floaters/home-float-travel.png', label: 'AIGC 插图', caption: '从提示词到作品，一键生成你的 AI 创意', browseCategory: 'AIGC' },
  { id: 'content', posClass: 'home-hero-floater--fashion', src: '/floaters/home-float-fashion.png', label: '内容创作插图', caption: '搭好你的灵感写作工作台', browseCategory: '内容创作' },
];

export function HomeHeroVisual() {
  const navigate = useNavigate();
  const [hoverCaption, setHoverCaption] = useState(null);

  const nSkills = useCountUp(TARGET_SKILLS);
  const nAuthors = useCountUp(TARGET_AUTHORS);
  const nDlK = useCountUp(TARGET_DOWNLOADS_K);

  return (
    <div className="home-hero-visual">
      <ParticleField className="home-hero-canvas" />
      <div className="home-hero-visual__grid" aria-hidden />
      <div className="home-hero-visual__shine" aria-hidden />
      {hoverCaption ? (
        <p key={hoverCaption} className="home-hero-visual__caption">{hoverCaption}</p>
      ) : null}
      <div className="home-hero-visual__scatter">
        {HERO_FLOATERS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`home-hero-floater ${item.posClass}`}
            aria-label={`${item.label}，点击进入「${item.browseCategory}」分类`}
            onMouseEnter={() => setHoverCaption(item.caption)}
            onMouseLeave={() => setHoverCaption(null)}
            onFocus={() => setHoverCaption(item.caption)}
            onBlur={() => setHoverCaption(null)}
            onClick={() => navigate(`/browse?category=${encodeURIComponent(item.browseCategory)}`)}
          >
            <span className="home-hero-floater-wobble" style={{ animationDelay: `${index * 0.42}s` }}>
              <span className="home-hero-floater-inner">
                <img src={item.src} alt="" draggable={false} width={80} height={80} loading="lazy" decoding="async" />
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
