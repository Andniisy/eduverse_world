import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';
import { adaptiveEngine } from './adaptiveEngine.js';
import { progressionEngine } from './progressionEngine.js';
import { rewardEngine } from './rewardEngine.js';
import { petEngine } from './petEngine.js';
import { cardEngine } from './cardEngine.js';
import { analyticsEngine } from './analyticsEngine.js';

class QuestEngine {
  prepare(questId) {
    const quest = app.getQuest(questId);
    if (!quest) throw new Error(`Quest "${questId}" not found.`);
    const questions = app.getQuestionsForQuest(questId);
    if (!questions.length) throw new Error(`Quest "${questId}" has no questions.`);
    adaptiveEngine.reset();
    const offset = adaptiveEngine.difficultyOffset();
    const sorted = questions.slice().sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
    state.setPath('currentQuest', quest);
    state.setPath('game', {
      status: 'briefing',
      currentQuestionIndex: 0,
      score: 0,
      attempts: 0,
      hintsUsed: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      questions: sorted,
      answers: [],
      consecutiveErrors: 0,
      difficultyOffset: offset,
      startedAt: new Date().toISOString()
    });
    return quest;
  }

  start() {
    const g = state.getPath('game');
    if (!g || g.status !== 'briefing') return false;
    state.setPath('game.status', 'playing');
    const quest = state.getPath('currentQuest');
    events.emit(EVT.QUEST_STARTED, { questId: quest.id, questName: quest.name, type: quest.type, worldId: quest.worldId, zoneId: quest.zoneId });
    analyticsEngine.track(EVT.QUEST_STARTED, { questId: quest.id, questName: quest.name, type: quest.type, world: quest.worldId, zone: quest.zoneId });
    return true;
  }

  currentQuestion() {
    const g = state.getPath('game');
    if (!g || !g.questions) return null;
    return g.questions[g.currentQuestionIndex] || null;
  }

  recordAnswer(question, answer, validation, feedback) {
    const g = state.getPath('game');
    if (!g) return;
    const attempt = {
      questionId: question.id,
      answer,
      correct: validation.correct,
      hintsUsed: g.hintsUsed || 0,
      feedbackType: feedback?.type,
      misconceptionId: feedback?.misconceptionId || null,
      timestamp: new Date().toISOString()
    };
    const answers = (g.answers || []).slice();
    answers.push(attempt);
    state.setPath('game.answers', answers);
    state.setPath('game.attempts', (g.attempts || 0) + 1);

    if (validation.correct) {
      state.setPath('game.correctAnswers', (g.correctAnswers || 0) + 1);
      state.setPath('game.consecutiveErrors', 0);
    } else {
      state.setPath('game.wrongAnswers', (g.wrongAnswers || 0) + 1);
      state.setPath('game.consecutiveErrors', (g.consecutiveErrors || 0) + 1);
    }

    adaptiveEngine.recordInteraction({
      correct: validation.correct,
      difficulty: question.difficulty || 2,
      hintUsed: g.hintsUsed || 0,
      conceptIds: question.conceptIds || [],
      misconceptionId: feedback?.misconceptionId || null
    });

    analyticsEngine.track(EVT.QUESTION_ANSWERED, {
      questionId: question.id,
      questId: question.questId,
      correct: validation.correct,
      hintsUsed: g.hintsUsed || 0,
      answer: validation.normalized,
      conceptIds: question.conceptIds
    });

    if (validation.correct) events.emit(EVT.QUESTION_CORRECT, { question, attempt });
    else {
      events.emit(EVT.QUESTION_INCORRECT, { question, attempt });
      if (feedback?.type === 'misconception' && feedback.misconceptionId) {
        events.emit(EVT.MISCONCEPTION_DETECTED, { misconceptionId: feedback.misconceptionId, questionId: question.id, conceptIds: question.conceptIds });
        analyticsEngine.track(EVT.MISCONCEPTION_DETECTED, { misconceptionId: feedback.misconceptionId, questionId: question.id, conceptIds: question.conceptIds });
      }
    }
  }

