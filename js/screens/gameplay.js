import { el } from '../utils/helpers.js';
import { state } from '../core/state.js';
import { router } from '../core/router.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';
import { gameEngine } from '../engines/gameEngine.js';
import { questionEngine } from '../engines/questionEngine.js';
import feedbackPanel from '../components/feedbackPanel.js';
import rewardPanel from '../components/rewardPanel.js';
import modal from '../components/modal.js';
import { t } from '../core/i18n.js';

let _state = { locked: false };

function render(container, params) {
  container.innerHTML = '';

  const quest = app.getQuest(params.questId);
  if (!quest) { router.navigate('worldMap'); return; }
  const started = gameEngine.startQuest(quest.id);
  if (!started) { router.navigate('quest', { questId: quest.id }); return; }
  _state = { locked: false };

  const root = el(`<div class="screen active">
    <div class="container mt-4" style="max-width:820px">
      <div class="flex justify-between items-center mb-4">
        <button class="btn btn-sm btn-secondary" type="button" id="btn-quit">${t('gameplay.exit')}</button>
        <div id="progress-indicator" class="tag"></div>
        <button class="btn btn-sm btn-secondary hint-btn" type="button" id="btn-hint" aria-label="${t('gameplay.hint')}">
          ${t('gameplay.hint')} <span class="hint-count" id="hint-count" style="display:none">0</span>
        </button>
      </div>
      <div id="hint-area"></div>
      <div id="question-area"></div>
      <div id="feedback-area"></div>
    </div>
  </div>`);
  container.appendChild(root);

  root.querySelector('#btn-quit').addEventListener('click', confirmQuit);
  root.querySelector('#btn-hint').addEventListener('click', useHint);

  drawQuestion();

  const unsub = state.subscribe(() => {
    if (state.getPath('currentScreen') !== 'gameplay') return;
    updateProgressIndicator();
  });
  root._cleanup = () => unsub();
}

function teardown() {
  gameEngine.reset();
  _state = { locked: false };
}

function drawQuestion() {
  const questionArea = document.getElementById('question-area');
  const feedbackArea = document.getElementById('feedback-area');
  const hintArea = document.getElementById('hint-area');
  if (!questionArea) return;

  feedbackArea.innerHTML = '';
  hintArea.innerHTML = '';
  questionArea.innerHTML = '';

  const question = currentQuestion();
  if (!question) { finishQuest(); return; }

  state.setPath('game.status', 'playing');
  _state.locked = false;

  const node = questionEngine.render(question, (answer) => {
    if (_state.locked) return;
    _state.locked = true;
    handleAnswer(answer);
  });
  questionArea.appendChild(node);

  events.emit(EVT.QUESTION_VIEWED, { questionId: question.id });
  updateProgressIndicator();
  updateHintBadge();
}

function handleAnswer(answer) {
  const result = gameEngine.submitAnswer(answer);
  if (!result) return;
  const feedbackArea = document.getElementById('feedback-area');
  feedbackArea.innerHTML = '';
  const panel = feedbackPanel.render(result.feedback, {
    showActions: true,
    canContinue: result.correct,
    onRetry: () => { state.setPath('game.status', 'playing'); drawQuestion(); },
    onContinue: () => {
      const next = gameEngine.continue();
      if (next.done) finishQuest();
      else drawQuestion();
    }
  });
  feedbackArea.appendChild(panel);
}

function useHint() {
  const question = currentQuestion();
  if (!question) return;
  const result = gameEngine.useHint();
  if (!result) return;
  const hintArea = document.getElementById('hint-area');
  hintArea.innerHTML = '';
  hintArea.appendChild(el(`<div class="knowledge-flash mb-4">
    <div class="knowledge-flash-title">${t('gameplay.hintLevel', { level: result.level })}</div>
    <p>${result.text || t('gameplay.hintDefault')}</p>
  </div>`));
  updateHintBadge();
}

function updateHintBadge() {
  const badge = document.getElementById('hint-count');
  if (!badge) return;
  const used = state.getPath('game.hintsUsed', 0);
  if (used > 0) { badge.style.display = 'inline-flex'; badge.textContent = used; }
  else badge.style.display = 'none';
}

function updateProgressIndicator() {
  const el_ = document.getElementById('progress-indicator');
  if (!el_) return;
  const g = state.getPath('game');
  if (!g) return;
  el_.textContent = `${t('gameplay.q')} ${g.currentQuestionIndex + 1} ${t('gameplay.of')} ${g.questions.length} • ${t('gameplay.scoreLabel')} ${g.correctAnswers} ✓`;
}

function finishQuest() {
  const result = gameEngine.complete();
  if (!result) { router.navigate('city'); return; }
  const container = document.getElementById('question-area').parentElement.parentElement;
  container.innerHTML = '';

  const wrap = el(`<div class="container mt-8" style="max-width:640px"></div>`);

  if (result.passed) {
    wrap.appendChild(rewardPanel.render(result.rewardSummary, {
      onClose: () => router.navigate('zone', { zoneId: result.quest.zoneId })
    }));
    const masteryFeedback = state.getPath('game.masteryFeedback');
    if (masteryFeedback) {
      wrap.appendChild(el(`<div class="mt-6"></div>`));
      wrap.appendChild(feedbackPanel.renderMastery(masteryFeedback));
    }
  } else {
    const typeLabel = {
      learning: t('quest.typeLearning'),
      challenge: t('quest.typeChallenge'),
      boss: t('quest.typeBoss')
    }[result.quest.type];

    wrap.appendChild(el(`<div class="card" style="text-align:center;padding:var(--space-8)">
      <div style="font-size:3rem">💪</div>
      <h2 class="mt-3">${t('gameplay.youScored', { score: result.score })}</h2>
      <p class="mt-2" style="color:var(--muted-star)">
        ${t('gameplay.needToPass', { type: typeLabel, required: result.quest.requiredScore })}
      </p>
      <div class="flex gap-3 justify-center mt-6 flex-wrap">
        <button class="btn btn-primary btn-lg" id="btn-retry">${t('gameplay.retry')}</button>
        <button class="btn btn-secondary btn-lg" id="btn-exit">${t('gameplay.backToZone')}</button>
      </div>
    </div>`));
    wrap.querySelector('#btn-retry').addEventListener('click', () => {
      gameEngine.retry();
      router.navigate('gameplay', { questId: result.quest.id });
    });
    wrap.querySelector('#btn-exit').addEventListener('click', () => router.navigate('zone', { zoneId: result.quest.zoneId }));
  }
  container.appendChild(wrap);
}

function currentQuestion() {
  const g = state.getPath('game');
  if (!g || !g.questions) return null;
  return g.questions[g.currentQuestionIndex] || null;
}

function confirmQuit() {
  modal.confirm({
    title: t('gameplay.quitTitle'),
    message: t('gameplay.quitMsg'),
    confirmLabel: t('gameplay.quitConfirm'),
    cancelLabel: t('gameplay.quitCancel')
  }).then(confirmed => {
    if (confirmed) {
      gameEngine.reset();
      const quest = state.getPath('currentQuest');
      router.navigate('zone', { zoneId: quest?.zoneId });
    }
  });
}

export default { render, teardown };