import { app } from '../core/app.js';
import { masteryEngine } from './masteryEngine.js';

class FeedbackEngine {
  build(question, answer, correct, context = {}) {
    if (correct) return this._correct(question, context);
    if (context.consecutiveErrors >= 2 && question.misconceptionTarget) return this._misconception(question, context);
    return this._incorrect(question, context);
  }

  buildMastery(conceptIds = []) {
    if (!conceptIds.length) return { type: 'mastery', message: 'Keep exploring! Every answer helps you learn more.', conceptScores: [] };
    const scores = conceptIds.map(cid => ({
      conceptId: cid,
      name: app.getConcepts().find(c => c.id === cid)?.name || cid,
      score: masteryEngine.get(cid).score,
      level: masteryEngine.level(cid)
    }));
    const avg = scores.reduce((a, b) => a + b.score, 0) / scores.length;
    let message;
    if (avg >= 90) message = "Outstanding! You've mastered these concepts.";
    else if (avg >= 75) message = 'Great work! Your understanding is strong.';
    else if (avg >= 50) message = "You're making good progress. Let's keep building.";
    else message = "You're on your way — practice makes progress!";
    return { type: 'mastery', message, averageScore: Math.round(avg), conceptScores: scores };
  }

  _correct(question, context) {
    const base = app.getFeedbackById(question.feedbackId);
    let message = base?.message || 'Correct! Well done.';
    if (context.hintsUsed > 0) message = "Nice! You used a hint and found the answer. " + message;
    return { type: 'correct', message, explanation: question.explanation, sourceIds: question.sourceIds || [] };
  }

  _incorrect(question, context) {
    const base = app.getFeedbackById(question.feedbackId);
    return {
      type: 'incorrect',
      message: base?.message || "Good try! Think about the clue and try again.",
      explanation: question.explanation,
      sourceIds: question.sourceIds || []
    };
  }

  _misconception(question, context) {
    const m = question.misconceptionTarget ? app.getMisconception(question.misconceptionTarget) : null;
    const targeted = app.getFeedback().find(f => f.misconceptionId === question.misconceptionTarget);
    const message = targeted?.message || m?.correctiveConcept || "Let's look at the clue again. You're close!";
    return {
      type: 'misconception',
      message,
      explanation: question.explanation,
      misconceptionId: question.misconceptionTarget || null,
      correctiveConcept: m?.correctiveConcept || null,
      supportStrategy: m?.supportStrategy || null,
      sourceIds: question.sourceIds || []
    };
  }
}

export const feedbackEngine = new FeedbackEngine();
export default feedbackEngine;