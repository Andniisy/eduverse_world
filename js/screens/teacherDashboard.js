/**
 * EDUVERSE — Teacher Dashboard (V2)
 * - Login-gated (lihat teacher.html)
 * - Bisa export CSV + JSON
 * - Bisa import data siswa dari file JSON (untuk kumpulkan data dari beberapa komputer)
 * - Tidak membuat peringkat publik
 */

import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { app } from '../core/app.js';
import { auth } from '../core/auth.js';
import { t } from '../core/i18n.js';
import { analyticsEngine } from '../engines/analyticsEngine.js';
import { masteryEngine } from '../engines/masteryEngine.js';
import { performanceLabel } from '../utils/formatters.js';

let currentView = 'overview';

export function render(container) {
  container.innerHTML = '';
  const teacher = auth.current();

  container.appendChild(el(`
    <div class="screen active" style="display:flex;min-height:100vh">
      <aside style="width:280px;background:var(--deep-space);border-right:1px solid var(--space-surface);padding:var(--space-6);flex-shrink:0;display:flex;flex-direction:column">
        <div style="margin-bottom:var(--space-6)">
          <h2 style="font-family:var(--font-display);font-size:var(--text-xl)">${t('teacher.title')}</h2>
          <p class="text-sm mt-1" style="color:var(--muted-star)">
            ${t('teacher.welcome', { name: teacher?.name || 'Guru' })}
          </p>
        </div>
        <nav id="sidebar" style="display:flex;flex-direction:column;gap:var(--space-2);flex:1"></nav>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-4)">
          <button class="btn btn-secondary" type="button" id="btn-logout">
            ${t('teacher.logout')}
          </button>
          <a href="index.html" class="btn btn-secondary" style="text-decoration:none;text-align:center">
            ${t('teacher.backToApp')}
          </a>
        </div>
      </aside>
      <main style="flex:1;padding:var(--space-8);overflow-x:auto">
        <div id="dashboard-content"></div>
      </main>
    </div>
  `));

  renderSidebar();
  renderView();

  container.querySelector('#btn-logout').addEventListener('click', () => {
    if (confirm('Yakin ingin keluar?')) {
      auth.logout();
      window.location.reload();
    }
  });
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  const items = [
    { id: 'overview',       label: t('teacher.navOverview') },
    { id: 'students',       label: t('teacher.navStudents') },
    { id: 'mastery',        label: t('teacher.navMastery') },
    { id: 'misconceptions', label: t('teacher.navMisconceptions') },
    { id: 'trends',         label: t('teacher.navTrends') },
    { id: 'hints',          label: t('teacher.navHints') },
    { id: 'questions',      label: t('teacher.navQuestions') },
    { id: 'cards',          label: t('teacher.navCards') },
    { id: 'reports',        label: t('teacher.navReports') }
  ];
  items.forEach(item => {
    const btn = el(`<button class="nav-link" type="button" style="text-align:left">${item.label}</button>`);
    btn.addEventListener('click', () => { currentView = item.id; renderView(); });
    sidebar.appendChild(btn);
  });
}

function renderView() {
  const host = document.getElementById('dashboard-content');
  host.innerHTML = '';
  const renderers = {
    overview: renderOverview, students: renderStudents, mastery: renderMastery,
    misconceptions: renderMisconceptions, trends: renderTrends, hints: renderHints,
    questions: renderQuestions, cards: renderCards, reports: renderReports
  };
  (renderers[currentView] || renderOverview)(host);
}

/* ── Views ─────────────────────────────── */

