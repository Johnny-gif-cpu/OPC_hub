import React from 'react';
import { DEPLOY_FRAMEWORKS, skillSlug } from './data.js';
import { IconBolt, IconCopy, IconCheck } from './shared.jsx';

/**
 * DeployPanel — pick a framework, get a copy-paste install command.
 * Used on the skill detail page.
 */
export function DeployPanel({ skill, defaultFramework = 'claude-code' }) {
  const [fwId, setFwId] = React.useState(defaultFramework);
  const [copied, setCopied] = React.useState(false);
  const slug = skill.slug || skillSlug(skill);
  const fw = DEPLOY_FRAMEWORKS.find((f) => f.id === fwId) || DEPLOY_FRAMEWORKS[0];
  const command = fw.cmd(slug);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="surface-card deploy-panel">
      <div className="deploy-panel-head">
        <span className="deploy-bolt"><IconBolt size={16} /></span>
        <h3>一键部署</h3>
      </div>
      <p className="deploy-sub">选择你的工具框架，复制命令粘贴到终端即可安装。</p>

      <div className="deploy-fw-label">选择框架</div>
      <div className="deploy-fw-grid">
        {DEPLOY_FRAMEWORKS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`deploy-fw${f.id === fwId ? ' active' : ''}`}
            onClick={() => setFwId(f.id)}
            aria-pressed={f.id === fwId}
          >
            <span className="deploy-fw-icon" style={{ color: f.accent, boxShadow: `inset 0 0 0 1px ${f.accent}55` }}>{f.short}</span>
            {f.name}
          </button>
        ))}
      </div>

      <div className="deploy-cmd">
        <span className="prompt-mark">$</span>
        <code>{command}</code>
        <button type="button" className={`deploy-copy${copied ? ' copied' : ''}`} onClick={copy}>
          {copied ? <><IconCheck size={14} /> 已复制</> : <><IconCopy size={14} /> 复制</>}
        </button>
      </div>

      <p className="deploy-hint">
        <IconBolt size={14} />
        <span>粘贴到终端运行，智能体将自动安装到 <strong>{fw.name}</strong> 对应目录，无需手动配置。</span>
      </p>

      <p className="deploy-safe">
        安全提示：执行前请确认智能体来源与权限说明。当前为演示命令，正式版将接入官方 CLI 与签名校验。
      </p>
    </aside>
  );
}
