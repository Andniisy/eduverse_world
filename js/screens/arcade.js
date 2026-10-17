import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';

const GAMES = [
  { id: 'science', name: 'Penyelamat Organ', icon: '🫀', color: 'coral', style: 'TEKA-TEKI • SIMULASI', desc: 'Susun 5 organ tubuh sesuai urutan alur pencernaan makanan manusia.', skill: 'Sistem pencernaan manusia' },
  { id: 'math', name: 'Brankas Matematika', icon: '🔐', color: 'gold', style: 'TEKA-TEKI • AKSI', desc: 'Buka brankas rahasia dengan memecahkan pola deret bilangan pada keypad.', skill: 'Pola dan penalaran matematika' },
  { id: 'literacy', name: 'Detektif Kata', icon: '🔍', color: 'mint', style: 'INVESTIGASI • LITERASI', desc: 'Periksa bukti teks di tempat kejadian dan susun kesimpulan inferensi.', skill: 'Menganalisis & menyimpulkan teks' },
  { id: 'culture', name: 'Misi Festival Budaya', icon: '🎪', color: 'violet', style: 'SIMULASI • KEBUDAYAAN', desc: 'Kelola festival budaya inklusif yang ramah semua orang dengan anggaran terbatas.', skill: 'Keberagaman, inklusivitas & anggaran' },
  { id: 'digital', name: 'Robot Penjelajah Kode', icon: '🤖', color: 'blue', style: 'ALGORITMA • LOGIKA', desc: 'Program jalur robot di labirin grid 4x4 untuk mengumpulkan kristal.', skill: 'Algoritma, urutan & debugging' }
];

let activeCleanup = null;
let currentTimer = null;

