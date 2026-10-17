import { events, EVT } from '../core/events.js';

const WINDOW = 5;
const THRESHOLD_UP = 80;
const THRESHOLD_DOWN = 60;
const MIN_INTERACTIONS_BEFORE_ADAPT = 3;
const MAX_CONSECUTIVE_ERRORS_BEFORE_FLASH = 2;

class AdaptiveEngine {
  constructor() {
    this._history = [];
    this._currentDifficultyOffset = 0;
    this._lastFlashTrigger = null;
  }

  recordInteraction({ correct, difficulty = 2, hintUsed = 0, conceptIds = [], misconceptionId = null }) {
    this._history.push({ correct, difficulty, hintUsed, conceptIds, misconceptionId, ts: Date.now() });
    if (this._history.length > 50) this._history.shift();
    const streak = this._consecutiveErrors();
    if (streak >= MAX_CONSECUTIVE_ERRORS_BEFORE_FLASH) this._triggerKnowledgeFlash(conceptIds, misconceptionId);
  }

  difficultyOffset() {
    if (this._history.length < MIN_INTERACTIONS_BEFORE_ADAPT) return 0;
    const recent = this._history.slice(-WINDOW);
    const accuracy = recent.filter(h => h.correct).length / recent.length * 100;
    if (accuracy >= THRESHOLD_UP) return 1;
    if (accuracy < THRESHOLD_DOWN) return -1;
    return 0;
  }

  performanceBand() {
    if (!this._history.length) return 'learning';
    const recent = this._history.slice(-WINDOW);
    const accuracy = recent.filter(h => h.correct).length / recent.length * 100;
    if (accuracy >= 95) return 'mastery';
    if (accuracy >= 80) return 'great';
    if (accuracy >= 60) return 'good';
    if (accuracy >= 40) return 'exploring';
    return 'learning';
  }

  shouldOfferHint() {
    const recent = this._history.slice(-WINDOW);
    if (recent.length < MIN_INTERACTIONS_BEFORE_ADAPT) return false;
    const accuracy = recent.filter(h => h.correct).length / recent.length * 100;
    return accuracy < THRESHOLD_DOWN;
  }

  shouldSimplify() { return this.difficultyOffset() === -1 && this._history.length >= WINDOW; }

  reset() { this._history = []; this._currentDifficultyOffset = 0; this._lastFlashTrigger = null; }

  snapshot() {
    const recent = this._history.slice(-WINDOW);
    const accuracy = recent.length ? recent.filter(h => h.correct).length / recent.length * 100 : 0;
    return {
      windowSize: recent.length,
      accuracy: Math.round(accuracy),
      offset: this.difficultyOffset(),
      band: this.performanceBand(),
      consecutiveErrors: this._consecutiveErrors()
    };
  }

  _consecutiveErrors() {
    let n = 0;
    for (let i = this._history.length - 1; i >= 0; i--) {
      if (this._history[i].correct) break;
      n++;
    }
    return n;
  }

  _triggerKnowledgeFlash(conceptIds, misconceptionId) {
    const key = `${conceptIds.join('|')}::${misconceptionId || ''}`;
    const now = Date.now();
    if (this._lastFlashTrigger?.key === key && now - this._lastFlashTrigger.ts < 60000) return;
    this._lastFlashTrigger = { key, ts: now };
    events.emit(EVT.KNOWLEDGE_FLASH_SHOWN, { conceptIds, misconceptionId, reason: 'consecutive_errors' });
  }
}

export const adaptiveEngine = new AdaptiveEngine();
export default adaptiveEngine;