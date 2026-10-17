import { state } from './state.js';
import { events, EVT } from './events.js';

class Router {
  constructor() {
    this._screens = new Map();
    this._current = null;
    this._container = null;
    this._history = [];
  }

  register(name, module) { this._screens.set(name, module); }
  mount(container) { this._container = container; }

  navigate(name, params = {}) {
    if (!this._screens.has(name)) { console.error(`[Router] Unknown screen: "${name}"`); return; }
    const module = this._screens.get(name);

    if (this._current && this._current.module.teardown) {
      try { this._current.module.teardown(); } catch (e) { console.error('[Router] Teardown error:', e); }
    }

    const prev = state.getPath('currentScreen');
    if (prev && prev !== name) {
      state.setPath('previousScreen', prev);
      this._history.push(prev);
    }
    state.setPath('currentScreen', name);

    if (this._container) this._container.innerHTML = '';

    this._current = { name, module, params };

    try {
      if (this._container) module.render(this._container, params);
      events.emit(EVT.SCREEN_CHANGED, { name, params, previous: prev });
    } catch (e) {
      console.error(`[Router] Render error on "${name}":`, e);
      if (this._container) {
        this._container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <p>Something went wrong loading this screen.</p>
            <button class="btn btn-primary mt-4" onclick="location.reload()">Reload</button>
          </div>`;
      }
    }
  }

  back() {
    const prev = this._history.pop();
    if (prev) this.navigate(prev);
  }

  current() { return this._current ? this._current.name : null; }
}

export const router = new Router();
export default router;