function render(container) {
  container.innerHTML = '';
  teardown();

  const user = state.getPath('user') || {};
  const root = el(`
    <section class="screen active ev-arcade-screen">
      <!-- High-Contrast Light Card Styling with Crisp Dark Typography -->
      <style>
        .ev-arcade-container { 
          max-width: 1120px; 
          margin: 0 auto; 
          padding: 24px 20px; 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          color: #0f172a; 
          min-height: 100vh;
        }
        .ev-arcade-header { 
          display: flex; 
          flex-wrap: wrap; 
          justify-content: space-between; 
          align-items: center; 
          gap: 16px; 
          margin-bottom: 28px; 
          background: #ffffff; 
          padding: 18px 24px; 
          border-radius: 20px; 
          border: 2px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
        }
        .ev-arcade-wallet { 
          display: flex; 
          gap: 16px; 
          background: #0f172a; 
          padding: 10px 20px; 
          border-radius: 30px; 
          font-weight: 700; 
          border: 1px solid #334155; 
          color: #fbbf24;
          font-size: 1.05rem;
        }
        
        /* Balanced Symmetrical Grid Layout */
        .ev-arcade-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); 
          gap: 22px; 
          margin: 24px 0 36px; 
        }
        .ev-game-card { 
          background: #ffffff !important; 
          border: 2px solid #cbd5e1 !important; 
          border-radius: 20px; 
          padding: 22px; 
          text-align: left; 
          cursor: pointer; 
          transition: all 0.25s ease-in-out; 
          color: #0f172a !important; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .ev-game-card:hover { 
          transform: translateY(-5px); 
          border-color: #4338ca !important; 
          box-shadow: 0 12px 28px rgba(67, 56, 202, 0.18); 
          background: #f8fafc !important;
        }
        .ev-game-style { 
          font-size: 0.78rem; 
          letter-spacing: 1.2px; 
          color: #4338ca !important; 
          text-transform: uppercase; 
          margin-bottom: 10px; 
          font-weight: 800; 
          display: block;
        }
        .ev-game-art { font-size: 3rem; margin: 8px 0; }
        .ev-game-title { 
          font-size: 1.3rem; 
          font-weight: 800; 
          color: #0f172a !important; 
          margin-bottom: 8px; 
          line-height: 1.3;
        }
        .ev-game-desc { 
          font-size: 0.92rem; 
          color: #334155 !important; 
          line-height: 1.5; 
          margin: 0; 
          font-weight: 500;
        }
        .ev-game-skill { 
          font-size: 0.82rem; 
          color: #1e40af !important; 
          margin-top: 14px; 
          background: #eff6ff !important; 
          padding: 6px 12px; 
          border-radius: 8px; 
          display: inline-block; 
          font-weight: 700;
          border: 1px solid #bfdbfe !important;
        }
        .ev-game-cta {
          margin-top: 16px; 
          text-align: right; 
          font-weight: 800; 
          color: #2563eb !important; 
          font-size: 0.95rem;
        }
        
        /* Interactive Panel Frame */
        .ev-game-panel { 
          background: #ffffff !important; 
          border: 2px solid #4338ca !important; 
          border-radius: 24px; 
          padding: 28px; 
          margin-top: 24px; 
          color: #0f172a !important;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12); 
        }
        .ev-game-panel-top { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 20px; 
          border-bottom: 2px solid #e2e8f0; 
          padding-bottom: 16px; 
        }
        .ev-game-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 24px; }
        .ev-game-feedback { 
          padding: 14px 18px; 
          border-radius: 12px; 
          margin-top: 20px; 
          font-weight: 700; 
          line-height: 1.5; 
          font-size: 1rem;
        }
        .ev-game-feedback.hint { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; }
        .ev-game-feedback.correct { background: #dcfce7; border: 1px solid #22c55e; color: #14532d; }
        .ev-game-feedback.retry { background: #fee2e2; border: 1px solid #ef4444; color: #7f1d1d; }

        /* ORGAN SAVER UI STYLING */
        .organ-slots-container { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
        .organ-slot { 
          background: #f8fafc; 
          border: 2px dashed #94a3b8; 
          border-radius: 14px; 
          padding: 12px 18px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          min-height: 56px;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .organ-slot.filled { border-style: solid; border-color: #4338ca; background: #e0e7ff; }
        .organ-pool { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .organ-btn { 
          background: #f1f5f9; 
          border: 2px solid #cbd5e1; 
          color: #0f172a; 
          padding: 10px 16px; 
          border-radius: 12px; 
          font-weight: bold; 
          cursor: pointer; 
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .organ-btn:hover { background: #e2e8f0; border-color: #4338ca; transform: scale(1.03); }

        /* BRANKAS MATEMATIKA NUMPAD UI */
        .vault-display { 
          background: #0f172a; 
          border: 3px solid #4338ca; 
          border-radius: 16px; 
          padding: 20px; 
          text-align: center; 
          margin-bottom: 20px; 
          box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
        }
        .vault-screen { font-family: monospace; font-size: 2.2rem; color: #38bdf8; letter-spacing: 6px; font-weight: bold; }
        .vault-numpad { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 12px; 
          max-width: 290px; 
          margin: 0 auto; 
        }
        .num-btn { 
          background: #f1f5f9; 
          border: 2px solid #cbd5e1; 
          color: #0f172a; 
          font-size: 1.4rem; 
          font-weight: 800; 
          padding: 14px; 
          border-radius: 14px; 
          cursor: pointer; 
          transition: 0.15s; 
        }
        .num-btn:active { transform: scale(0.92); background: #4338ca; color: #fff; }

        /* DETEKTIF KATA UI */
        .ev-detective-board { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin: 18px 0; }
        .ev-clue-card { background: #f8fafc; border: 2px dashed #94a3b8; border-radius: 14px; padding: 16px; cursor: pointer; transition: 0.2s; text-align: left; color: #0f172a; }
        .ev-clue-card:hover { border-color: #2563eb; background: #eff6ff; }
        .ev-clue-card.inspected { border-style: solid; border-color: #16a34a; background: #f0fdf4; }
        .ev-notebook { background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 14px; padding: 18px; margin-top: 16px; color: #0f172a; }
        .ev-inference-options { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
        .ev-inf-opt { background: #ffffff; border: 2px solid #cbd5e1; border-radius: 12px; padding: 14px 18px; color: #0f172a; text-align: left; cursor: pointer; transition: 0.2s; font-size: 0.95rem; font-weight: 600; }
        .ev-inf-opt:hover { background: #f8fafc; border-color: #64748b; }
        .ev-inf-opt.selected { border-color: #4338ca; background: #e0e7ff; color: #1e1b4b; font-weight: 800; }

        /* FESTIVAL BUDAYA UI */
        .ev-fest-stats { display: flex; gap: 16px; flex-wrap: wrap; background: #f8fafc; padding: 18px; border-radius: 16px; margin-bottom: 20px; border: 2px solid #e2e8f0; color: #0f172a; }
        .ev-fest-meter { flex: 1; min-width: 140px; }
        .ev-fest-progress { height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-top: 8px; }
        .ev-fest-bar { height: 100%; transition: width 0.3s ease; }
        .ev-fest-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
        .ev-fest-item { background: #ffffff; border: 2px solid #cbd5e1; border-radius: 14px; padding: 16px; text-align: left; cursor: pointer; transition: 0.2s; color: #0f172a; }
        .ev-fest-item.active { border-color: #16a34a; background: #f0fdf4; }

        /* ROBOT PENJELAJAH KODE UI */
        .ev-bot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 340px; margin: 20px auto; background: #f8fafc; padding: 14px; border-radius: 18px; border: 3px solid #4338ca; }
        .ev-bot-cell { aspect-ratio: 1; background: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 2rem; position: relative; border: 1px solid #cbd5e1; }
        .ev-bot-cell.robot { background: #e0e7ff; border-color: #4338ca; box-shadow: 0 0 12px rgba(67, 56, 202, 0.4); }
        .ev-bot-controls { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
        .ev-bot-cmd-list { background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 12px; padding: 14px; min-height: 52px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 14px; color: #0f172a; }
        .ev-cmd-badge { background: #4338ca; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; }
      </style>

      <div class="ev-arcade-container">
        <header class="ev-arcade-header">
          <button class="btn" id="arcade-back" type="button" style="padding: 10px 20px; border-radius: 12px; cursor: pointer; border: none; background: #0f172a; color: #fff; font-weight: 700;">⬅️ Kembali ke Kota</button>
          <div style="text-align:center;">
            <span style="font-size:0.8rem; color:#4338ca; font-weight:800; letter-spacing:1.5px;">ARENA PERMAINAN EDUKASI</span>
            <h1 style="margin: 4px 0 0; font-size: 1.8rem; color:#0f172a; font-weight:900;">Arcade <span style="color:#4338ca">Edu</span></h1>
          </div>
          <div class="ev-arcade-wallet">
            <span>⭐ <b id="arcade-xp">${Number(user.xp) || 0}</b> XP</span>
            <span>🪙 <b id="arcade-coins">${Number(user.coins) || 0}</b> Koin</span>
          </div>
        </header>

        <section class="ev-arcade-intro" style="margin-bottom: 20px;">
          <h2 style="font-size:1.5rem; margin:0 0 6px 0; color:#0f172a; font-weight:800;">Pilih Arena Tantangan</h2>
          <p style="color: #334155; margin:0; font-size:1rem; font-weight:500;">Uji penalaran, strategi, dan eksplorasi melalui tantangan mini-game interaktif.</p>
        </section>

        <!-- Symmetrical Grid -->
        <div class="ev-arcade-grid" id="arcade-grid"></div>
        <div id="arcade-play-area"></div>
      </div>
    </section>
  `);
  container.appendChild(root);

  const backBtn = root.querySelector('#arcade-back');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('city');
    });
  }

  const grid = root.querySelector('#arcade-grid');
  GAMES.forEach((g) => {
    const card = el(`
      <button type="button" class="ev-game-card" data-game-id="${g.id}">
        <div>
          <span class="ev-game-style">${g.style}</span>
          <div class="ev-game-art">${g.icon}</div>
          <div class="ev-game-title">${g.name}</div>
          <p class="ev-game-desc">${g.desc}</p>
        </div>
        <div>
          <span class="ev-game-skill">🎯 ${g.skill}</span>
          <div class="ev-game-cta">Masuk Arena ➔</div>
        </div>
      </button>
    `);
    card.addEventListener('click', (e) => {
      e.preventDefault();
      startGame(g.id, root);
    });
    grid.appendChild(card);
  });

  activeCleanup = () => {
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }
    const playArea = root.querySelector('#arcade-play-area');
    if (playArea) playArea.innerHTML = '';
  };
}

