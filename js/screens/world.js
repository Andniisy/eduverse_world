import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { app } from '../core/app.js';
import { progressionEngine } from '../engines/progressionEngine.js';
import { masteryEngine } from '../engines/masteryEngine.js';
import navbar from '../components/navbar.js';
import { t } from '../core/i18n.js';

function render(container, params) {
  container.innerHTML = '';

  const world = app.getWorld(params.worldId);
  if (!world) { router.navigate('worldMap'); return; }

  const worldName = t('world.' + world.id) || world.name;

  const root = el(`<div class="screen active">
    <div id="navbar-host"></div>
    <div class="container mt-8">
      <div class="page-header">
        <div style="font-size:4rem">${world.icon}</div>
        <h1>${worldName}</h1>
        <p>${world.description}</p>
      </div>
      <div class="grid grid-3" id="zones"></div>
    </div>
  </div>`);
  container.appendChild(root);

  navbar.render(root.querySelector('#navbar-host'), {
    backLabel: t('worldMap.title'),
    onBack: () => router.navigate('worldMap')
  });

  const host = root.querySelector('#zones');
  const zones = app.getZonesForWorld(world.id);

  zones.forEach(zone => {
    const unlocked = progressionEngine.isZoneUnlocked(world.id, zone.order);
    const mastery = masteryEngine.zoneMastery(zone.id);
    const quests = app.getQuestsForZone(zone.id);
    const completed = quests.filter(q => state.getPath(`progress.${q.id}`, null)?.completedAt).length;

    const card = el(`<div class="card card-interactive ${unlocked ? '' : 'locked'}" role="button" tabindex="0"
        aria-label="${zone.name}" style="${unlocked ? 'cursor:pointer' : 'opacity:0.5;filter:grayscale(0.6)'}">
      <div style="font-size:2.5rem">${zone.icon}</div>
      <h3 class="mt-2">${zone.name}</h3>
      <p class="text-sm mt-2" style="color:var(--muted-star)">${zone.description}</p>
      <div class="mt-4">
        <div class="flex justify-between text-sm mb-1" style="color:var(--muted-star)">
          <span>${t('zone.quests')}</span><span>${completed}/${quests.length}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width:${quests.length ? (completed / quests.length) * 100 : 0}%"></div>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-2 text-sm">
        <span style="color:var(--muted-star)">${t('zone.mastery')}:</span>
        <span>${masteryEngine.label(zone.concepts?.[0] || '')}</span>
        <span style="color:var(--muted-star)">${Math.round(mastery.score)}%</span>
      </div>
    </div>`);

    if (unlocked) {
      card.addEventListener('click', () => router.navigate('zone', { zoneId: zone.id }));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.navigate('zone', { zoneId: zone.id }); }
      });
    }
    host.appendChild(card);
  });

  const onCity = () => router.navigate('city');
  const onWorlds = () => router.navigate('worldMap');
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