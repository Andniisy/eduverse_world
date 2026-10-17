/**
 * EDUVERSE — Navbar (V6)
 * PRINSIP: Tombol langsung memanggil router.navigate — tidak pakai event bus.
 * Ini menghilangkan semua kemungkinan bug listener leak.
 */

import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { el } from '../utils/helpers.js';
import { formatNumber } from '../utils/formatters.js';
import { progressionEngine } from '../engines/progressionEngine.js';
import { t } from '../core/i18n.js';
import modal from './modal.js';
import { createAvatar } from './avatarView.js';

export function render(container, opts = {}) {
  container.innerHTML = '';

  const user = state.getPath('user');
  const levelInfo = user ? progressionEngine.levelInfo(user.xp || 0) : null;
  const currentScreen = state.getPath('currentScreen', '');

  const nav = el(`
    <nav class="navbar" aria-label="Navigasi utama" 
         style="position:relative;z-index:100;pointer-events:auto">
      <a class="navbar-brand" href="#" id="nav-logo" aria-label="Beranda EDUVERSE" style="cursor:pointer">
        <span style="font-size:1.5rem">🌌</span><span>EDUVERSE</span>
      </a>
      <div class="navbar-nav" id="navbar-right"></div>
    </nav>
  `);

  const right = nav.querySelector('#navbar-right');

  // ── TOMBOL KEMBALI (kalau ada parent) ──
  if (opts.onBack) {
    const back = el(`<button class="nav-link" type="button" id="nav-back" 
      style="cursor:pointer;background:var(--space-surface);border:1px solid var(--muted-star)">
      ← ${opts.backLabel || 'Kembali'}
    </button>`);
    back.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof opts.onBack === 'function') opts.onBack();
    });
    right.appendChild(back);
  }

  // ── TOMBOL BERANDA ──
  const homeBtn = el(`<button class="nav-link" type="button" id="nav-home" 
    title="Kembali ke Halaman Utama" style="cursor:pointer">
    🏠 <span>Beranda</span>
  </button>`);
  homeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goLanding();
  });
  right.appendChild(homeBtn);

  // ── PROFIL RINGKAS: status lengkap muncul setelah avatar diklik ──
  if (user) {
    const profileBtn = el(`
      <button class="ev-navbar-profile" type="button" id="nav-profile" aria-label="Buka profil dan status pemain" title="Profil dan status pemain">
        <span class="ev-navbar-avatar" id="navbar-avatar-host"></span>
        <span class="ev-navbar-profile-copy"><strong>${escapeHtml(user.name || 'Pemain')}</strong><small>Lv ${levelInfo.level} · Profil</small></span>
        <span class="ev-navbar-chevron" aria-hidden="true">⌄</span>
      </button>
    `);
    const avatarHost = profileBtn.querySelector('#navbar-avatar-host');
    try { avatarHost.appendChild(createAvatar(user.avatar, { size: 38, bg: false })); }
    catch (e) { avatarHost.textContent = '👤'; }
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      router.navigate('profile');
    });
    right.appendChild(profileBtn);
  }

  // ── TOMBOL NAVIGASI (langsung panggil router) ──
  const links = [
    { screen: 'city',     label: t('nav.city'),    active: currentScreen === 'city' },
    { screen: 'worldMap', label: t('nav.worlds'),  active: currentScreen === 'worldMap' || currentScreen === 'world' },
    { screen: 'library',  label: t('nav.library'), active: currentScreen === 'library' }
  ];

  links.forEach(l => {
    const cls = `nav-link${l.active ? ' active' : ''}`;
    const btn = el(`<button class="${cls}" type="button" id="nav-${l.screen}" style="cursor:pointer">${l.label}</button>`);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        router.navigate(l.screen);
      } catch (err) {
        console.error(`[Navbar] Gagal navigasi ke ${l.screen}:`, err);
      }
    });

    right.appendChild(btn);
  });

  // ── Logo click ──
  nav.querySelector('#nav-logo').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goLanding();
  });

  container.appendChild(nav);
  return nav;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/* ── 🏠 Beranda → landing page ── */
function goLanding() {
  const user = state.getPath('user');
  const currentScreen = state.getPath('currentScreen');

  if (!user || currentScreen === 'landing') {
    router.navigate('landing');
    return;
  }

  modal.confirm({
    title: '🏠 Kembali ke Halaman Utama?',
    message: 'Progresmu tetap tersimpan. Kamu bisa lanjut kapan saja.',
    confirmLabel: 'Ya, ke Beranda',
    cancelLabel: 'Tetap di Sini'
  }).then((confirmed) => {
    if (!confirmed) return;
    state.flush();
    router.navigate('landing');
  });
}

export default { render };