const STORAGE_PREFIX = 'eduverse_';
const STORAGE_VERSION = 1;

class Storage {
  constructor() {
    this._available = this._checkAvailability();
  }

  _checkAvailability() {
    try {
      const test = '__eduverse_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('[Storage] localStorage unavailable. Using in-memory fallback.');
      return false;
    }
  }

  _getKey(key) { return `${STORAGE_PREFIX}${key}`; }

  save(key, value) {
    try {
      const payload = { version: STORAGE_VERSION, savedAt: new Date().toISOString(), data: value };
      const serialized = JSON.stringify(payload);
      if (this._available) window.localStorage.setItem(this._getKey(key), serialized);
      else { this._memory = this._memory || {}; this._memory[this._getKey(key)] = serialized; }
      return true;
    } catch (e) { console.error('[Storage] Save failed:', e); return false; }
  }

  load(key, fallback = null) {
    try {
      let serialized;
      if (this._available) serialized = window.localStorage.getItem(this._getKey(key));
      else { this._memory = this._memory || {}; serialized = this._memory[this._getKey(key)]; }
      if (!serialized) return fallback;
      const payload = JSON.parse(serialized);
      if (payload.version !== STORAGE_VERSION) return this._migrate(key, payload, fallback);
      return payload.data;
    } catch (e) { console.error('[Storage] Load failed:', e); return fallback; }
  }

  remove(key) {
    try {
      if (this._available) window.localStorage.removeItem(this._getKey(key));
      else if (this._memory) delete this._memory[this._getKey(key)];
      return true;
    } catch (e) { console.error('[Storage] Remove failed:', e); return false; }
  }

  has(key) {
    if (this._available) return window.localStorage.getItem(this._getKey(key)) !== null;
    return !!(this._memory && this._memory[this._getKey(key)]);
  }

  keys() {
    const result = [];
    if (this._available) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) result.push(k.replace(STORAGE_PREFIX, ''));
      }
    } else if (this._memory) {
      Object.keys(this._memory).forEach(k => {
        if (k.startsWith(STORAGE_PREFIX)) result.push(k.replace(STORAGE_PREFIX, ''));
      });
    }
    return result;
  }

  clearAll() { this.keys().forEach(k => this.remove(k)); return true; }

  exportAll() {
    const result = {};
    this.keys().forEach(k => { result[k] = this.load(k); });
    return result;
  }

  importAll(data) {
    if (!data || typeof data !== 'object') return false;
    Object.keys(data).forEach(k => this.save(k, data[k]));
    return true;
  }

  _migrate(key, oldPayload, fallback) { return oldPayload.data ?? fallback; }
}

export const storage = new Storage();
export default storage;