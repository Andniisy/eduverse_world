import { storage } from './storage.js';
import { state } from './state.js';
import { router } from './router.js';
import { events, EVT } from './events.js';
import { loadJSON } from '../utils/helpers.js';
import { validateDatabase } from '../utils/validators.js';
import { universeAudio } from './universeAudio.js';

class App {
  constructor() {
    this.data = {};
    this._ready = false;
    this._readyResolvers = [];
  }

  async boot() {
    console.log('[EDUVERSE] Booting…');
    universeAudio.mount();
    await this._loadData();
    const report = validateDatabase(this.data);
    this._reportValidation(report);
    state.load();
    this._applySettings();
    await this._registerScreens();

    const container = document.getElementById('screen-container');
    if (!container) { console.error('[EDUVERSE] Missing #screen-container in DOM.'); return; }
    router.mount(container);

    this._navigateInitial();
    this._bindGlobalShortcuts();
    this._updateStreak();

    this._ready = true;
    events.emit(EVT.APP_READY, { data: this.data });
    this._resolveReady();
    console.log('[EDUVERSE] Ready ✓');
  }

  ready() {
    if (this._ready) return Promise.resolve();
    return new Promise(res => this._readyResolvers.push(res));
  }

  _resolveReady() { this._readyResolvers.forEach(r => r()); this._readyResolvers = []; }

  async _loadData() {
    const files = {
      worlds: 'data/worlds.json',
      zones: 'data/zones.json',
      concepts: 'data/concepts.json',
      curriculum: 'data/curriculum.json',
      sources: 'data/sources.json',
      quests: 'data/quests.json',
      questions: 'data/questions.json',
      feedback: 'data/feedback.json',
      hints: 'data/hints.json',
      misconceptions: 'data/misconceptions.json',
      cards: 'data/knowledgeCards.json',
      rewards: 'data/rewards.json',
      badges: 'data/badges.json',
      achievements: 'data/achievements.json',
      pets: 'data/pets.json'
    };

    const entries = Object.entries(files);
    const results = await Promise.allSettled(
      entries.map(([key, path]) =>
        loadJSON(path).then(data => ({ key, data })).catch(err => ({ key, error: err }))
      )
    );

    results.forEach(res => {
      if (res.status !== 'fulfilled') return;
      const { key, data, error } = res.value;
      if (error) { console.warn(`[EDUVERSE] Failed to load ${key}:`, error.message); this.data[key] = []; }
      else this.data[key] = data;
    });
  }

  _reportValidation(report) {
    if (report.valid) console.log('[EDUVERSE] Database validation: PASS ✓');
    else {
      console.warn('[EDUVERSE] Database validation: FAIL');
      report.errors.forEach(e => console.warn('  ✗', e));
    }
    if (report.warnings.length) {
      console.info('[EDUVERSE] Validation warnings:');
      report.warnings.forEach(w => console.info('  ⚠', w));
    }
  }

  _applySettings() {
    const reduced = state.getPath('settings.reducedMotion', false);
    document.documentElement.classList.toggle('reduce-motion', reduced);
  }

  async _registerScreens() {
    const modules = await Promise.allSettled([
      import('../screens/landing.js'),
      import('../screens/teacherLogin.js'),
      import('../screens/login.js'),
      import('../screens/avatar.js'),
      import('../screens/city.js'),
      import('../screens/arcade.js'),
      import('../screens/worldMap.js'),
      import('../screens/world.js'),
      import('../screens/zone.js'),
      import('../screens/quest.js'),
      import('../screens/gameplay.js'),
      import('../screens/library.js'),
      import('../screens/profile.js')
    ]);

    const names = ['landing', 'teacherLogin', 'login', 'avatar', 'city', 'arcade', 'worldMap',
                   'world', 'zone', 'quest', 'gameplay', 'library', 'profile'];

    modules.forEach((res, i) => {
      if (res.status === 'fulfilled' && res.value && res.value.default) {
        router.register(names[i], res.value.default);
      } else if (res.status === 'rejected') {
        console.warn(`[EDUVERSE] Screen "${names[i]}" failed to load:`, res.reason?.message);
      }
    });
  }

  _navigateInitial() {
    // V1.1: Selalu mulai dari landing. User memilih mau ke mana.
    // Auto-redirect dihapus agar siswa tidak "terjebak" di City.
    router.navigate('landing');
  }

  _bindGlobalShortcuts() {
    // Escape → tutup modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
          modal.classList.remove('active');
          events.emit(EVT.MODAL_CLOSE);
        }
      }
    });

    // Simpan state sebelum tab ditutup
    window.addEventListener('beforeunload', () => state.flush());
  }

  _updateStreak() {
    const user = state.getPath('user');
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = user.streak?.lastDate;
    if (!last) { state.setPath('user.streak', { current: 1, longest: 1, lastDate: today }); return; }
    if (last === today) return;
    const diffDays = Math.round((new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      const current = (user.streak.current || 0) + 1;
      const longest = Math.max(current, user.streak.longest || 0);
      state.setPath('user.streak', { current, longest, lastDate: today });
    } else if (diffDays > 1) {
      state.setPath('user.streak', { current: 1, longest: user.streak.longest || 1, lastDate: today });
    }
    events.emit(EVT.STREAK_UPDATED, state.getPath('user.streak'));
  }

  getWorlds() { return this.data.worlds || []; }
  getZones() { return this.data.zones || []; }
  getConcepts() { return this.data.concepts || []; }
  getQuests() { return this.data.quests || []; }
  getQuestions() { return this.data.questions || []; }
  getCards() { return this.data.cards || []; }
  getSources() { return this.data.sources || []; }
  getBadges() { return this.data.badges || []; }
  getAchievements() { return this.data.achievements || []; }
  getPets() { return this.data.pets || []; }
  getRewards() { return this.data.rewards || []; }
  getFeedback() { return this.data.feedback || []; }
  getHints() { return this.data.hints || []; }
  getMisconceptions() { return this.data.misconceptions || []; }

  getWorld(id) { return this.getWorlds().find(w => w.id === id); }
  getZone(id) { return this.getZones().find(z => z.id === id); }
  getQuest(id) { return this.getQuests().find(q => q.id === id); }
  getQuestion(id) { return this.getQuestions().find(q => q.id === id); }
  getCard(id) { return this.getCards().find(c => c.cardId === id); }
  getSource(id) { return this.getSources().find(s => s.id === id); }
  getBadge(id) { return this.getBadges().find(b => b.id === id); }
  getReward(id) { return this.getRewards().find(r => r.id === id); }
  getFeedbackById(id) { return this.getFeedback().find(f => f.id === id); }
  getHint(id) { return this.getHints().find(h => h.id === id); }
  getMisconception(id) { return this.getMisconceptions().find(m => m.id === id); }

  getZonesForWorld(worldId) { return this.getZones().filter(z => z.worldId === worldId).sort((a, b) => a.order - b.order); }
  getQuestsForZone(zoneId) { return this.getQuests().filter(q => q.zoneId === zoneId).sort((a, b) => a.order - b.order); }
  getQuestionsForQuest(questId) { return this.getQuestions().filter(q => q.questId === questId); }
}

export const app = new App();
export default app;