  next() {
    const g = state.getPath('game');
    if (!g) return false;
    const nextIndex = g.currentQuestionIndex + 1;
    if (nextIndex >= g.questions.length) return false;
    state.setPath('game.currentQuestionIndex', nextIndex);
    state.setPath('game.hintsUsed', 0);
    state.setPath('game.status', 'playing');
    return true;
  }

  useHint(question) {
    const g = state.getPath('game');
    if (!g) return null;
    const level = Math.min(4, (g.hintsUsed || 0) + 1);
    state.setPath('game.hintsUsed', level);
    events.emit(EVT.HINT_USED, { questionId: question.id, level });
    analyticsEngine.track(EVT.HINT_USED, { questionId: question.id, level, conceptIds: question.conceptIds });
    return level;
  }

  finish() {
    const g = state.getPath('game');
    const quest = state.getPath('currentQuest');
    if (!g || !quest) return null;
    const total = g.questions.length || 1;
    const correct = g.correctAnswers || 0;
    const percent = Math.round((correct / total) * 100);
    const required = quest.requiredScore || 0;
    const passed = percent >= required || quest.type === 'learning';

    state.setPath('game.score', percent);
    state.setPath('game.status', passed ? 'completed' : 'failed');

    const progress = state.getPath(`progress.${quest.id}`, {}) || {};
    state.setPath(`progress.${quest.id}`, {
      ...progress,
      status: passed ? 'completed' : 'failed',
      score: percent,
      completedAt: progress.completedAt || (passed ? new Date().toISOString() : null),
      lastAttemptAt: new Date().toISOString(),
      attempts: (progress.attempts || 0) + 1
    });

    if (passed) {
      if (quest.rewardId) {
        const rewardSummary = rewardEngine.grant(quest.rewardId);
        rewardEngine.markClaimed(quest.rewardId);
        state.setPath('game.lastRewardSummary', rewardSummary);
      }
      petEngine.awardForQuest(quest.type);
      (quest.concepts || []).forEach(cid => cardEngine.syncFromMastery(cid));
      progressionEngine.recomputeLevel();
      progressionEngine.checkWorldUnlocks();
      events.emit(EVT.QUEST_COMPLETED, { questId: quest.id, score: percent, type: quest.type });
      analyticsEngine.track(EVT.QUEST_COMPLETED, { questId: quest.id, score: percent, type: quest.type });
      if (quest.type === 'boss') events.emit(EVT.BOSS_COMPLETED, { questId: quest.id, score: percent });
    } else {
      events.emit(EVT.QUEST_FAILED, { questId: quest.id, score: percent });
      analyticsEngine.track(EVT.QUEST_FAILED, { questId: quest.id, score: percent });
    }

    return { quest, score: percent, passed, total, correct, rewardSummary: state.getPath('game.lastRewardSummary') };
  }

  retry() {
    const quest = state.getPath('currentQuest');
    if (!quest) return false;
    events.emit(EVT.QUEST_RETRIED, { questId: quest.id });
    analyticsEngine.track(EVT.QUEST_RETRIED, { questId: quest.id });
    this.prepare(quest.id);
    this.start();
    return true;
  }

  isUnlocked(questId) {
    const quest = app.getQuest(questId);
    if (!quest) return false;
    if (quest.type === 'challenge' || quest.type === 'boss') {
      const priorQuests = app.getQuestsForZone(quest.zoneId).filter(q => q.type === 'learning' && q.order < quest.order);
      const allDone = priorQuests.every(q => state.getPath(`progress.${q.id}`, null)?.completedAt);
      if (!allDone) return false;
    }
    return progressionEngine.isWorldUnlocked(quest.worldId);
  }
}

export const questEngine = new QuestEngine();
export default questEngine;