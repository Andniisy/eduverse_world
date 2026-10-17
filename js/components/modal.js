import { el } from '../utils/helpers.js';
import { events, EVT } from '../core/events.js';

const MODAL_ID = 'eduverse-modal';

function ensureContainer() {
  let host = document.getElementById(MODAL_ID);
  if (!host) {
    host = el(`<div class="modal-overlay" id="${MODAL_ID}" role="dialog" aria-modal="true"></div>`);
    host.addEventListener('click', (e) => { if (e.target === host) close(); });
    document.body.appendChild(host);
  }
  return host;
}

export function open({ title = '', bodyHtml = '', actions = [], onClose = null } = {}) {
  const host = ensureContainer();
  host.innerHTML = '';
  const panel = el(`<div class="modal" role="document"></div>`);
  if (title) panel.appendChild(el(`<h2 class="mb-4">${title}</h2>`));
  panel.appendChild(el(`<div class="modal-body mb-6">${bodyHtml}</div>`));

  const actionRow = el(`<div class="flex gap-3 justify-center flex-wrap"></div>`);
  actions.forEach(a => {
    const btn = el(`<button class="btn ${a.style || 'btn-primary'}" type="button">${a.label}</button>`);
    btn.addEventListener('click', () => {
      if (typeof a.onClick === 'function') a.onClick();
      if (a.closeOnClick !== false) close();
    });
    actionRow.appendChild(btn);
  });
  panel.appendChild(actionRow);
  host.appendChild(panel);
  host.classList.add('active');
  events.emit(EVT.MODAL_OPEN, { title });

  const focusable = panel.querySelector('button, input, textarea, select, [tabindex]');
  if (focusable) setTimeout(() => focusable.focus(), 30);
  host._onClose = onClose;
  return host;
}

export function close() {
  const host = document.getElementById(MODAL_ID);
  if (!host) return;
  host.classList.remove('active');
  host.innerHTML = '';
  const cb = host._onClose;
  host._onClose = null;
  events.emit(EVT.MODAL_CLOSE);
  if (typeof cb === 'function') cb();
}

export function confirm({ title, message, confirmLabel = 'OK', cancelLabel = 'Cancel' }) {
  return new Promise(resolve => {
    open({
      title, bodyHtml: `<p>${message}</p>`,
      actions: [
        { label: cancelLabel, style: 'btn-secondary', onClick: () => resolve(false) },
        { label: confirmLabel, style: 'btn-primary', onClick: () => resolve(true) }
      ],
      onClose: () => resolve(false)
    });
  });
}

export function alert({ title, message, okLabel = 'OK' }) {
  return new Promise(resolve => {
    open({
      title, bodyHtml: `<p>${message}</p>`,
      actions: [{ label: okLabel, style: 'btn-primary', onClick: () => resolve(true) }],
      onClose: () => resolve(true)
    });
  });
}

export const modal = { open, close, confirm, alert };
export default modal;