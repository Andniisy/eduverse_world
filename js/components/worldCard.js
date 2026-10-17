import { el } from '../utils/helpers.js';

export function render(world, opts = {}) {
  const card = el(`<div class="card card-interactive world-card ${opts.locked ? 'locked' : ''}" role="button" tabindex="0" aria-label="${world.name}">
    <div class="world-card-icon">${world.icon}</div>
    <h3>${world.name}</h3>
    <p class="text-sm mt-2" style="color:var(--muted-star)">${world.description}</p>
    ${opts.progress != null ? `<div class="mt-4">
      <div class="flex justify-between text-sm mb-1" style="color:var(--muted-star)">
        <span>Kemajuan</span><span>${Math.round(opts.progress)}%</span>
      </div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${opts.progress}%"></div></div>
    </div>` : ''}
  </div>`);

  const activate = () => { if (!opts.locked && typeof opts.onClick === 'function') opts.onClick(world); };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  return card;
}

export default { render };