import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';

class MasteryEngine {
  recordAnswer({ conceptIds = [], correct = false, hintsUsed = 0, questionId = null }) {
    if (!conceptIds.length) return;
    conceptIds.forEach(cid => {
      const current = state.getPath(`mastery.${cid}`, {
        conceptId: cid, score: 0, interactions: 0, correct: 0, wrong: 0, hints: 0, updatedAt: null
      });
      current.interactions += 1;
      if (correct) current.correct += 1; else current.wrong += 1;
      current.hints += hintsUsed;

      let target = correct ? 100 : 0;
      target -= hintsUsed * 15;
      target = Math.max(0, target);

      const alpha = current.interactions <= 5 ? 0.35 : 0.15;
      current.score = current.score * (1 - alpha) + target * alpha;
      current.updatedAt = new Date().toISOString();

      state.setPath(`mastery.${cid}`, current);
    });
    events.emit(EVT.MASTERY_UPDATED, { conceptIds, correct, hintsUsed, questionId });
  }

  get(conceptId) {
    const m = state.getPath(`mastery.${conceptId}`);
    return m || { conceptId, score: 0, interactions: 0, correct: 0, wrong: 0, hints: 0, updatedAt: null };
  }

  level(conceptId) {
    const score = this.get(conceptId).score;
    if (score >= 90) return 'mastered';
    if (score >= 75) return 'proficient';
    if (score >= 50) return 'developing';
    return 'discovering';
  }

  label(conceptId) {
    const map = { mastered: '🔥 Mastered', proficient: '⭐ Proficient', developing: '🌿 Developing', discovering: '🌱 Discovering' };
    return map[this.level(conceptId)];
  }

  aggregate(conceptIds = []) {
    if (!conceptIds.length) return { score: 0, level: 'discovering', count: 0 };
    const scores = conceptIds.map(cid => this.get(cid).score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { score: avg, level: this._levelForScore(avg), count: conceptIds.length };
  }

  weakest(limit = 5) {
    const all = state.getPath('mastery', {});
    return Object.values(all).filter(m => m.interactions >= 2).sort((a, b) => a.score - b.score).slice(0, limit)
      .map(m => ({ ...m, conceptName: app.getConcepts().find(c => c.id === m.conceptId)?.name || m.conceptId }));
  }

  strongest(limit = 5) {
    const all = state.getPath('mastery', {});
    return Object.values(all).filter(m => m.interactions >= 3).sort((a, b) => b.score - a.score).slice(0, limit);
  }

  worldMastery(worldId) {
    const conceptIds = app.getConcepts().filter(c => c.worldId === worldId).map(c => c.id);
    return this.aggregate(conceptIds);
  }

  zoneMastery(zoneId) {
    const conceptIds = app.getConcepts().filter(c => c.zoneId === zoneId).map(c => c.id);
    return this.aggregate(conceptIds);
  }

  _levelForScore(score) {
    if (score >= 90) return 'mastered';
    if (score >= 75) return 'proficient';
    if (score >= 50) return 'developing';
    return 'discovering';
  }
}

export const masteryEngine = new MasteryEngine();
export default masteryEngine;