function renderOverview(host) {
  const events = state.getPath('analytics.events', []);
  const user = state.getPath('user');
  const totalAnswered = events.filter(e => e.type === 'question:answered').length;
  const questsCompleted = events.filter(e => e.type === 'quest:completed').length;
  const hintsUsed = events.filter(e => e.type === 'hint:used').length;
  const cardsEarned = events.filter(e => e.type === 'card:unlocked').length;

  host.appendChild(el(`<h1 class="mb-6">${t('teacher.overviewTitle')}</h1>`));
  host.appendChild(el(`<div class="grid grid-4 mb-8">
    ${statCard('👥', t('teacher.activeStudents'), user ? 1 : 0)}
    ${statCard('❓', t('teacher.questionsAnswered'), totalAnswered)}
    ${statCard('🏁', t('teacher.questsCompleted'), questsCompleted)}
    ${statCard('💡', t('teacher.hintsUsed'), hintsUsed)}
  </div>`));

  const masteryAll = state.getPath('mastery', {});
  const conceptCount = Object.keys(masteryAll).length;
  const avgMastery = conceptCount ? Math.round(Object.values(masteryAll).reduce((s, m) => s + (m.score || 0), 0) / conceptCount) : 0;

  host.appendChild(el(`<h2 class="mb-3">${t('teacher.classMastery')}</h2>`));
  host.appendChild(el(`<div class="card mb-6">
    <div class="flex justify-between items-center mb-2">
      <span>${t('teacher.avgMastery', { count: conceptCount })}</span>
      <b>${avgMastery}% — ${performanceLabel(avgMastery)}</b>
    </div>
    <div class="progress-bar"><div class="progress-bar-fill" style="width:${avgMastery}%"></div></div>
  </div>`));

  if (cardsEarned) {
    host.appendChild(el(`<p class="text-sm" style="color:var(--muted-star)">${t('teacher.cardsUnlocked', { n: cardsEarned })}</p>`));
  }
}

function renderStudents(host) {
  const user = state.getPath('user');
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.studentsTitle')}</h1>`));
  if (!user) { host.appendChild(el(`<p style="color:var(--muted-star)">${t('teacher.noStudent')}</p>`)); return; }

  const mastery = state.getPath('mastery', {});
  const concepts = Object.keys(mastery).length;
  const avgScore = concepts ? Math.round(Object.values(mastery).reduce((s, m) => s + (m.score || 0), 0) / concepts) : 0;

  host.appendChild(el(`<div class="card">
    <table style="width:100%;text-align:left;border-collapse:collapse">
      <thead><tr style="border-bottom:1px solid var(--space-surface)">
        <th style="padding:12px 8px">${t('teacher.colStudent')}</th>
        <th style="padding:12px 8px">${t('teacher.colLevel')}</th>
        <th style="padding:12px 8px">${t('teacher.colQuests')}</th>
        <th style="padding:12px 8px">${t('teacher.colMastery')}</th>
        <th style="padding:12px 8px">${t('teacher.colLastActivity')}</th>
      </tr></thead>
      <tbody><tr>
        <td style="padding:12px 8px"><b>${user.name}</b></td>
        <td style="padding:12px 8px">Lv ${user.level || 1}</td>
        <td style="padding:12px 8px">${Object.values(state.getPath('progress', {})).filter(p => p.completedAt).length}</td>
        <td style="padding:12px 8px">${avgScore}%</td>
        <td style="padding:12px 8px">${lastActivity()}</td>
      </tr></tbody>
    </table>
  </div>`));
  host.appendChild(el(`<p class="text-sm mt-4" style="color:var(--muted-star)">${t('teacher.noRanking')}</p>`));
}

