import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { app } from '../core/app.js';
import navbar from '../components/navbar.js';
import { formatDifficulty } from '../utils/formatters.js';
import { t } from '../core/i18n.js';

function render(container, params) {
  container.innerHTML = '';

  const quest = app.getQuest(params.questId);
  if (!quest) { router.navigate('worldMap'); return; }

  const zone = app.getZone(quest.zoneId);
  const world = app.getWorld(quest.worldId);
  const questions = app.getQuestionsForQuest(quest.id);
  const reward = app.getReward(quest.rewardId);
  const progress = state.getPath(`progress.${quest.id}`, null);

  const typeLabel = {
    learning:  t('quest.typeLearning'),
    challenge: t('quest.typeChallenge'),
    boss:      t('quest.typeBoss')
  }[quest.type];

  const root = el(`<div class="screen active">
    <div id="navbar-host"></div>
    <div class="container mt-8" style="max-width:720px">
      <div class="card">
        <div class="flex justify-between items-center flex-wrap gap-2">
          <span class="tag">${typeLabel}</span>
          <span class="difficulty">${formatDifficulty(quest.difficulty)}</span>
        </div>
        <h1 class="mt-3" style="font-family:var(--font-display)">${quest.name}</h1>
        <p class="mt-2" style="color:var(--muted-star)">${quest.description}</p>
        <p class="text-sm mt-2" style="color:var(--muted-star)">${world.icon} ${world.name} • ${zone.icon} ${zone.name}</p>

        <div class="grid grid-3 mt-6" style="gap:var(--space-4)">
          <div class="card" style="background:var(--space-surface);text-align:center">
            <div class="stat-value">${questions.length}</div>
            <div class="stat-label">${t('quest.interactions')}</div>
          </div>
          <div class="card" style="background:var(--space-surface);text-align:center">
            <div class="stat-value" style="color:var(--energy-gold)">+${reward?.xp || 75}</div>
            <div class="stat-label">${t('quest.xpReward')}</div>
          </div>
          <div class="card" style="background:var(--space-surface);text-align:center">
            <div class="stat-value" style="color:var(--energy-gold)">+${reward?.coins || 20}</div>
            <div class="stat-label">${t('quest.coins')}</div>
          </div>
        </div>

        ${quest.requiredScore ? `<div class="knowledge-flash mt-6">
          <div class="knowledge-flash-title">${t('quest.passThreshold')}</div>
          <p>${t('quest.passThresholdMsg', { score: quest.requiredScore, type: typeLabel })}</p>
        </div>` : ''}

        ${progress?.score != null ? `<div class="knowledge-flash mt-4">
          <div class="knowledge-flash-title">${t('quest.previousAttempt')}</div>
          <p>${t('quest.previousAttemptMsg', { score: progress.score })}</p>
        </div>` : ''}

        <div class="flex gap-3 mt-6 flex-wrap">
          <button class="btn btn-primary btn-lg" type="button" id="btn-start">${t('quest.begin')}</button>
          <button class="btn btn-secondary btn-lg" type="button" id="btn-back">${t('quest.back')}</button>
        </div>
      </div>
    </div>
  </div>`);
  container.appendChild(root);

  // ─── Navbar dengan tombol Kembali ───
  navbar.render(root.querySelector('#navbar-host'), {
    backLabel: zone.name,
    onBack: () => router.navigate('zone', { zoneId: zone.id })
  });

  // ─── Tombol Mulai & Kembali ───
  root.querySelector('#btn-start').addEventListener('click', () => router.navigate('gameplay', { questId: quest.id }));
  root.querySelector('#btn-back').addEventListener('click', () => router.navigate('zone', { zoneId: zone.id }));

  // ─── Listener navigasi navbar ───
  const onCity    = () => router.navigate('city');
  const onWorlds  = () => router.navigate('worldMap');
  const onLibrary = () => router.navigate('library');
  const onProfile = () => router.navigate('profile');

  events.on('nav:city', onCity);
  events.on('nav:worlds', onWorlds);
  events.on('nav:library', onLibrary);
  events.on('nav:profile', onProfile);

  root._cleanup = () => {
    events.off('nav:city', onCity);
    events.off('nav:worlds', onWorlds);
    events.off('nav:library', onLibrary);
    events.off('nav:profile', onProfile);
  };
}

function teardown() {}

export default { render, teardown };