function teardown() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

function startGame(id, root) {
  if (currentTimer) {
    clearInterval(currentTimer);
    currentTimer = null;
  }

  const g = GAMES.find(x => x.id === id);
  if (!g) return;
  const host = root.querySelector('#arcade-play-area');
  host.innerHTML = '';

  const panel = el(`
    <section class="ev-game-panel" aria-live="polite">
      <div class="ev-game-panel-top">
        <div>
          <span class="ev-game-style">${g.style}</span>
          <h2 style="margin:4px 0 0; font-size: 1.6rem; color:#0f172a; font-weight:900;">${g.icon} ${g.name}</h2>
        </div>
        <button class="btn btn-secondary" id="game-close" type="button" style="padding: 8px 16px; background: #0f172a; border: none; color: #fff; border-radius: 10px; cursor: pointer; font-weight:bold;">Tutup ✖</button>
      </div>
      <p style="color: #334155; font-size: 1rem; margin-bottom: 20px; font-weight:500;">${g.desc}</p>
      
      <div id="game-stage"></div>
      <div class="ev-game-feedback" id="game-feedback" hidden></div>
      
      <div class="ev-game-actions">
        <button class="btn" id="game-hint" type="button" style="background:#f59e0b; color:#fff; padding:12px 20px; border:none; border-radius:12px; cursor:pointer; font-weight:700;">💡 Petunjuk</button>
        <button class="btn" id="game-reset" type="button" style="background:#64748b; color:#fff; padding:12px 20px; border:none; border-radius:12px; cursor:pointer; font-weight:700;">🔄 Reset</button>
        <button class="btn" id="game-check" type="button" style="background:#4338ca; color:#fff; padding:12px 26px; border:none; border-radius:12px; cursor:pointer; font-weight:800; font-size:1.05rem;">⚡ Uji Strategi</button>
      </div>
    </section>
  `);
  host.appendChild(panel);
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  panel.querySelector('#game-close').addEventListener('click', () => host.innerHTML = '');
  panel.querySelector('#game-reset').addEventListener('click', () => startGame(id, root));

  const stage = panel.querySelector('#game-stage');
  const feedback = panel.querySelector('#game-feedback');
  const check = panel.querySelector('#game-check');

  let validate = () => ({ ok: false, message: 'Selesaikan misi terlebih dahulu.' });
  let hint = 'Perhatikan instruksi misi dengan teliti.';
  let won = false;

  panel.querySelector('#game-hint').addEventListener('click', () => {
    feedback.hidden = false;
    feedback.className = 'ev-game-feedback hint';
    feedback.textContent = '💡 ' + hint;
  });

  if (id === 'science') {
    hint = 'Urutan sistem pencernaan makanan manusia: Mulut 👄 ➔ Kerongkongan 🫁 ➔ Lambung 🥣 ➔ Usus Halus 🌀 ➔ Usus Besar 🪱.';
    
    const allOrgans = [
      { id: 'mulut', name: 'Mulut', icon: '👄' },
      { id: 'kerongkongan', name: 'Kerongkongan', icon: '🫁' },
      { id: 'lambung', name: 'Lambung', icon: '🥣' },
      { id: 'usus_halus', name: 'Usus Halus', icon: '🌀' },
      { id: 'usus_besar', name: 'Usus Besar', icon: '🪱' }
    ];

    let poolOrgans = [...allOrgans].sort(() => Math.random() - 0.5);
    let slottedOrgans = [];

    const renderOrganUI = () => {
      stage.innerHTML = `
        <div>
          <h3 style="color:#0f172a; margin-bottom:8px; font-weight:800;">Susun Urutan Jalur Pencernaan Makanan:</h3>
          <p style="color:#334155; font-size:0.92rem; font-weight:500;">Ketuk organ di bawah untuk memasukkannya ke dalam slot urutan dari atas ke bawah.</p>

          <div class="organ-slots-container">
            ${[1,2,3,4,5].map((num, i) => {
              const organ = slottedOrgans[i];
              return `
                <div class="organ-slot ${organ ? 'filled' : ''}">
                  <span style="color:#4338ca; font-weight:800;">Slot ${num}:</span>
                  <span style="font-size:1.05rem; font-weight:bold; color:#0f172a;">${organ ? `${organ.icon} ${organ.name}` : '<i style="color:#94a3b8; font-weight:normal;">[ Kosong ]</i>'}</span>
                  ${organ ? `<button type="button" class="btn-remove-organ" data-idx="${i}" style="background:#ef4444; color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:bold;">❌ Batal</button>` : '<span></span>'}
                </div>
              `;
            }).join('')}
          </div>

          <h4 style="color:#0f172a; margin-top:16px; font-weight:800;">Storage Organ Tersedia:</h4>
          <div class="organ-pool">
            ${poolOrgans.map(o => `
              <button type="button" class="organ-btn" data-id="${o.id}">
                <span>${o.icon}</span> <span>${o.name}</span>
              </button>
            `).join('')}
            ${poolOrgans.length === 0 ? '<p style="color:#16a34a; font-weight:bold;">Semua organ telah terpasang di slot!</p>' : ''}
          </div>
        </div>
      `;

      stage.querySelectorAll('.organ-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (slottedOrgans.length < 5) {
            const organId = btn.dataset.id;
            const organObj = poolOrgans.find(x => x.id === organId);
            slottedOrgans.push(organObj);
            poolOrgans = poolOrgans.filter(x => x.id !== organId);
            renderOrganUI();
          }
        });
      });

      stage.querySelectorAll('.btn-remove-organ').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          const removed = slottedOrgans.splice(idx, 1)[0];
          poolOrgans.push(removed);
          renderOrganUI();
        });
      });
    };

    renderOrganUI();

    validate = () => {
      if (slottedOrgans.length < 5) {
        return { ok: false, retryMessage: 'Lengkapi kelima slot organ pencernaan terlebih dahulu.' };
      }
      const correctOrder = ['mulut', 'kerongkongan', 'lambung', 'usus_halus', 'usus_besar'];
      const userOrder = slottedOrgans.map(x => x.id);
      const isCorrect = userOrder.every((val, index) => val === correctOrder[index]);

      if (isCorrect) {
        return { ok: true, message: 'Sempurna! Kamu berhasil menyusun urutan sistem pencernaan manusia secara akurat.' };
      }
      return { ok: false, retryMessage: 'Urutan organ masih keliru. Ingat: Mulut ➔ Kerongkongan ➔ Lambung ➔ Usus Halus ➔ Usus Besar.' };
    };

  } else if (id === 'math') {
    hint = 'Perhatikan deret bilangan: 5, 15, 45, 135, ... Setiap pola dikali 3! Berapakah hasil dari 135 x 3?';

    let typedPIN = '';

    const renderVaultUI = () => {
      stage.innerHTML = `
        <div>
          <div class="vault-display">
            <div style="color:#94a3b8; font-size:0.85rem; margin-bottom:6px; font-weight:800; letter-spacing:1px;">POLA KODE RAHASIA BRANKAS</div>
            <div style="color:#fbbf24; font-size:1.4rem; font-weight:900; margin-bottom:12px;">5 ➔ 15 ➔ 45 ➔ 135 ➔ [ ? ]</div>
            <div class="vault-screen">${typedPIN.padEnd(3, '_')}</div>
          </div>

          <div class="vault-numpad">
            ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" class="num-btn" data-num="${n}">${n}</button>`).join('')}
            <button type="button" class="num-btn" id="btn-num-clear" style="background:#ef4444; color:#fff;">⌫</button>
            <button type="button" class="num-btn" data-num="0">0</button>
            <button type="button" class="num-btn" id="btn-num-enter" style="background:#22c55e; color:#fff;">🔓</button>
          </div>
        </div>
      `;

      stage.querySelectorAll('.num-btn[data-num]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (typedPIN.length < 3) {
            typedPIN += btn.dataset.num;
            renderVaultUI();
          }
        });
      });

      stage.querySelector('#btn-num-clear').addEventListener('click', () => {
        typedPIN = typedPIN.slice(0, -1);
        renderVaultUI();
      });

      stage.querySelector('#btn-num-enter').addEventListener('click', () => {
        check.click();
      });
    };

    renderVaultUI();

    validate = () => {
      if (typedPIN === '405') {
        return { ok: true, message: 'Brankas Terbuka! Kode rahasia tepat: 135 x 3 = 405.' };
      }
      return { ok: false, retryMessage: 'Kode salah! Hitung perkalian 135 x 3 dengan teliti.' };
    };

  } else if (id === 'literacy') {
    hint = 'Periksa ketiga kartu bukti terlebih dahulu. Gabungkan catatan tentang angin, bendera, dan topi untuk memilih kesimpulan terbaik.';
    
    const clues = [
      { id: 'c1', title: '🔍 Bukti 1: Catatan Saksi', text: '“Dedaunan di pohon depan kelas bergerak sangat kencang dan terdengar suara gemuruh angin dari arah timur.”' },
      { id: 'c2', title: '🚩 Bukti 2: Posisi Bendera', text: '“Kain bendera di lapangan terbentang lurus ke samping dan berkibar sangat keras.”' },
      { id: 'c3', title: '🧢 Bukti 3: Pengamatan Murid', text: '“Beberapa murid yang berjalan di lapangan harus memegangi topi mereka agar tidak terbawa terbang.”' }
    ];

    const inspected = new Set();
    let selectedInference = null;

    stage.innerHTML = `
      <div>
        <h3 style="margin-bottom:8px; color:#0f172a; font-weight:800;">1. Periksa Bukti di Lapangan</h3>
        <p style="font-size:0.92rem; color:#334155;">Ketuk setiap kartu bukti di bawah ini untuk mencatat temuan detektif:</p>
        
        <div class="ev-detective-board">
          ${clues.map(c => `
            <div class="ev-clue-card" id="clue-${c.id}" data-id="${c.id}">
              <strong style="display:block; margin-bottom:6px; color:#1e1b4b; font-size:1.05rem;">${c.title}</strong>
              <p style="font-size:0.9rem; color:#334155; margin:0; line-height:1.4;">${c.text}</p>
              <span class="status-tag" style="display:inline-block; margin-top:8px; font-size:0.8rem; color:#2563eb; font-weight:700;">[ Ketuk untuk meneliti ]</span>
            </div>
          `).join('')}
        </div>

        <div class="ev-notebook">
          <h4 style="margin:0 0 8px 0; color:#4338ca; font-weight:800;">📓 Buku Catatan Detektif (<span id="clue-count">0</span>/3 Bukti Terkumpul)</h4>
          <div id="notebook-list" style="font-size:0.9rem; color:#334155;">Belum ada bukti yang diteliti...</div>
        </div>

        <div style="margin-top:20px;">
          <h3 style="margin-bottom:8px; color:#0f172a; font-weight:800;">2. Formulasi Inferensi</h3>
          <p style="font-size:0.92rem; color:#334155;">Berdasarkan kombinasi bukti di atas, kesimpulan apa yang paling akurat?</p>
          
          <div class="ev-inference-options">
            <button type="button" class="ev-inf-opt" data-idx="0">A. Hujan es melanda area sekolah dengan lebat.</button>
            <button type="button" class="ev-inf-opt" data-idx="1">B. Angin kencang sedang berembus kuat di lapangan sekolah.</button>
            <button type="button" class="ev-inf-opt" data-idx="2">C. Udara di luar kelas dalam keadaan sangat tenang tanpa embusan.</button>
          </div>
        </div>
      </div>
    `;

    const clueCount = stage.querySelector('#clue-count');
    const notebookList = stage.querySelector('#notebook-list');

    stage.querySelectorAll('.ev-clue-card').forEach(card => {
      card.addEventListener('click', () => {
        const cid = card.dataset.id;
        inspected.add(cid);
        card.classList.add('inspected');
        card.querySelector('.status-tag').textContent = '✓ Bukti Diteliti';
        card.querySelector('.status-tag').style.color = '#16a34a';

        clueCount.textContent = inspected.size;
        notebookList.innerHTML = Array.from(inspected).map(id => {
          const item = clues.find(x => x.id === id);
          return `<div style="margin-bottom:4px;">• <b>${item.title}:</b> Terdapat petunjuk pergerakan udara kuat.</div>`;
        }).join('');
      });
    });

    stage.querySelectorAll('.ev-inf-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        stage.querySelectorAll('.ev-inf-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedInference = parseInt(opt.dataset.idx, 10);
      });
    });

    validate = () => {
      if (inspected.size < 3) {
        return { ok: false, retryMessage: 'Teliti ketiga kartu bukti terlebih dahulu sebelum mengambil kesimpulan.' };
      }
      if (selectedInference === null) {
        return { ok: false, retryMessage: 'Pilih salah satu Opsi Inferensi (A, B, atau C).' };
      }
      if (selectedInference === 1) {
        return { ok: true, message: 'Hebat! Analisis inferensimu sangat akurat berdasarkan 3 bukti yang ada.' };
      }
      return { ok: false, retryMessage: 'Kesimpulan belum tepat. Perhatikan petunjuk gerakan bendera dan topi.' };
    };

  } else if (id === 'culture') {
    hint = 'Pilihlah kombinasi program yang menghemat anggaran (maks 100 Koin) serta menyeimbangkan Aksesibilitas dan Keberagaman.';

    const options = [
      { id: 'ram', name: '♿ Ram Kursi Roda & Jalur Inklusif', cost: 25, access: 40, div: 10, desc: 'Memudahkan pengunjung disabilitas dan lansia.' },
      { id: 'tari', name: '🎭 Pentas Tari Lintas Nusantara', cost: 35, access: 10, div: 45, desc: 'Menampilkan pertunjukan seni dari 4 pulau.' },
      { id: 'bazar', name: '🍲 Bazar Kuliner Tradisional', cost: 30, access: 10, div: 35, desc: 'Mengenalkan makanan daerah yang ramah lingkungan.' },
      { id: 'panggung_loud', name: '📢 Sound System Konser Raksasa', cost: 40, access: -20, div: 10, desc: 'Suara sangat bising, mengganggu pengunjung dengan sensitivitas pendengaran.' }
    ];

    const selected = new Set(['ram', 'tari']);

    const updateFestivalUI = () => {
      let totalCost = 0;
      let totalAccess = 0;
      let totalDiv = 0;

      selected.forEach(optId => {
        const item = options.find(o => o.id === optId);
        if (item) {
          totalCost += item.cost;
          totalAccess += item.access;
          totalDiv += item.div;
        }
      });

      stage.querySelector('#fest-cost').textContent = `${totalCost} / 100 Koin`;
      stage.querySelector('#fest-cost').style.color = totalCost > 100 ? '#ef4444' : '#16a34a';
      
      stage.querySelector('#bar-access').style.width = `${Math.max(0, Math.min(100, totalAccess))}%`;
      stage.querySelector('#bar-div').style.width = `${Math.max(0, Math.min(100, totalDiv))}%`;

      stage.querySelectorAll('.ev-fest-item').forEach(item => {
        const isSel = selected.has(item.dataset.id);
        item.classList.toggle('active', isSel);
      });
    };

    stage.innerHTML = `
      <div>
        <div class="ev-fest-stats">
          <div class="ev-fest-meter">
            <strong>🪙 Total Anggaran:</strong>
            <div id="fest-cost" style="font-size:1.2rem; font-weight:800;">0 / 100 Koin</div>
          </div>
          <div class="ev-fest-meter">
            <strong>♿ Aksesibilitas & Inklusivitas:</strong>
            <div class="ev-fest-progress"><div class="ev-fest-bar" id="bar-access" style="background:#0284c7;"></div></div>
          </div>
          <div class="ev-fest-meter">
            <strong>🌍 Keberagaman Budaya:</strong>
            <div class="ev-fest-progress"><div class="ev-fest-bar" id="bar-div" style="background:#7c3aed;"></div></div>
          </div>
        </div>

        <h3 style="margin-bottom:8px; color:#0f172a; font-weight:800;">Pilih Fasilitas & Acara Festival:</h3>
        <div class="ev-fest-grid">
          ${options.map(o => `
            <div class="ev-fest-item" data-id="${o.id}">
              <strong style="display:block; font-size:1rem; margin-bottom:4px; color:#0f172a;">${o.name}</strong>
              <small style="color:#334155; display:block; margin-bottom:8px; font-size:0.88rem;">${o.desc}</small>
              <div style="font-weight:800; color:#b45309; font-size:0.9rem;">Biaya: ${o.cost} Koin</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    stage.querySelectorAll('.ev-fest-item').forEach(elItem => {
      elItem.addEventListener('click', () => {
        const id = elItem.dataset.id;
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        updateFestivalUI();
      });
    });

    updateFestivalUI();

    validate = () => {
      let cost = 0, access = 0, div = 0;
      selected.forEach(id => {
        const item = options.find(o => o.id === id);
        if (item) { cost += item.cost; access += item.access; div += item.div; }
      });

      if (cost > 100) return { ok: false, retryMessage: 'Anggaran melebihi batas 100 Koin! Kurangi beberapa program.' };
      if (access < 40) return { ok: false, retryMessage: 'Tingkat Aksesibilitas masih rendah. Pastikan festival ramah untuk lansia dan disabilitas.' };
      if (div < 40) return { ok: false, retryMessage: 'Tingkat Keberagaman Budaya masih kurang. Tambahkan acara seni/kuliner daerah.' };

      return { ok: true, message: 'Luar biasa! Perencanaan festivalmu sangat inklusif, kaya budaya, dan hemat anggaran.' };
    };

  } else if (id === 'digital') {
    hint = 'Susun perintah gerak agar robot mencapai kristal 💎 tanpa menabrak tembok 🧱. Contoh: Kanan ➡️ Kanan ➡️ Bawah ➡️ Bawah.';

    const board = [
      [0, 0, 0, 0],
      [1, 1, 0, 1],
      [0, 0, 0, 0],
      [0, 1, 1, 2]
    ];

    let robotPos = { r: 0, c: 0 };
    let commands = [];
    let isRunning = false;

    const renderGrid = () => {
      let gridHTML = '';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const isBot = robotPos.r === r && robotPos.c === c;
          const val = board[r][c];
          let icon = '';
          if (isBot) icon = '🤖';
          else if (val === 1) icon = '🧱';
          else if (val === 2) icon = '💎';

          gridHTML += `<div class="ev-bot-cell ${isBot ? 'robot' : ''}">${icon}</div>`;
        }
      }
      return gridHTML;
    };

    const updateBotUI = () => {
      stage.querySelector('#bot-grid-board').innerHTML = renderGrid();
      const list = stage.querySelector('#bot-cmd-queue');
      if (commands.length === 0) {
        list.innerHTML = '<span style="color:#64748b; font-size:0.875rem; font-weight:500;">Belum ada instruksi...</span>';
      } else {
        list.innerHTML = commands.map(c => `<span class="ev-cmd-badge">${c}</span>`).join('');
      }
    };

    stage.innerHTML = `
      <div>
        <h3 style="margin-bottom:6px; color:#0f172a; text-align:center; font-weight:800;">Program Robot ROBO-1</h3>
        <p style="font-size:0.92rem; color:#334155; text-align:center; margin-top:0; font-weight:500;">Arahkan Robot 🤖 mencapai Kristal Energi 💎 tanpa menabrak Tembok 🧱.</p>

        <div class="ev-bot-grid" id="bot-grid-board"></div>

        <div style="max-width:400px; margin:0 auto;">
          <div class="ev-bot-controls">
            <button type="button" class="btn-cmd" data-cmd="⬆️ Atas" style="padding:8px 14px; background:#0f172a; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">⬆️ Atas</button>
            <button type="button" class="btn-cmd" data-cmd="⬇️ Bawah" style="padding:8px 14px; background:#0f172a; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">⬇️ Bawah</button>
            <button type="button" class="btn-cmd" data-cmd="⬅️ Kiri" style="padding:8px 14px; background:#0f172a; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">⬅️ Kiri</button>
            <button type="button" class="btn-cmd" data-cmd="➡️ Kanan" style="padding:8px 14px; background:#0f172a; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">➡️ Kanan</button>
            <button type="button" id="btn-clear-cmd" style="padding:8px 14px; background:#ef4444; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">🗑️ Hapus</button>
          </div>

          <div class="ev-bot-cmd-list" id="bot-cmd-queue"></div>
        </div>
      </div>
    `;

    stage.querySelectorAll('.btn-cmd').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isRunning) return;
        if (commands.length < 8) {
          commands.push(btn.dataset.cmd);
          updateBotUI();
        }
      });
    });

    stage.querySelector('#btn-clear-cmd').addEventListener('click', () => {
      if (isRunning) return;
      commands = [];
      robotPos = { r: 0, c: 0 };
      updateBotUI();
    });

    updateBotUI();

    validate = () => {
      if (commands.length === 0) {
        return { ok: false, retryMessage: 'Tambahkan setidaknya satu instruksi pergerakan.' };
      }

      if (isRunning) return { ok: false, retryMessage: 'Simulasi robot sedang berjalan...' };

      isRunning = true;
      robotPos = { r: 0, c: 0 };
      updateBotUI();

      let stepIndex = 0;
      let crashed = false;

      return new Promise((resolve) => {
        currentTimer = setInterval(() => {
          if (stepIndex >= commands.length || crashed) {
            clearInterval(currentTimer);
            currentTimer = null;
            isRunning = false;

            if (crashed) {
              resolve({ ok: false, retryMessage: 'Robot menabrak tembok/keluar arena! Perbaiki urutan kode (Debugging).' });
            } else if (board[robotPos.r][robotPos.c] === 2) {
              resolve({ ok: true, message: 'Sempurna! Algoritma programmu berhasil membawa robot mengumpulkan kristal.' });
            } else {
              resolve({ ok: false, retryMessage: 'Robot berhenti sebelum mencapai kristal. Tambahkan perintah pergerakan.' });
            }
            return;
          }

          const cmd = commands[stepIndex];
          if (cmd === '⬆️ Atas') robotPos.r--;
          if (cmd === '⬇️ Bawah') robotPos.r++;
          if (cmd === '⬅️ Kiri') robotPos.c--;
          if (cmd === '➡️ Kanan') robotPos.c++;

          if (robotPos.r < 0 || robotPos.r > 3 || robotPos.c < 0 || robotPos.c > 3 || board[robotPos.r][robotPos.c] === 1) {
            crashed = true;
          }

          updateBotUI();
          stepIndex++;
        }, 500);
      });
    };
  }

  check.addEventListener('click', async () => {
    if (won) return;

    check.disabled = true;
    feedback.hidden = false;
    feedback.className = 'ev-game-feedback hint';
    feedback.textContent = '⏳ Memeriksa strategi...';

    const result = await Promise.resolve(validate());

    check.disabled = false;
    feedback.className = 'ev-game-feedback ' + (result.ok ? 'correct' : 'retry');
    feedback.textContent = (result.ok ? '🎉 ' : '❌ ') + (result.ok ? result.message : result.retryMessage);

    if (result.ok) {
      won = true;
      check.disabled = true;
      const user = state.getPath('user') || {};
      const newXp = (Number(user.xp) || 0) + 25;
      const newCoins = (Number(user.coins) || 0) + 10;
      
      state.setPath('user.xp', newXp);
      state.setPath('user.coins', newCoins);
      
      const xpEl = root.querySelector('#arcade-xp');
      const coinsEl = root.querySelector('#arcade-coins');
      if (xpEl) xpEl.textContent = newXp;
      if (coinsEl) coinsEl.textContent = newCoins;
    }
  });
}

export default { render, teardown };