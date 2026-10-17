import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';
import { questionEngine } from './questionEngine.js';
import { questEngine } from './questEngine.js';
import { feedbackEngine } from './feedbackEngine.js';
import { masteryEngine } from './masteryEngine.js';
import { adaptiveEngine } from './adaptiveEngine.js';
import { rewardEngine } from './rewardEngine.js';
import { analyticsEngine } from './analyticsEngine.js';

class GameEngine {
  startQuest(questId) {
    try {
      const quest = questEngine.prepare(questId);
      questEngine.start();
      return quest;
    } catch (e) {
      console.error('[GameEngine] Failed to start quest:', e);
      return null;
    }
  }

  submitAnswer(answer) {
    const question = questEngine.currentQuestion();
    const g = state.getPath('game');
    if (!question || !g) return null;

    const validation = questionEngine.validate(question, answer);
    const feedback = feedbackEngine.build(question, answer, validation.correct, {
      hintsUsed: g.hintsUsed || 0,
      consecutiveErrors: g.consecutiveErrors || 0
    });

    masteryEngine.recordAnswer({
      conceptIds: question.conceptIds || [],
      correct: validation.correct,
      hintsUsed: g.hintsUsed || 0,
      questionId: question.id
    });

    questEngine.recordAnswer(question, answer, validation, feedback);
    state.setPath('game.status', 'feedback');

    return {
      correct: validation.correct,
      feedback,
      question,
      gameState: state.getPath('game'),
      adaptive: adaptiveEngine.snapshot()
    };
  }

  useHint() {
    const question = questEngine.currentQuestion();
    if (!question) return null;
    const level = questEngine.useHint(question);
    const text = questionEngine.getHint(question, level);
    return { level, text };
  }

  continue() {
    const advanced = questEngine.next();
    if (!advanced) return { done: true };
    return { done: false, question: questEngine.currentQuestion() };
  }

  complete() {
    const result = questEngine.finish();
    if (result) {
      state.setPath('game.status', 'reward');
      const masteryFeedback = feedbackEngine.buildMastery(state.getPath('currentQuest')?.concepts || []);
      state.setPath('game.masteryFeedback', masteryFeedback);
      analyticsEngine.track('QUEST_REWARDED', {
        questId: result.quest.id,
        xp: result.rewardSummary?.xp || 0,
        coins: result.rewardSummary?.coins || 0
      });
    }
    return result;
  }

  retry() { return questEngine.retry(); }

  reset() {
    state.setPath('game', {
      status: 'idle', currentQuestionIndex: 0, score: 0, attempts: 0, hintsUsed: 0,
      correctAnswers: 0, wrongAnswers: 0, questions: [], answers: [], consecutiveErrors: 0
    });
    adaptiveEngine.reset();
  }

  grantMiniGameReward() {
    rewardEngine.grantXP(20, 'mini-game');
    rewardEngine.grantCoins(5, 'mini-game');
  }
}

export const gameEngine = new GameEngine();
export default gameEngine;