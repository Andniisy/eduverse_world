import { el } from '../utils/helpers.js';
import { rarityIcon, rarityLabel } from '../utils/formatters.js';

const MASTERY_ICONS = { discovered: '🌱', understood: '🌿', practiced: '🔥', mastered: '💎' };

export function render(card, opts = {}) {
  const owned = card.owned;
  const masteryIcon = MASTERY_ICONS[card.mastery || 'discovered'];
  const node = el(`<div class="card card-interactive knowledge-card ${owned ? '' : 'locked'}" role="button" tabindex="0"
      style="${owned ? '' : 'opacity:0.55;filter:grayscale(0.5)'}" aria-label="${card.title}">
    <div class="flex justify-between items-center mb-2">
      <span class="tag">${rarityIcon(card.rarity)} ${rarityLabel(card.rarity)}</span>
      ${owned ? `<span title="Mastery">${masteryIcon}</span>` : '<span>🔒</span>'}
    </div>
    <h3 style="font-size:var(--text-lg)">${card.title}</h3>
    <p class="text-sm" style="color:var(--muted-star)">${card.subtitle || ''}</p>
    <p class="text-sm mt-3" style="color:var(--soft-white)">${card.keyConcept || ''}</p>
  </div>`);

  const activate = () => { if (owned && typeof opts.onClick === 'function') opts.onClick(card); };
  node.addEventListener('click', activate);
  node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  return node;
}

export function renderDetail(card) {
  const masteryIcon = MASTERY_ICONS[card.mastery || 'discovered'];
  return `
    <div style="text-align:left">
      <div class="flex justify-between items-center mb-3">
        <span class="tag">${rarityIcon(card.rarity)} ${rarityLabel(card.rarity)}</span>
        <span class="tag">${masteryIcon} ${card.mastery}</span>
      </div>
      <h2 style="font-family:var(--font-display);font-size:var(--text-2xl);margin-bottom:6px">${card.title}</h2>
      <p style="color:var(--muted-star);margin-bottom:16px">${card.subtitle || ''}</p>
      <div class="knowledge-flash" style="margin-bottom:16px">
        <div class="knowledge-flash-title">🧠 Key Concept</div>
        <p>${card.keyConcept || ''}</p>
      </div>
      ${card.quickFact ? `<div style="margin-bottom:12px"><b>⚡ Quick Fact</b><p style="color:var(--muted-star);margin-top:4px">${card.quickFact}</p></div>` : ''}
      ${card.explanation ? `<div style="margin-bottom:12px"><b>📖 Explanation</b><p style="color:var(--muted-star);margin-top:4px">${card.explanation}</p></div>` : ''}
      ${card.example ? `<div style="margin-bottom:12px"><b>🔎 Example</b><p style="color:var(--muted-star);margin-top:4px">${card.example}</p></div>` : ''}
      ${card.remember ? `<div style="margin-bottom:12px;padding:12px;border-radius:12px;background:rgba(124,92,252,0.15)"><b>💡 Remember</b><p style="margin-top:4px">${card.remember}</p></div>` : ''}
      ${card.source ? `<p class="text-sm" style="color:var(--muted-star);margin-top:12px"><b>Source:</b> ${card.source}</p>` : ''}
    </div>`;
}

export default { render, renderDetail };