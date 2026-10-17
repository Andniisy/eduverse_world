import { app } from '../core/app.js';
import { el, shuffle } from '../utils/helpers.js';

const SUPPORTED_TYPES = new Set(['mcq','multi-select','true-false','matching','ordering','drag-drop','classification','scenario','short-response','puzzle']);

class QuestionEngine {
  render(question, onAnswer, options = {}) {
    if (!SUPPORTED_TYPES.has(question.questionType)) return this._unsupported(question);
    const wrap = el(`<div class="question-container" data-qid="${question.id}"></div>`);
    wrap.appendChild(el(`<h2 class="question-prompt">${this._escape(question.prompt)}</h2>`));

    switch (question.questionType) {
      case 'mcq': case 'scenario': wrap.appendChild(this._renderMCQ(question, onAnswer, options)); break;
      case 'multi-select': wrap.appendChild(this._renderMultiSelect(question, onAnswer, options)); break;
      case 'true-false': wrap.appendChild(this._renderTrueFalse(question, onAnswer, options)); break;
      case 'matching': wrap.appendChild(this._renderMatching(question, onAnswer, options)); break;
      case 'ordering': wrap.appendChild(this._renderOrdering(question, onAnswer, options)); break;
      case 'classification': case 'drag-drop': wrap.appendChild(this._renderClassification(question, onAnswer, options)); break;
      case 'short-response': wrap.appendChild(this._renderShortResponse(question, onAnswer, options)); break;
      case 'puzzle': wrap.appendChild(this._renderPuzzle(question, onAnswer, options)); break;
      default: wrap.appendChild(el(`<p>Unsupported question type.</p>`));
    }
    return wrap;
  }

  validate(question, answer) {
    switch (question.questionType) {
      case 'mcq': case 'scenario': return { correct: answer === question.correctAnswer, normalized: answer };
      case 'multi-select': {
        const a = Array.isArray(answer) ? [...answer].sort() : [];
        const b = Array.isArray(question.correctAnswer) ? [...question.correctAnswer].sort() : [];
        return { correct: a.length === b.length && a.every((v, i) => v === b[i]), normalized: a };
      }
      case 'true-false': return { correct: Boolean(answer) === Boolean(question.correctAnswer), normalized: answer };
      case 'matching': {
        const pairs = question.pairs || [];
        return { correct: pairs.every(p => answer && answer[p.left] === p.right), normalized: answer };
      }
      case 'ordering': {
        const a = Array.isArray(answer) ? answer : [];
        const b = question.correctAnswer || [];
        return { correct: a.length === b.length && a.every((v, i) => v === b[i]), normalized: a };
      }
      case 'classification': case 'drag-drop': {
        const cats = question.categories || [];
        const correct = cats.every(c => {
          const expected = (question.correctAnswer?.[c] || []).slice().sort();
          const given = (answer?.[c] || []).slice().sort();
          return expected.length === given.length && expected.every((v, i) => v === given[i]);
        });
        return { correct, normalized: answer };
      }
      case 'short-response': {
        const given = String(answer || '').trim().toLowerCase();
        const acceptable = (question.acceptableAnswers || [String(question.correctAnswer || '').toLowerCase()]).map(s => String(s).trim().toLowerCase());
        return { correct: acceptable.includes(given), normalized: given };
      }
      case 'puzzle': {
        if (question.correctAnswer && typeof question.correctAnswer === 'object' && !Array.isArray(question.correctAnswer)) {
          const entries = Object.entries(question.correctAnswer);
          const correct = entries.every(([k, v]) => String(answer?.[k]) === String(v));
          return { correct, normalized: answer };
        }
        return { correct: false, normalized: answer };
      }
      default: return { correct: false, normalized: answer };
    }
  }

  getHint(question, level) {
    const hint = app.getHint(question.hintId);
    if (!hint) return null;
    const key = `hint${Math.max(1, Math.min(4, level))}`;
    return hint[key] || null;
  }