function renderMastery(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.masteryTitle')}</h1>`));
  const mastery = state.getPath('mastery', {});
  const sorted = Object.values(mastery).sort((a, b) => (b.score || 0) - (a.score || 0));
  if (!sorted.length) { host.appendChild(el(`<p style="color:var(--muted-star)">${t('teacher.noMastery')}</p>`)); return; }
  host.appendChild(el(`<div class="card"><table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:1px solid var(--space-surface);text-align:left">
      <th style="padding:12px 8px">${t('teacher.colConcept')}</th>
      <th style="padding:12px 8px">${t('teacher.colMastery')}</th>
      <th style="padding:12px 8px">${t('teacher.colStatus')}</th>
      <th style="padding:12px 8px">${t('teacher.colInteractions')}</th>
      <th style="padding:12px 8px">${t('teacher.colCorrect')}</th>
      <th style="padding:12px 8px">${t('teacher.colWrong')}</th>
    </tr></thead>
    <tbody>${sorted.map(m => {
      const c = app.getConcepts().find(x => x.id === m.conceptId);
      return `<tr style="border-bottom:1px solid var(--space-surface)">
        <td style="padding:12px 8px">${c?.name || m.conceptId}</td>
        <td style="padding:12px 8px">${Math.round(m.score || 0)}%</td>
        <td style="padding:12px 8px">${masteryEngine.label(m.conceptId)}</td>
        <td style="padding:12px 8px">${m.interactions || 0}</td>
        <td style="padding:12px 8px">${m.correct || 0}</td>
        <td style="padding:12px 8px">${m.wrong || 0}</td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`));
}

function renderMisconceptions(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.misconceptionsTitle')}</h1>`));
  const list = analyticsEngine.misconceptionAnalytics();
  if (!list.length) { host.appendChild(el(`<p style="color:var(--muted-star)">${t('teacher.noMisconceptions')}</p>`)); return; }
  host.appendChild(el(`<div class="card"><table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:1px solid var(--space-surface);text-align:left">
      <th style="padding:12px 8px">${t('teacher.colMisconception')}</th>
      <th style="padding:12px 8px">${t('teacher.colDescription')}</th>
      <th style="padding:12px 8px">${t('teacher.colFrequency')}</th>
      <th style="padding:12px 8px">${t('teacher.colStudents')}</th>
      <th style="padding:12px 8px">${t('teacher.colSuggestion')}</th>
    </tr></thead>
    <tbody>${list.map(row => {
      const m = app.getMisconception(row.misconceptionId);
      return `<tr style="border-bottom:1px solid var(--space-surface)">
        <td style="padding:12px 8px"><code>${row.misconceptionId}</code></td>
        <td style="padding:12px 8px">${m?.description || '—'}</td>
        <td style="padding:12px 8px">${row.frequency}</td>
        <td style="padding:12px 8px">${row.studentsAffected}</td>
        <td style="padding:12px 8px">${m?.supportStrategy || '—'}</td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`));
}

function renderTrends(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.trendsTitle')}</h1>`));
  const days = analyticsEngine.weeklyTrend();
  const max = Math.max(1, ...days.map(d => d.answers));
  const chart = el(`<div class="card"></div>`);
  days.forEach(d => {
    const height = (d.answers / max) * 100;
    chart.appendChild(el(`<div style="display:flex;align-items:center;gap:12px;margin:8px 0">
      <span style="width:60px;color:var(--muted-star)">${d.label}</span>
      <div style="flex:1;background:var(--space-surface);border-radius:8px;height:20px;overflow:hidden">
        <div style="height:100%;width:${height}%;background:linear-gradient(90deg,var(--cosmic-purple),var(--energy-blue))"></div>
      </div>
      <span style="width:120px;text-align:right;color:var(--muted-star)">${t('teacher.answersCount', { n: d.answers })}</span>
    </div>`));
  });
  host.appendChild(chart);
}

function renderHints(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.hintsTitle')}</h1>`));
  const list = analyticsEngine.hintAnalytics();
  if (!list.length) { host.appendChild(el(`<p style="color:var(--muted-star)">${t('teacher.noHints')}</p>`)); return; }
  host.appendChild(el(`<div class="card"><table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:1px solid var(--space-surface);text-align:left">
      <th style="padding:12px 8px">${t('teacher.colConcept')}</th>
      <th style="padding:12px 8px">${t('teacher.colHintCount')}</th>
    </tr></thead>
    <tbody>${list.map(row => {
      const c = app.getConcepts().find(x => x.id === row.conceptId);
      return `<tr style="border-bottom:1px solid var(--space-surface)">
        <td style="padding:12px 8px">${c?.name || row.conceptId}</td>
        <td style="padding:12px 8px">${row.count}</td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`));
}

function renderQuestions(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.questionsTitle')}</h1>`));
  const rows = analyticsEngine.questionAnalytics();
  if (!rows.length) { host.appendChild(el(`<p style="color:var(--muted-star)">${t('teacher.noQuestions')}</p>`)); return; }
  host.appendChild(el(`<div class="card"><table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:1px solid var(--space-surface);text-align:left">
      <th style="padding:12px 8px">${t('teacher.colQuestion')}</th>
      <th style="padding:12px 8px">${t('teacher.colCorrectCount')}</th>
      <th style="padding:12px 8px">${t('teacher.colIncorrectCount')}</th>
      <th style="padding:12px 8px">${t('teacher.colHintsCount')}</th>
      <th style="padding:12px 8px">${t('teacher.colTotal')}</th>
    </tr></thead>
    <tbody>${rows.map(r => `<tr style="border-bottom:1px solid var(--space-surface)">
      <td style="padding:12px 8px"><code>${r.questionId}</code></td>
      <td style="padding:12px 8px">${r.correct}</td>
      <td style="padding:12px 8px">${r.incorrect}</td>
      <td style="padding:12px 8px">${r.hints}</td>
      <td style="padding:12px 8px">${r.total}</td>
    </tr>`).join('')}</tbody>
  </table></div>`));
}

