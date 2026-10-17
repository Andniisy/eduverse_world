/**
 * EDUVERSE — Landing Screen (V4)
 * - Entry point utama
 * - Modal kustom untuk konfirmasi (bukan confirm() bawaan)
 * - Ganti penjelajah → reload via router (anti double render)
 */

import { el } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { app } from '../core/app.js';
import { state } from '../core/state.js';
import { t } from '../core/i18n.js';
import modal from '../components/modal.js';

function render(container) {
  // Bersihkan container dulu — penting supaya tidak ada sisa render sebelumnya
  container.innerHTML = '';

  const worlds = app.getWorlds().sort((a, b) => a.order - b.order);
  const user = state.getPath('user');
  const hasAvatar = user && user.avatar && user.avatar.gender;

  // Label tombol utama
  let primaryLabel = t('landing.begin');
  let primaryTarget = 'login';
  if (user && !hasAvatar) {
    primaryLabel = '🎨 Buat Avatar';
    primaryTarget = 'avatar';
  } else if (user && hasAvatar) {
    primaryLabel = '▶ Lanjutkan Perjalanan';
    primaryTarget = 'city';
  }

  // ─── Root wrapper ───────────────────────────
  const root = el(`
    <div class="screen active" style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 120px);padding:var(--space-6) 0">
      <div class="container" style="max-width:900px;text-align:center">
        <div style="font-size:5rem;margin-bottom:var(--space-4)">🌌</div>
        <h1 style="font-family:var(--font-display);font-size:var(--text-4xl);margin-bottom:var(--space-3)">
          EDUVERSE
        </h1>
        <p style="color:var(--knowledge-cyan);font-weight:700;font-size:var(--text-lg);margin-bottom:var(--space-3)">
          ${t('landing.motto')}
        </p>
        <p style="color:var(--muted-star);margin-bottom:var(--space-8);max-width:600px;margin-left:auto;margin-right:auto">
          ${t('landing.welcome')}
        </p>

        ${user ? `
          <div class="card mb-6" style="max-width:480px;margin:0 auto var(--space-6)">
            <p class="text-sm" style="color:var(--muted-star)">Halo kembali,</p>
            <p style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:700;margin-top:4px">
              ${user.name}
            </p>
            <p class="text-sm mt-1" style="color:var(--knowledge-cyan)">
              Level ${user.level || 1} • ⭐ ${user.xp || 0} XP • 🪙 ${user.coins || 0}
            </p>
            <button class="btn btn-secondary btn-sm mt-3" type="button" id="btn-logout-student">
              🚪 Ganti Penjelajah
            </button>
          </div>
        ` : ''}

        <div class="flex gap-3 justify-center flex-wrap mb-10">
          <button class="btn btn-primary btn-lg" type="button" id="btn-start">
            ${primaryLabel}
          </button>
        </div>

        <div class="landing-teacher-entry">
          <span>${t('landing.teacherHint')}</span>
          <button class="btn btn-secondary btn-sm" type="button" id="btn-teacher">${t('landing.teacherLogin')}</button>
        </div>

        <div style="border-top:1px solid var(--space-surface);padding-top:var(--space-8);margin-top:var(--space-8)">
          <h2 style="font-family:var(--font-display);font-size:var(--text-2xl);margin-bottom:var(--space-2)">
            ${t('landing.worldsTitle')}
          </h2>
          <p style="color:var(--muted-star);margin-bottom:var(--space-6)">
            ${t('landing.worldsSubtitle')}
          </p>
          <div id="worlds-info"></div>
        </div>

      </div>
    </div>
  `);

  container.appendChild(root);

  // ─── Kartu dunia (hanya informasi) ──────────
  const worldsHost = root.querySelector('#worlds-info');
  const grid = el(`<div class="landing-world-grid" style="text-align:left"></div>`);
  worlds.forEach(w => {
    grid.appendChild(el(`
      <div class="card" style="cursor:default;opacity:0.9">
        <div style="font-size:2.5rem;margin-bottom:var(--space-2)">${w.icon}</div>
        <h3 style="font-size:var(--text-lg)">${t('world.' + w.id) || w.name}</h3>
        <p class="text-sm mt-2" style="color:var(--muted-star)">${w.description}</p>
      </div>
    `));
  });
  worldsHost.appendChild(grid);

  // ─── Tombol utama ────────────────────────────
  root.querySelector('#btn-start').addEventListener('click', () => {
    router.navigate(primaryTarget);
  });

  // ─── Tombol ganti penjelajah (pakai modal kustom) ────
  const logoutBtn = root.querySelector('#btn-logout-student');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      modal.confirm({
        title: '🚪 Ganti Penjelajah?',
        message: 'Progresmu akan tetap tersimpan. Kamu bisa masuk lagi dengan nama lain.',
        confirmLabel: 'Ya, Ganti',
        cancelLabel: 'Batal'
      }).then((confirmed) => {
        if (!confirmed) return;

        // Hapus identitas user (progress di localStorage tetap ada per user)
        state.setPath('user', null);
        state.flush();

        // Navigasi ulang via router — router otomatis clear container dulu
        router.navigate('landing');
      });
    });
  }

  // ─── Tombol login guru ───────────────────────
  root.querySelector('#btn-teacher').addEventListener('click', () => {
    window.location.href = 'teacher.html';
  });
}

export default { render };