  _renderMCQ(question, onAnswer, options) {
    const wrap = el(`<div class="question-options"></div>`);
    (question.options || []).forEach(opt => {
      const btn = el(`<button class="question-option" type="button" data-id="${opt.id}">
        <span class="question-option-icon">${opt.icon || ''}</span>
        <span>${this._escape(opt.text)}</span>
      </button>`);
      if (options.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        if (options.disabled) return;
        wrap.querySelectorAll('.question-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        onAnswer(opt.id, { type: 'mcq' });
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  _renderMultiSelect(question, onAnswer, options) {
    const wrap = el(`<div class="question-options"></div>`);
    const selected = new Set();
    (question.options || []).forEach(opt => {
      const btn = el(`<button class="question-option" type="button" data-id="${opt.id}">
        <span class="question-option-icon">${opt.icon || '🔲'}</span>
        <span>${this._escape(opt.text)}</span>
      </button>`);
      if (options.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        if (options.disabled) return;
        if (selected.has(opt.id)) { selected.delete(opt.id); btn.classList.remove('selected'); }
        else { selected.add(opt.id); btn.classList.add('selected'); }
      });
      wrap.appendChild(btn);
    });
    const submit = el(`<button class="btn btn-primary mt-4" type="button">Submit</button>`);
    submit.addEventListener('click', () => {
      if (options.disabled || selected.size === 0) return;
      onAnswer(Array.from(selected), { type: 'multi-select' });
    });
    wrap.appendChild(submit);
    return wrap;
  }

  _renderTrueFalse(question, onAnswer, options) {
    const wrap = el(`<div class="question-options"></div>`);
    [{ id: true, text: 'Benar / True', icon: '✅' }, { id: false, text: 'Salah / False', icon: '❌' }].forEach(opt => {
      const btn = el(`<button class="question-option" type="button" data-id="${opt.id}">
        <span class="question-option-icon">${opt.icon}</span>
        <span>${opt.text}</span>
      </button>`);
      if (options.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        if (options.disabled) return;
        wrap.querySelectorAll('.question-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        onAnswer(opt.id, { type: 'true-false' });
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  _renderMatching(question, onAnswer, options) {
    const wrap = el(`<div></div>`);
    const leftItems = question.pairs.map(p => p.left);
    const rightItems = shuffle(question.pairs.map(p => p.right));
    const selection = {};
    let activeLeft = null;

    const columns = el(`<div class="grid grid-2" style="gap:var(--space-4)"></div>`);
    const leftCol = el(`<div class="flex flex-col gap-2"></div>`);
    const rightCol = el(`<div class="flex flex-col gap-2"></div>`);

    leftItems.forEach(left => {
      const btn = el(`<button class="question-option" type="button" data-left="${left}"><span>${this._escape(left)}</span></button>`);
      if (options.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        if (options.disabled) return;
        activeLeft = left;
        leftCol.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      leftCol.appendChild(btn);
    });

    rightItems.forEach(right => {
      const btn = el(`<button class="question-option" type="button" data-right="${right}"><span>${this._escape(right)}</span></button>`);
      if (options.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        if (options.disabled || !activeLeft) return;
        selection[activeLeft] = right;
        const lb = leftCol.querySelector(`[data-left="${CSS.escape(activeLeft)}"]`);
        if (lb) { lb.classList.add('selected'); lb.dataset.paired = right; }
        activeLeft = null;
        if (Object.keys(selection).length === leftItems.length) onAnswer(selection, { type: 'matching' });
      });
      rightCol.appendChild(btn);
    });

    columns.appendChild(leftCol);
    columns.appendChild(rightCol);
    wrap.appendChild(columns);
    return wrap;
  }

  _renderOrdering(question, onAnswer, options) {
    const wrap = el(`<div class="flex flex-col gap-2"></div>`);
    const items = shuffle(question.items || []);
    const list = el(`<div class="flex flex-col gap-2" id="order-list"></div>`);
    items.forEach(item => {
      const row = el(`<div class="question-option" style="justify-content:space-between" data-id="${item.id}">
        <span><span class="question-option-icon">${item.icon || '↕️'}</span>${this._escape(item.text)}</span>
      </div>`);
      const ctrl = el(`<div class="flex gap-1"></div>`);
      const up = el(`<button class="btn btn-sm btn-secondary" type="button" style="padding:2px 10px">↑</button>`);
      const dn = el(`<button class="btn btn-sm btn-secondary" type="button" style="padding:2px 10px">↓</button>`);
      up.addEventListener('click', (e) => { e.stopPropagation(); const prev = row.previousElementSibling; if (prev) list.insertBefore(row, prev); });
      dn.addEventListener('click', (e) => { e.stopPropagation(); const next = row.nextElementSibling; if (next) list.insertBefore(next, row); });
      ctrl.appendChild(up); ctrl.appendChild(dn);
      row.appendChild(ctrl);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    const submit = el(`<button class="btn btn-primary mt-4" type="button">Submit Order</button>`);
    submit.addEventListener('click', () => {
      if (options.disabled) return;
      const order = Array.from(list.children).map(c => c.dataset.id);
      onAnswer(order, { type: 'ordering' });
    });
    wrap.appendChild(submit);
    return wrap;
  }

  _renderClassification(question, onAnswer, options) {
    const wrap = el(`<div></div>`);
    const cats = question.categories || [];
    const itemState = {};
    const itemsWrap = el(`<div class="flex flex-wrap gap-2 mb-4"></div>`);
    (question.items || []).forEach(item => {
      const chip = el(`<button class="btn btn-secondary" type="button" data-item="${item.id}">
        <span>${item.icon || ''} ${this._escape(item.text)}</span>
      </button>`);
      chip.addEventListener('click', () => {
        if (options.disabled) return;
        const currentCat = itemState[item.id];
        const idx = currentCat ? cats.indexOf(currentCat) : -1;
        const nextCat = cats[(idx + 1) % cats.length];
        itemState[item.id] = nextCat;
        chip.innerHTML = `<span>${item.icon || ''} ${this._escape(item.text)} <b>→ ${nextCat}</b></span>`;
        chip.classList.add('selected');
      });
      itemsWrap.appendChild(chip);
    });
    wrap.appendChild(itemsWrap);
    wrap.appendChild(el(`<div class="text-sm mb-4" style="color:var(--muted-star)">Tap an item to cycle through categories: ${cats.join(' → ')}</div>`));
    const submit = el(`<button class="btn btn-primary" type="button">Submit</button>`);
    submit.addEventListener('click', () => {
      if (options.disabled) return;
      const ans = {};
      cats.forEach(c => ans[c] = []);
      (question.items || []).forEach(item => {
        const cat = itemState[item.id];
        if (cat) ans[cat].push(item.id);
      });
      onAnswer(ans, { type: 'classification' });
    });
    wrap.appendChild(submit);
    return wrap;
  }

  _renderShortResponse(question, onAnswer, options) {
    const wrap = el(`<div></div>`);
    const input = el(`<input type="text" class="question-option" placeholder="Type your answer…" />`);
    if (options.disabled) input.disabled = true;
    const submit = el(`<button class="btn btn-primary mt-4" type="button">Submit</button>`);
    submit.addEventListener('click', () => {
      if (options.disabled) return;
      const val = input.value.trim();
      if (!val) return;
      onAnswer(val, { type: 'short-response' });
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit.click(); });
    wrap.appendChild(input);
    wrap.appendChild(submit);
    return wrap;
  }

  _renderPuzzle(question, onAnswer, options) {
    if (question.items && question.items[0]?.correctPosition != null) {
      return this._renderOrdering({
        items: question.items,
        correctAnswer: question.items.slice().sort((a, b) => a.correctPosition - b.correctPosition).map(i => i.id)
      }, onAnswer, options);
    }
    if (question.items && question.items[0]?.system != null) {
      const cats = Array.from(new Set(question.items.map(i => i.system)));
      return this._renderClassification({ items: question.items, categories: cats }, onAnswer, options);
    }
    return this._renderMCQ({ options: question.items || [], correctAnswer: question.correctAnswer }, onAnswer, options);
  }

  _unsupported(question) {
    return el(`<div class="empty-state"><div class="empty-state-icon">❓</div><p>Unsupported type: ${question.questionType}</p></div>`);
  }

  _escape(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

export const questionEngine = new QuestionEngine();
export default questionEngine;