function renderCards(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.cardsTitle')}</h1>`));
  const cards = app.getCards().map(c => {
    const owned = (state.getPath('inventory.cards', []) || []).includes(c.cardId);
    const views = state.getPath(`inventory.cardViews.${c.cardId}`, 0);
    const mastery = state.getPath(`inventory.cardMastery.${c.cardId}`, 'discovered');
    return { ...c, owned, views, mastery };
  });
  host.appendChild(el(`<div class="card"><table style="width:100%;border-collapse:collapse">
    <thead><tr style="border-bottom:1px solid var(--space-surface);text-align:left">
      <th style="padding:12px 8px">${t('teacher.colCard')}</th>
      <th style="padding:12px 8px">${t('teacher.colOwned')}</th>
      <th style="padding:12px 8px">${t('teacher.colViews')}</th>
      <th style="padding:12px 8px">${t('teacher.colMastery')}</th>
    </tr></thead>
    <tbody>${cards.map(c => `<tr style="border-bottom:1px solid var(--space-surface)">
      <td style="padding:12px 8px">${c.title}</td>
      <td style="padding:12px 8px">${c.owned ? '✓' : '—'}</td>
      <td style="padding:12px 8px">${c.views}</td>
      <td style="padding:12px 8px">${c.mastery}</td>
    </tr>`).join('')}</tbody>
  </table></div>`));
}

function renderReports(host) {
  host.appendChild(el(`<h1 class="mb-6">${t('teacher.reportsTitle')}</h1>`));

  host.appendChild(el(`<div class="grid grid-3 mb-6">
    <div class="card">
      <h3>${t('teacher.reportStudent')}</h3>
      <p class="text-sm mt-2" style="color:var(--muted-star)">${t('teacher.reportStudentDesc')}</p>
      <div class="flex gap-2 mt-4 flex-wrap">
        <button class="btn btn-primary" id="export-student-csv">${t('teacher.exportCSV')}</button>
        <button class="btn btn-secondary" id="export-student-json">${t('teacher.exportJSON')}</button>
      </div>
    </div>
    <div class="card">
      <h3>${t('teacher.reportClass')}</h3>
      <p class="text-sm mt-2" style="color:var(--muted-star)">${t('teacher.reportClassDesc')}</p>
      <div class="flex gap-2 mt-4 flex-wrap">
        <button class="btn btn-primary" id="export-class-csv">${t('teacher.exportCSV')}</button>
      </div>
    </div>
    <div class="card">
      <h3>${t('teacher.reportQuest')}</h3>
      <p class="text-sm mt-2" style="color:var(--muted-star)">${t('teacher.reportQuestDesc')}</p>
      <div class="flex gap-2 mt-4 flex-wrap">
        <button class="btn btn-primary" id="export-quest-csv">${t('teacher.exportCSV')}</button>
      </div>
    </div>
  </div>`));

  host.appendChild(el(`<div class="card mb-6">
    <h3>${t('teacher.exportBackup')}</h3>
    <p class="text-sm mt-2" style="color:var(--muted-star)">${t('teacher.importHint')}</p>
    <div class="flex gap-2 mt-4 flex-wrap">
      <button class="btn btn-secondary" id="export-backup">${t('teacher.exportBackup')}</button>
      <label class="btn btn-secondary" style="cursor:pointer">
        ${t('teacher.importBackup')}
        <input type="file" id="import-backup" accept=".json" multiple style="display:none" />
      </label>
    </div>
    <p id="import-status" class="text-sm mt-3" style="display:none"></p>
  </div>`));

  host.appendChild(el(`<p class="text-sm" style="color:var(--muted-star)">${t('teacher.privacyNote')}</p>`));

  host.querySelector('#export-student-csv').addEventListener('click', () => exportCSV('student'));
  host.querySelector('#export-class-csv').addEventListener('click', () => exportCSV('class'));
  host.querySelector('#export-quest-csv').addEventListener('click', () => exportCSV('quest'));
  host.querySelector('#export-student-json').addEventListener('click', exportStudentJSON);
  host.querySelector('#export-backup').addEventListener('click', exportBackup);
  host.querySelector('#import-backup').addEventListener('change', handleImport);
}

