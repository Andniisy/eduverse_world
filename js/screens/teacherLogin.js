/**
 * EDUVERSE — Teacher Login Screen
 */

import { el } from '../utils/helpers.js';
import { auth } from '../core/auth.js';
import { t } from '../core/i18n.js';

function render(container) {
  // Kalau sudah login, langsung ke dashboard
  if (auth.isLoggedIn()) {
    window.location.href = 'teacher.html';
    return;
  }

  container.appendChild(el(`
    <div class="screen active" style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:var(--space-6)">
      <div class="container" style="max-width:440px">
        <div style="text-align:center;margin-bottom:var(--space-6)">
          <div style="font-size:3.5rem;margin-bottom:var(--space-3)">👩‍🏫</div>
          <h1 style="font-family:var(--font-display);font-size:var(--text-3xl);margin-bottom:var(--space-2)">
            ${t('teacherLogin.title')}
          </h1>
          <p style="color:var(--muted-star)">
            ${t('teacherLogin.subtitle')}
          </p>
        </div>

        <form id="teacher-login-form" class="card" style="display:flex;flex-direction:column;gap:var(--space-4)">
          <div>
            <label for="teacher-email" style="font-weight:600;display:block;margin-bottom:var(--space-2)">
              ${t('teacherLogin.email')}
            </label>
            <input id="teacher-email" type="email" class="question-option" 
                   placeholder="${t('teacherLogin.emailPlaceholder')}" 
                   autocomplete="username" required
                   style="width:100%" />
          </div>

          <div>
            <label for="teacher-password" style="font-weight:600;display:block;margin-bottom:var(--space-2)">
              ${t('teacherLogin.password')}
            </label>
            <input id="teacher-password" type="password" class="question-option" 
                   placeholder="${t('teacherLogin.passwordPlaceholder')}" 
                   autocomplete="current-password" required
                   style="width:100%" />
          </div>

          <p id="teacher-error" class="text-sm" style="color:var(--error);display:none"></p>

          <button class="btn btn-primary btn-lg mt-2" type="submit">
            ${t('teacherLogin.submit')}
          </button>

          <a href="index.html#home" onclick="event.preventDefault();window.location.href='index.html';" class="btn btn-secondary" style="text-decoration:none;text-align:center">
            ${t('teacherLogin.back')}
          </a>
        </form>

        <p class="text-sm" style="color:var(--muted-star);text-align:center;margin-top:var(--space-4)">
          ${t('teacherLogin.hint')}
        </p>
      </div>
    </div>
  `));

  const form = container.querySelector('#teacher-login-form');
  const emailInput = container.querySelector('#teacher-email');
  const pwInput = container.querySelector('#teacher-password');
  const errorBox = container.querySelector('#teacher-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const result = auth.login(emailInput.value, pwInput.value);
    if (result.success) {
      window.location.href = 'teacher.html';
    } else {
      errorBox.textContent = result.reason || 'Login gagal.';
      errorBox.style.display = 'block';
      pwInput.value = '';
      pwInput.focus();
    }
  });
}

export default { render };