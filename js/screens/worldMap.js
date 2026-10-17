import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { app } from '../core/app.js';
import { progressionEngine } from '../engines/progressionEngine.js';
import worldCard from '../components/worldCard.js';
import navbar from '../components/navbar.js';
import { t } from '../core/i18n.js';

function render(container) {
  container.innerHTML = '';

  const user = state.getPath('user');
  if (!user) { router.navigate('login'); return; }

  const root = el(`<div class="screen active">
    <div id="navbar-host"></div>
    <div class="container mt-8">
      <div class="page-header">
        <h1>${t('worldMap.title')}</h1>
        <p>${t('worldMap.subtitle')}</p>
      </div>
      <div class="grid grid-3" id="worlds"></div>
    </div>
  </div>`);
  container.appendChild(root);

  // ← Navbar dengan tombol Kembali
  navbar.render(root.querySelector('#navbar-host'), {
    backLabel: 'Kembali ke Kota',
    onBack: () => router.navigate('city')
  });

  const host = root.querySelector('#worlds');
  const worlds = app.getWorlds().sort((a, b) => a.order - b.order);

  worlds.forEach(world => {
    const unlocked = progressionEngine.isWorldUnlocked(world.id);
    const zones = app.getZonesForWorld(world.id);
    const totalQuests = zones.reduce((sum, z) => sum + app.getQuestsForZone(z.id).length, 0);
    const completedQuests = zones.reduce((sum, z) =>
      sum + app.getQuestsForZone(z.id).filter(q => state.getPath(`progress.${q.id}`, null)?.completedAt).length, 0);
    const progress = totalQuests ? (completedQuests / totalQuests) * 100 : 0;

    const worldData = {
      ...world,
      name: t('world.' + world.id) || world.name
    };

    host.appendChild(worldCard.render(worldData, {
      locked: !unlocked,
      progress,
      onClick: () => { if (unlocked) router.navigate('world', { worldId: world.id }); }
    }));
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