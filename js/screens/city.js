/**
 * EDUVERSE - Edu City (V3 Fixed)
 * - Fix: Pembersihan event listener pada teardown
 * - Delegasi event klik tunggal tanpa konflik capture listener
 */
import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { progressionEngine } from '../engines/progressionEngine.js';
import { cardEngine } from '../engines/cardEngine.js';
import navbar from '../components/navbar.js';
import modal from '../components/modal.js';
import { t } from '../core/i18n.js';

const LOCATIONS = [
  { id: 'arcade', icon: '🎮', nameKey: 'city.locArcade', descKey: 'city.locArcadeDesc', action: 'arcade', featured: true, eyebrow: 'MAIN QUEST', cta: 'Mainkan Mini-Game' },
  { id: 'portal', icon: '🌌', nameKey: 'city.locPortal', descKey: 'city.locPortalDesc', action: 'worldMap', featured: true, eyebrow: 'JELAJAHI DUNIA', cta: 'Pilih Dunia Belajar' },
  { id: 'academy', icon: '🏛️', nameKey: 'city.locAcademy', descKey: 'city.locAcademyDesc', action: 'library' },
  { id: 'shop', icon: '🛍️', nameKey: 'city.locShop', descKey: 'city.locShopDesc', action: 'shop' },
  { id: 'room', icon: '🛋️', nameKey: 'city.locRoom', descKey: 'city.locRoomDesc', action: 'room' },
  { id: 'fame', icon: '🏆', nameKey: 'city.locFame', descKey: 'city.locFameDesc', action: 'hallOfFame' }
];

let activeCleanup = null;

function render(container) {
  container.innerHTML = '';
  const user = state.getPath('user');
  if (!user) { router.navigate('login'); return; }

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const levelInfo = progressionEngine.levelInfo(user.xp || 0);

  const root = el(`
    <div class="screen active" style="pointer-events:auto">
      <div id="navbar-host"></div>
      <div class="container ev-city-container" style="position:relative;z-index:1">
        <section class="ev-city-welcome">
          <div class="ev-city-welcome-copy">
            <span class="ev-city-kicker">PETUALANGANMU DIMULAI DI SINI</span>
            <h1>Petualangan dimulai, ${escapeHtml(user.name)}!</h1>
            <p>Pilih mini-game untuk mengasah kemampuan atau buka Portal Dunia untuk menjelajahi lima dunia pengetahuan.</p>
          </div>
          <div class="ev-city-progress-chip">
            <span>⭐</span>
            <div><strong>Tingkat ${levelInfo.level}</strong><small>${levelInfo.title}</small></div>
          </div>
        </section>
        <section class="ev-featured-activities" aria-label="Aktivitas utama">
          <h2>Mulai Petualangan</h2>
          <div class="ev-featured-grid" id="featured-locations"></div>
        </section>
        <section class="ev-other-places">
          <div class="ev-section-heading">
            <h2>Tempat Lainnya</h2>
            <p>Jelajahi, kumpulkan hadiah, dan atur ruang pribadimu.</p>
          </div>
          <div class="ev-secondary-grid" id="secondary-locations"></div>
        </section>
      </div>
    </div>
  `);
  container.appendChild(root);

  try {
    navbar.render(root.querySelector('#navbar-host'));
  } catch (e) {
    console.error('[City] Navbar render failed:', e);
  }

  const featuredHost = root.querySelector('#featured-locations');
  const secondaryHost = root.querySelector('#secondary-locations');

  LOCATIONS.forEach(loc => {
    const host = loc.featured ? featuredHost : secondaryHost;
    const card = el(loc.featured ? `
      <button class="ev-feature-card ev-feature-${loc.id}" type="button" data-loc-id="${loc.id}" data-action="${loc.action}" aria-label="${t(loc.nameKey)}">
        <span class="ev-feature-art" aria-hidden="true">
          <span class="ev-feature-orbit"></span>
          <span class="ev-feature-icon">${loc.icon}</span>
          <span class="ev-feature-spark spark-one">✨</span>
          <span class="ev-feature-spark spark-two">✨</span>
        </span>
        <span class="ev-feature-content">
          <span class="ev-feature-eyebrow">${loc.eyebrow}</span>
          <strong>${t(loc.nameKey)}</strong>
          <span class="ev-feature-desc">${t(loc.descKey)}</span>
          <span class="ev-feature-cta">${loc.cta} <span aria-hidden="true">➔</span></span>
        </span>
      </button>
    ` : `
      <button class="ev-secondary-card" type="button" data-loc-id="${loc.id}" data-action="${loc.action}">
        <span class="ev-secondary-icon" aria-hidden="true">${loc.icon}</span>
        <span class="ev-secondary-copy"><strong>${t(loc.nameKey)}</strong><small>${t(loc.descKey)}</small></span>
        <span class="ev-secondary-arrow" aria-hidden="true">➔</span>
      </button>
    `);
    host.appendChild(card);
  });

  const handleCityClick = (e) => {
    const card = e.target.closest('[data-action]');
    if (!card || !root.contains(card)) return;
    e.preventDefault();
    handleLocation(card.dataset.action, card.dataset.locId);
  };

  root.addEventListener('click', handleCityClick);

  const onCity    = () => router.navigate('city');
  const onWorlds  = () => router.navigate('worldMap');
  const onLibrary = () => router.navigate('library');
  const onProfile = () => router.navigate('profile');

  events.on('nav:city', onCity);
  events.on('nav:worlds', onWorlds);
  events.on('nav:library', onLibrary);
  events.on('nav:profile', onProfile);

  activeCleanup = () => {
    root.removeEventListener('click', handleCityClick);
    events.off('nav:city', onCity);
    events.off('nav:worlds', onWorlds);
    events.off('nav:library', onLibrary);
    events.off('nav:profile', onProfile);
  };
}

function teardown() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

function handleLocation(action, locId) {
  switch (action) {
    case 'worldMap':
      router.navigate('worldMap');
      break;
    case 'arcade':
      router.navigate('arcade');
      break;
    case 'library':
      router.navigate('library');
      break;
    case 'shop':
    case 'room':
    case 'hallOfFame': {
      const nameMap = {
        shop: t('city.locShop'),
        room: t('city.locRoom'),
        hallOfFame: t('city.locFame')
      };
      const msgMap = {
        shop: 'Toko kosmetik segera hadir — hanya menjual barang kosmetik.',
        room: 'Kustomisasi kamar segera hadir. Peliharaanmu akan tinggal di sini!',
        hallOfFame: 'Balai Kehormatan segera hadir — merayakan pencapaian, bukan peringkat.'
      };
      modal.alert({ title: nameMap[action], message: msgMap[action] });
      break;
    }
    default:
      console.warn('[City] Unknown action:', action);
  }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export default { render, teardown };