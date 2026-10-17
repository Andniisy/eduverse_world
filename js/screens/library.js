import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events } from '../core/events.js';
import { app } from '../core/app.js';
import knowledgeCard from '../components/knowledgeCard.js';
import modal from '../components/modal.js';
import navbar from '../components/navbar.js';
import { cardEngine } from '../engines/cardEngine.js';
import { t } from '../core/i18n.js';

function render(container) {
  container.innerHTML = '';

  const user = state.getPath('user');
  if (!user) { router.navigate('login'); return; }

  const filters = { world: '', owned: 'all', rarity: '' };

  const root = el(`<div class="screen active">
    <div id="navbar-host"></div>
    <div class="container mt-8">
      <div class="page-header">
        <h1>${t('library.title')}</h1>
        <p>${t('library.subtitle')}</p>
      </div>
      <div id="summary"></div>
      <div id="filter-bar" class="card mt-4 mb-6" style="background:var(--space-surface)"></div>
      <div class="grid grid-3" id="cards"></div>
    </div>
  </div>`);
  container.appendChild(root);

  // ← Navbar dengan tombol Kembali
  navbar.render(root.querySelector('#navbar-host'), {
    backLabel: 'Kembali ke Kota',
    onBack: () => router.navigate('city')
  });

  renderSummary();
  renderFilters();
  renderCards();

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

  function renderSummary() {
    const sum = cardEngine.summary();
    root.querySelector('#summary').innerHTML = `<div class="grid grid-4">
      ${stat('🃏', t('library.collected'), `${sum.owned}/${sum.total}`)}
      ${stat('🔵', t('library.rare'), sum.byRarity.rare || 0)}
      ${stat('🟣', t('library.epic'), sum.byRarity.epic || 0)}
      ${stat('🟡', t('library.legendary'), sum.byRarity.legendary || 0)}
    </div>`;
  }

  function renderFilters() {
    const bar = root.querySelector('#filter-bar');
    bar.innerHTML = `<div class="flex flex-wrap gap-3 items-center">
      <label class="text-sm">${t('library.world')}
        <select id="f-world" class="question-option" style="margin-left:6px">
          <option value="">${t('library.all')}</option>
          ${app.getWorlds().map(w => `<option value="${w.id}">${w.icon} ${t('world.' + w.id) || w.name}</option>`).join('')}
        </select>
      </label>
      <label class="text-sm">${t('library.owned')}
        <select id="f-owned" class="question-option" style="margin-left:6px">
          <option value="all">${t('library.all')}</option>
          <option value="true">${t('library.filterCollected')}</option>
          <option value="false">${t('library.filterLocked')}</option>
        </select>
      </label>
      <label class="text-sm">${t('library.rarity')}
        <select id="f-rarity" class="question-option" style="margin-left:6px">
          <option value="">${t('library.all')}</option>
          <option value="common">⚪ ${t('library.rarityCommon')}</option>
          <option value="uncommon">🟢 ${t('library.rarityUncommon')}</option>
          <option value="rare">🔵 ${t('library.rarityRare')}</option>
          <option value="epic">🟣 ${t('library.rarityEpic')}</option>
          <option value="legendary">🟡 ${t('library.rarityLegendary')}</option>
        </select>
      </label>
    </div>`;
    bar.querySelector('#f-world').addEventListener('change', e => { filters.world = e.target.value; renderCards(); });
    bar.querySelector('#f-owned').addEventListener('change', e => { filters.owned = e.target.value; renderCards(); });
    bar.querySelector('#f-rarity').addEventListener('change', e => { filters.rarity = e.target.value; renderCards(); });
  }

  function renderCards() {
    const host = root.querySelector('#cards');
    host.innerHTML = '';
    const filterArg = {};
    if (filters.world) filterArg.world = filters.world;
    if (filters.owned === 'true') filterArg.owned = true;
    if (filters.owned === 'false') filterArg.owned = false;
    if (filters.rarity) filterArg.rarity = filters.rarity;
    const cards = cardEngine.list(filterArg);
    if (!cards.length) {
      host.appendChild(el(`<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🃏</div>
        <p>${t('library.empty')}</p>
      </div>`));
      return;
    }
    cards.forEach(card => host.appendChild(knowledgeCard.render(card, { onClick: () => showCardDetail(card) })));
  }

  function showCardDetail(card) {
    cardEngine.view(card.cardId);
    modal.open({
      title: '',
      bodyHtml: knowledgeCard.renderDetail(card),
      actions: [{ label: t('library.close'), style: 'btn-secondary', onClick: () => {} }]
    });
  }
}

function stat(icon, label, value) {
  return `<div class="card" style="text-align:center;background:var(--space-surface)">
    <div style="font-size:1.5rem">${icon}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>`;
}

export default { render };