import { el } from '../utils/helpers.js';
import { t } from '../core/i18n.js';

export function render(feedback, opts = {}) {
  const cls = {
    correct: 'feedback-correct',
    incorrect: 'feedback-incorrect',
    misconception: 'feedback-misconception',
    mastery: 'feedback-mastery'
  }[feedback.type] || 'feedback-incorrect';

  const icon = { correct: '✅', incorrect: '🎯', misconception: '💡', mastery: '🏆' }[feedback.type] || 'ℹ️';

  const panel = el(`<div class="feedback-panel ${cls}" role="status" aria-live="polite">
    <div class="flex items-start gap-3">
      <span style="font-size:1.5rem;flex-shrink:0">${icon}</span>
      <div style="flex:1">
        <p style="font-weight:700;font-size:var(--text-base)">${feedback.message || ''}</p>
        ${feedback.explanation ? `<p class="mt-2 text-sm" style="color:var(--soft-white);opacity:0.85">${feedback.explanation}</p>` : ''}
        ${feedback.misconceptionId ? `<p class="mt-2 text-xs" style="color:var(--muted-star)">${t('feedback.misconceptionDetected', { id: feedback.misconceptionId })}</p>` : ''}
      </div>
    </div>
    ${opts.showActions !== false ? `<div class="flex gap-3 mt-4 flex-wrap">
      ${(feedback.type === 'incorrect' || feedback.type === 'misconception')
        ? `<button class="btn btn-secondary" type="button" id="fb-retry">${t('feedback.tryAgain')}</button>` : ''}
      ${opts.canContinue !== false ? `<button class="btn btn-primary" type="button" id="fb-continue">${t('feedback.continue')}</button>` : ''}
    </div>` : ''}
  </div>`);

  const retryBtn = panel.querySelector('#fb-retry');
  if (retryBtn && typeof opts.onRetry === 'function') retryBtn.addEventListener('click', opts.onRetry);
  const contBtn = panel.querySelector('#fb-continue');
  if (contBtn && typeof opts.onContinue === 'function') contBtn.addEventListener('click', opts.onContinue);
  return panel;
}

export function renderMastery(mastery) {
  return el(`<div class="feedback-panel feedback-mastery" role="status">
    <div class="flex items-start gap-3">
      <span style="font-size:1.75rem">🏆</span>
      <div style="flex:1">
        <p style="font-weight:700;font-size:var(--text-lg)">${mastery.message || ''}</p>
        ${mastery.averageScore != null ? `<p class="mt-1 text-sm">Rata-rata penguasaan: ${mastery.averageScore}%</p>` : ''}
      </div>
    </div>
    ${mastery.conceptScores && mastery.conceptScores.length ? `<div class="mt-4 flex flex-col gap-2">
      ${mastery.conceptScores.map(c => `<div class="flex justify-between text-sm"><span>${c.name}</span><span>${Math.round(c.score)}%</span></div>`).join('')}
    </div>` : ''}
  </div>`);
}

export default { render, renderMastery };