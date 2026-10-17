import { storage } from './storage.js';

const STATE_KEY = 'eduverseState';

const defaultUser = {
  name: '',
  avatar: { role: null, avatarKey: null, gender: null, hair: null, outfit: null, accessories: [] },
  level: 1, xp: 0, coins: 0, badges: [], crystals: [], cards: [], pets: [], achievements: [],
  streak: { current: 0, longest: 0, lastDate: null },
  worldsUnlocked: ['SCI', 'MAT'],
  createdAt: null
};

const defaultState = {
  user: null,
  currentScreen: 'landing',
  previousScreen: null,
  currentWorld: null,
  currentZone: null,
  currentQuest: null,
  game: {
    status: 'idle',
    currentQuestionIndex: 0,
    score: 0,
    attempts: 0,
    hintsUsed: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    questions: [],
    answers: [],
    consecutiveErrors: 0
  },
  progress: {},
  mastery: {},
  inventory: { cards: [], badges: [], crystals: [], pets: [] },
  settings: { sound: true, reducedMotion: false },
  analytics: { events: [] }
};

class StateManager {
  constructor() {
    this._state = this._deepClone(defaultState);
    this._subscribers = new Set();
    this._persistDebounced = this._debounce(() => this._persist(), 300);
  }

  get() { return this._state; }

  getPath(path, fallback = undefined) {
    const parts = path.split('.');
    let node = this._state;
    for (const p of parts) {
      if (node == null || typeof node !== 'object') return fallback;
      node = node[p];
    }
    return node === undefined ? fallback : node;
  }

  setState(newState) {
    this._state = this._deepMerge(this._deepClone(defaultState), newState);
    this._notify('setState');
    this._persistDebounced();
  }

  setPath(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let node = this._state;
    for (const p of parts) {
      if (node[p] == null || typeof node[p] !== 'object') node[p] = {};
      node = node[p];
    }
    node[last] = value;
    this._notify(path, value);
    this._persistDebounced();
  }

  merge(path, patch) {
    const current = this.getPath(path, {});
    this.setPath(path, { ...current, ...patch });
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  _notify(path, value) {
    this._subscribers.forEach(cb => {
      try { cb(this._state, path, value); } catch (e) { console.error('[State] Subscriber error:', e); }
    });
  }

  load() {
    const saved = storage.load(STATE_KEY, null);
    if (saved) this._state = this._deepMerge(this._deepClone(defaultState), saved);
    return this._state;
  }

  _persist() { storage.save(STATE_KEY, this._state); }
  flush() { this._persist(); }

  reset() {
    this._state = this._deepClone(defaultState);
    storage.remove(STATE_KEY);
    this._notify('reset');
  }

  createUser(profile) {
    this._state.user = { ...this._deepClone(defaultUser), ...profile, createdAt: new Date().toISOString() };
    this.setPath('currentScreen', 'city');
    this.flush();
    return this._state.user;
  }

  _deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  _deepMerge(target, source) {
    if (Array.isArray(source)) return source.slice();
    if (typeof source !== 'object' || source === null) return source;
    const out = Array.isArray(target) ? [] : { ...target };
    for (const key of Object.keys(source)) {
      const sv = source[key];
      const tv = target[key];
      if (Array.isArray(sv)) out[key] = sv.slice();
      else if (sv && typeof sv === 'object') out[key] = this._deepMerge(tv && typeof tv === 'object' ? tv : {}, sv);
      else out[key] = sv;
    }
    return out;
  }

  _debounce(fn, wait) {
    let timer = null;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
  }
}

export const state = new StateManager();
export default state;