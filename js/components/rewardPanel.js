import { el } from '../utils/helpers.js';
import { app } from '../core/app.js';
import { rarityIcon } from '../utils/formatters.js';
import { t } from '../core/i18n.js';

export function render(summary, opts = {}) {
  if (!summary) return el(`<div></div>`);

  const cardRows = (summary.cards || []).map(cid => {
    const card = app.getCard(cid);
    if (!card) return '';
    return `<div class="flex items-center gap-2 mt-2"><span>${rarityIcon(card.rarity)}</span><span>${card.title}</span></div>`;
  }).join('');

  const badgeRows = (summary.badges || []).map(bid => {
    const b = app.getBadge(bid);
    if (!b) return '';
    return `<div class="flex items-center gap-2 mt-2"><span>${b.icon}</span><span>${b.name}</span></div>`;
  }).join('');

  const crystalRows = (summary.crystals || []).map(cid =>
    `<div class="flex items-center gap-2 mt-2"><span>💎</span><span>${cid}</span></div>`).join('');

  const panel = el(`<div class="card" style="text-align:center;padding:var(--space-8)">
    <div style="font-size:3rem;margin-bottom:var(--space-3)">🎉</div>
    <h2 style="font-family:var(--font-display);font-size:var(--text-2xl);margin-bottom:var(--space-4)">
      ${t('reward.title')}
    </h2>
    ${summary.isReplay ? `<p class="text-sm mb-4" style="color:var(--muted-star)">${t('reward.replayInfo')}</p>` : ''}
    <div class="grid grid-2 mt-4 mb-4" style="gap:var(--space-4)">
      <div class="card" style="background:var(--space-surface)">
        <div style="font-size:1.5rem">⭐</div>
        <div class="stat-value" style="color:var(--energy-gold)">+${summary.xp || 0} XP</div>
      </div>
      <div class="card" style="background:var(--space-surface)">
        <div style="font-size:1.5rem">🪙</div>
        <div class="stat-value" style="color:var(--energy-gold)">+${summary.coins || 0} ${t('quest.coins')}</div>
      </div>
    </div>
    ${cardRows || badgeRows || crystalRows ? `<div class="card" style="text-align:left;background:var(--space-surface)">
      <b>${t('reward.unlocked')}</b>${cardRows}${badgeRows}${crystalRows}
    </div>` : ''}
    <button class="btn btn-primary btn-lg mt-6" type="button" id="reward-close">${t('reward.continue')}</button>
  </div>`);

  const btn = panel.querySelector('#reward-close');
  if (btn && typeof opts.onClose === 'function') btn.addEventListener('click', opts.onClose);
  return panel;
}

export default { render };