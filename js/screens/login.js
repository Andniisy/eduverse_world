import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events, EVT } from '../core/events.js';
import { validateName } from '../utils/validators.js';
import { analyticsEngine } from '../engines/analyticsEngine.js';

function render(container) {
  const existing = state.getPath('user');
  container.appendChild(el(`<div class="screen active" style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 120px)">
    <div class="container" style="max-width:480px;text-align:center">
      <div style="font-size:3.5rem;margin-bottom:var(--space-3)">🤖</div>
      <h1 style="font-family:var(--font-display);font-size:var(--text-3xl);margin-bottom:var(--space-2)">Welcome, Explorer</h1>
      <p style="color:var(--muted-star);margin-bottom:var(--space-6)">I'm <b>EDO</b>, your guide. What should I call you?</p>
      <form id="login-form" style="display:flex;flex-direction:column;gap:var(--space-3);text-align:left">
        <label for="input-name" style="font-weight:600">Explorer name</label>
        <input id="input-name" class="question-option" type="text" placeholder="e.g., Alya" autocomplete="off" maxlength="30" required />
        <p id="name-error" class="text-sm" style="color:var(--error);display:none"></p>
        <button class="btn btn-primary btn-lg mt-2" type="submit">Continue →</button>
        <button class="btn btn-secondary" type="button" id="btn-back">← Back</button>
      </form>
    </div>
  </div>`));

  const form = container.querySelector('#login-form');
  const input = container.querySelector('#input-name');
  const error = container.querySelector('#name-error');
  if (existing?.name) input.value = existing.name;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    error.style.display = 'none';
    const result = validateName(input.value);
    if (!result.valid) { error.textContent = result.reason; error.style.display = 'block'; return; }

    if (!existing) state.createUser({ name: result.value });
    else state.setPath('user.name', result.value);

    events.emit(EVT.USER_LOGIN, { name: result.value });
    analyticsEngine.track(EVT.USER_LOGIN, { name: result.value });
    state.flush();

    const user = state.getPath('user');
    if (!user.avatar || !user.avatar.gender) router.navigate('avatar');
    else router.navigate('city');
  });

  container.querySelector('#btn-back').addEventListener('click', () => router.navigate('landing'));
}

export default { render };