import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { app } from '../core/app.js';
import questCard from '../components/questCard.js';
import modal from '../components/modal.js';
import navbar from '../components/navbar.js';
import { questEngine } from '../engines/questEngine.js';
import { t } from '../core/i18n.js';

function render(container, params) {
  container.innerHTML = '';

  const zone = app.getZone(params.zoneId);
  if (!zone) { router.navigate('worldMap'); return; }
  const world = app.getWorld(zone.worldId);
  const worldName = t('world.' + world.id) || world.name;

  const root = el(`<div class="screen active">
    <div id="navbar-host"></div>
    <div class="container mt-8">
      <div class="page-header">
        <div style="font-size:4rem">${zone.icon}</div>
        <h1>${zone.name}</h1>
        <p>${zone.description}</p>
        <p class="text-sm mt-2" style="color:var(--muted-star)">${world.icon} ${worldName}</p>
      </div>
      <div id="quest-groups"></div>
    </div>
  </div>`);
  container.appendChild(root);

  navbar.render(root.querySelector('#navbar-host'), {
    backLabel: worldName,
    onBack: () => router.navigate('world', { worldId: world.id })
  });

  const groupsHost = root.querySelector('#quest-groups');
  const quests = app.getQuestsForZone(zone.id);
  const groups = [
    { type: 'learning',  label: t('zone.learningQuests'), quests: quests.filter(q => q.type === 'learning') },
    { type: 'challenge', label: t('zone.challenge'),      quests: quests.filter(q => q.type === 'challenge') },
    { type: 'boss',      label: t('zone.boss'),           quests: quests.filter(q => q.type === 'boss') }
  ];

  groups.forEach(group => {
    if (!group.quests.length) return;
    groupsHost.appendChild(el(`<h2 class="mt-8 mb-4">${group.label}</h2>`));
    const grid = el(`<div class="grid grid-2"></div>`);
    group.quests.forEach(quest => {
      const progress = state.getPath(`progress.${quest.id}`, null);
      const status = computeStatus(quest, progress);
      grid.appendChild(questCard.render(quest, {
        status,
        score: progress?.score,
        rewardXP: app.getReward(quest.rewardId)?.xp,
        onClick: () => handleQuestClick(quest, status)
      }));
    });
    groupsHost.appendChild(grid);
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

function computeStatus(quest, progress) {
  if (!questEngine.isUnlocked(quest.id)) return 'locked';
  if (progress?.completedAt) return 'completed';
  if (progress?.status === 'failed') return 'failed';
  return 'available';
}

function handleQuestClick(quest, status) {
  if (status === 'locked') {
    modal.alert({
      title: t('zone.lockedTitle'),
      message: quest.type === 'challenge'
        ? t('zone.lockedChallengeMsg')
        : quest.type === 'boss'
          ? t('zone.lockedBossMsg')
          : t('zone.lockedDefaultMsg')
    });
    return;
  }
  router.navigate('quest', { questId: quest.id });
}

export default { render, teardown };