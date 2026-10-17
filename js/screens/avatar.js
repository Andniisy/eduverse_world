/**
 * EDUVERSE — Pemilihan Avatar Berbasis Profesi
 * Menggunakan aset PNG asli dari assets/avatars.
 */
import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events, EVT } from '../core/events.js';
import { analyticsEngine } from '../engines/analyticsEngine.js';
import { createAvatar } from '../components/avatarView.js';

const PROFESSIONS = [
  { id: 'scientist', label: 'Ilmuwan', description: 'Mengamati, meneliti, dan menemukan jawaban.', icon: '🔬', avatarKey: 'student-girl-1', gender: 'female' },
  { id: 'digital-ranger', label: 'Digital Ranger', description: 'Menjelajah dunia teknologi dengan bijak.', icon: '🤖', avatarKey: 'Robot', gender: 'male' },
  { id: 'explorer', label: 'Penjelajah', description: 'Berani menemukan pengetahuan baru.', icon: '🧭', avatarKey: 'student-boy-1', gender: 'male' },
  { id: 'culture-explorer', label: 'Penjelajah Budaya', description: 'Mengenal keragaman budaya Nusantara.', icon: '🌏', avatarKey: 'student-boy-2', gender: 'male' },
  { id: 'student', label: 'Pelajar', description: 'Belajar, bertumbuh, dan meraih prestasi.', icon: '📚', avatarKey: 'student-girl-2', gender: 'female' }
];

function render(container) {
  container.innerHTML = '';
  const user = state.getPath('user');
  if (!user) { router.navigate('login'); return; }

  const savedRole = user.avatar?.role || user.avatar?.outfit || 'explorer';
  const draft = { role: PROFESSIONS.some(p => p.id === savedRole) ? savedRole : 'explorer' };
  const root = el(`
    <div class="screen active">
      <div class="container mt-8" style="max-width:1080px;padding-bottom:36px">
        <div class="page-header">
          <h1>✨ Pilih Profesi Avatar</h1>
          <p>Pilih peran yang akan menemanimu menjelajahi dunia EDUVERSE.</p>
        </div>
        <div class="ev-avatar-layout">
          <section class="card ev-avatar-preview">
            <p class="ev-eyebrow">PRATINJAU AVATAR</p>
            <div id="ev-avatar-preview-image" class="ev-avatar-image"></div>
            <h2 id="ev-avatar-name" class="ev-avatar-name"></h2>
            <p id="ev-avatar-profession" class="ev-avatar-profession"></p>
            <p class="ev-avatar-hint">Avatar pilihanmu akan digunakan selama petualangan.</p>
            <button class="btn btn-primary btn-lg" type="button" id="ev-avatar-save">✓ Mulai Petualangan</button>
          </section>
          <section class="ev-profession-panel">
            <h2 class="ev-profession-title">Pilih profesimu</h2>
            <p class="ev-profession-subtitle">Setiap profesi memiliki avatar dan gaya khasnya sendiri.</p>
            <div class="ev-profession-grid" id="ev-profession-grid"></div>
          </section>
        </div>
      </div>
    </div>
  `);
  container.appendChild(root);

  const previewImage = root.querySelector('#ev-avatar-preview-image');
  const grid = root.querySelector('#ev-profession-grid');

  function redraw() {
    const chosen = PROFESSIONS.find(p => p.id === draft.role) || PROFESSIONS[2];
    previewImage.replaceChildren(createAvatar({ role: chosen.id }, { size: 220, bg: false }));
    root.querySelector('#ev-avatar-name').textContent = user.name || 'Penjelajah EDUVERSE';
    root.querySelector('#ev-avatar-profession').textContent = `${chosen.icon} ${chosen.label}`;
    grid.innerHTML = '';
    PROFESSIONS.forEach(profession => {
      const active = profession.id === draft.role;
      const button = el(`
        <button type="button" class="ev-profession-card ${active ? 'is-selected' : ''}"
          aria-pressed="${active}" data-profession="${profession.id}">
          <span class="ev-profession-thumb"></span>
          <span class="ev-profession-copy">
            <strong>${profession.label}</strong>
            <small>${profession.description}</small>
          </span>
          <span class="ev-profession-check" aria-hidden="true">${active ? '✓' : ''}</span>
        </button>
      `);
      button.querySelector('.ev-profession-thumb').appendChild(createAvatar({ role: profession.id }, { size: 72, bg: false }));
      button.addEventListener('click', () => { draft.role = profession.id; redraw(); });
      grid.appendChild(button);
    });
  }

  root.querySelector('#ev-avatar-save').addEventListener('click', () => {
    const chosen = PROFESSIONS.find(p => p.id === draft.role) || PROFESSIONS[2];
    // gender tetap disimpan untuk kompatibilitas dengan pemeriksaan avatar versi lama.
    const avatar = {
      role: chosen.id,
      outfit: chosen.id,
      gender: chosen.gender,
      avatarKey: chosen.avatarKey,
      hair: null,
      accessories: []
    };
    state.setPath('user.avatar', avatar);
    events.emit(EVT.AVATAR_CREATED, avatar);
    analyticsEngine.track(EVT.AVATAR_CREATED, avatar);
    state.flush();
    router.navigate('city');
  });
  redraw();
}

export { render };
export default { render };
