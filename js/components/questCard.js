import { el } from '../utils/helpers.js';
import { formatDifficulty } from '../utils/formatters.js';

export function render(quest, opts = {}) {
  const status = opts.status || 'available';
  const icons = { learning: '📘', challenge: '⚡', boss: '👾' };
  const statusBadge = {
    locked: '<span class="badge badge-error">🔒 Locked</span>',
    available: '<span class="badge badge-info">▶ Available</span>',
    completed: '<span class="badge badge-success">✓ Completed</span>',
    failed: '<span class="badge badge-warning">↻ Retry</span>'
  }[status] || '';

  const card = el(`<div class="card card-interactive quest-card ${status === 'locked' ? 'locked' : ''}" role="button" tabindex="0" aria-label="${quest.name}">
    <div class="quest-card-header">
      <div>
        <div class="quest-card-title">${icons[quest.type] || '📘'} ${quest.name}</div>
        <p class="text-sm mt-1" style="color:var(--muted-star)">${quest.description}</p>
      </div>
      <div class="difficulty" aria-label="Difficulty">${formatDifficulty(quest.difficulty)}</div>
    </div>
    <div class="quest-card-meta">
      ${statusBadge}
      ${opts.score != null ? `<span class="tag">Score: ${opts.score}%</span>` : ''}
      <span class="tag">+${opts.rewardXP || 75} XP</span>
    </div>
  </div>`);

  const activate = () => { if (status !== 'locked' && typeof opts.onClick === 'function') opts.onClick(quest); };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  return card;
}

export default { render };