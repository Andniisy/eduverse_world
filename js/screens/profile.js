import { createAvatar } from '../components/avatarView.js';
import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { app } from '../core/app.js';
import navbar from '../components/navbar.js';
import { progressionEngine } from '../engines/progressionEngine.js';
import { masteryEngine } from '../engines/masteryEngine.js';
import { cardEngine } from '../engines/cardEngine.js';
import { t } from '../core/i18n.js';

function render(container) {
  container.innerHTML = '';

  const user = state.getPath('user');
  if (!user) { router.navigate('login'); return; }
  const levelInfo = progressionEngine.levelInfo(user.xp || 0);
  const cards = cardEngine.summary();

  const root = el(`<div class="screen active">
    <div id="navbar-host"></div>
    <div class="container mt-8">
      <div class="page-header">
        <h1>${t('profile.title')}</h1>
        <p>${t('profile.subtitle')}</p>
      </div>

      <div class="card mb-6">
        <div class="flex items-center gap-4 flex-wrap">
          <div id="profile-avatar-host" style="
            width:120px;height:156px;border-radius:16px;overflow:hidden;
            border:3px solid var(--cosmic-purple);
            display:flex;align-items:center;justify-content:center;
            background:var(--space-surface);flex-shrink:0
          "></div>
          <div style="flex:1;min-width:220px">
            <h2>${user.name}</h2>
            <p style="color:var(--knowledge-cyan);font-weight:700">${t('profile.levelTitle', { level: levelInfo.level, title: levelInfo.title })}</p>
            <div class="progress-bar mt-3" style="max-width:400px">
              <div class="progress-bar-fill" style="width:${levelInfo.progress}%"></div>
            </div>
            <p class="text-sm mt-1" style="color:var(--muted-star)">${user.xp || 0} XP • 🪙 ${user.coins || 0} ${t('city.statCoins')}</p>
          </div>
          <button class="btn btn-secondary" id="btn-edit">${t('profile.editAvatar')}</button>
        </div>
      </div>

      <div class="grid grid-4 mb-8">
        ${stat('🃏', t('profile.cards'), `${cards.owned}/${cards.total}`)}
        ${stat('🏅', t('profile.badges'), (user.badges || []).length)}
        ${stat('💎', t('profile.crystals'), (user.crystals || []).length)}
        ${stat('🐾', t('profile.pets'), (user.pets || []).length)}
      </div>

      <div class="grid grid-2 mb-8">
        <div class="card"><h3 class="mb-3">${t('profile.streak')}</h3>
          <p class="stat-value" style="color:var(--energy-gold)">${t('profile.streakDays', { n: user.streak?.current || 0 })}</p>
          <p class="text-sm mt-2" style="color:var(--muted-star)">${t('profile.longestStreak', { n: user.streak?.longest || 0 })}</p>
        </div>
        <div class="card"><h3 class="mb-3">${t('profile.worldsDiscovered')}</h3>
          <p class="stat-value">${(user.worldsUnlocked || []).length}/5</p>
          <div class="flex gap-2 mt-2 flex-wrap">
            ${app.getWorlds().map(w => {
              const unlocked = (user.worldsUnlocked || []).includes(w.id);
              return `<span class="tag" style="${unlocked ? '' : 'opacity:0.4'}">${w.icon} ${t('world.' + w.id) || w.name}</span>`;
            }).join('')}
          </div>
        </div>
      </div>

      <h3 class="mb-3">🏅 ${t('profile.badges')}</h3>
      <div class="grid grid-4 mb-8" id="badges-grid"></div>

      <h3 class="mb-3">${t('profile.conceptMastery')}</h3>
      <div id="mastery-list"></div>
    </div>
  </div>`);
  container.appendChild(root);

  // ← Navbar dengan tombol Kembali
  navbar.render(root.querySelector('#navbar-host'), {
    backLabel: 'Kembali ke Kota',
    onBack: () => router.navigate('city')
  });

  // Render avatar
  const avHost = root.querySelector('#profile-avatar-host');
  if (avHost) {
    try {
      avHost.appendChild(createAvatar(user.avatar, { size: 110, bg: false }));
    } catch (e) {
      console.warn('[Profile] Avatar render failed:', e);
      avHost.textContent = '🧑';
      avHost.style.fontSize = '3rem';
    }
  }

  const badgesGrid = root.querySelector('#badges-grid');
  const ownedBadges = (user.badges || []);
  if (!ownedBadges.length) badgesGrid.appendChild(el(`<p style="grid-column:1/-1;color:var(--muted-star)">${t('profile.noBadges')}</p>`));
  else ownedBadges.forEach(bid => {
    const b = app.getBadge(bid);
    if (!b) return;
    badgesGrid.appendChild(el(`<div class="card" style="text-align:center;background:var(--space-surface)">
      <div style="font-size:2rem">${b.icon}</div>
      <p class="mt-2 text-sm"><b>${b.name}</b></p>
      <p class="text-xs mt-1" style="color:var(--muted-star)">${b.description || ''}</p>
    </div>`));
  });

  const masteryList = root.querySelector('#mastery-list');
  const mastery = state.getPath('mastery', {});
  const concepts = Object.values(mastery).filter(m => m.interactions >= 1).sort((a, b) => (b.score || 0) - (a.score || 0));
  if (!concepts.length) masteryList.appendChild(el(`<p style="color:var(--muted-star)">${t('profile.noMastery')}</p>`));
  else concepts.forEach(m => {
    const c = app.getConcepts().find(x => x.id === m.conceptId);
    if (!c) return;
    masteryList.appendChild(el(`<div class="card mb-2" style="background:var(--space-surface);padding:var(--space-3)">
      <div class="flex justify-between items-center flex-wrap gap-2">
        <div><b>${c.name}</b> <span class="text-xs" style="color:var(--muted-star)">${c.worldId} • ${c.zoneId}</span></div>
        <div class="flex items-center gap-3">
          <span class="text-sm">${masteryEngine.label(m.conceptId)}</span>
          <span class="text-sm" style="color:var(--muted-star)">${Math.round(m.score)}%</span>
        </div>
      </div>
      <div class="progress-bar mt-2"><div class="progress-bar-fill" style="width:${m.score}%"></div></div>
    </div>`));
  });

  root.querySelector('#btn-edit').addEventListener('click', () => router.navigate('avatar'));

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

function stat(icon, label, value) {
  return `<div class="card" style="text-align:center;background:var(--space-surface)">
    <div style="font-size:1.5rem">${icon}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>`;
}

export default { render };