/* ── Helpers ───────────────────────────── */

function statCard(icon, label, value) {
  return `<div class="card" style="background:var(--space-surface)">
    <div style="font-size:1.5rem">${icon}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>`;
}

function lastActivity() {
  const events = state.getPath('analytics.events', []);
  if (!events.length) return '—';
  return new Date(events[events.length - 1].timestamp).toLocaleString('id-ID');
}

/* ── Export / Import ───────────────────── */

function exportCSV(kind) {
  const rows = [];
  const user = state.getPath('user');
  if (kind === 'student' && user) {
    rows.push(['Nama', 'Level', 'XP', 'Koin', 'Lencana', 'Kartu', 'Streak']);
    rows.push([user.name, user.level || 1, user.xp || 0, user.coins || 0, (user.badges || []).length, (user.inventory?.cards || user.cards || []).length, user.streak?.current || 0]);
  } else if (kind === 'class') {
    rows.push(['Konsep', 'Penguasaan %', 'Interaksi', 'Benar', 'Salah']);
    Object.values(state.getPath('mastery', {})).forEach(m => rows.push([m.conceptId, Math.round(m.score || 0), m.interactions || 0, m.correct || 0, m.wrong || 0]));
  } else if (kind === 'quest') {
    rows.push(['Misi', 'Skor %', 'Selesai Pada']);
    Object.entries(state.getPath('progress', {})).forEach(([id, p]) => rows.push([id, p.score || 0, p.completedAt || '—']));
  }
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(csv, `eduverse-${kind}-report.csv`, 'text/csv;charset=utf-8');
}

function exportStudentJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    studentName: state.getPath('user.name'),
    user: state.getPath('user'),
    progress: state.getPath('progress', {}),
    mastery: state.getPath('mastery', {}),
    inventory: state.getPath('inventory', {}),
    analytics: state.getPath('analytics', { events: [] })
  };
  downloadBlob(JSON.stringify(payload, null, 2), `eduverse-student-${state.getPath('user.name') || 'unknown'}.json`, 'application/json');
}

function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    teacher: auth.current(),
    allStudents: [{
      name: state.getPath('user.name'),
      user: state.getPath('user'),
      progress: state.getPath('progress', {}),
      mastery: state.getPath('mastery', {}),
      inventory: state.getPath('inventory', {}),
      analytics: state.getPath('analytics', { events: [] })
    }]
  };
  downloadBlob(JSON.stringify(payload, null, 2), `eduverse-backup-${Date.now()}.json`, 'application/json');
}

async function handleImport(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const status = document.getElementById('import-status');
  status.style.display = 'block';
  status.textContent = 'Memproses…';

  let okCount = 0;
  let lastError = '';

  for (const file of files) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Validasi sederhana
      if (!data.user || !data.user.name) throw new Error('Format tidak dikenali.');
      // Simpan sebagai arsip siswa di localStorage (key unik)
      const key = `studentArchive_${data.user.name}_${Date.now()}`;
      const { storage } = await import('../core/storage.js');
      storage.save(key, data);
      okCount++;
    } catch (e) {
      lastError = e.message;
    }
  }

  if (okCount > 0) {
    status.textContent = t('teacher.importSuccess', { n: okCount });
    status.style.color = 'var(--success)';
  } else {
    status.textContent = t('teacher.importFailed', { reason: lastError });
    status.style.color = 'var(--error)';
  }
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default { render };