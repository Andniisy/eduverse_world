import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';

const MAX_EVENTS = 2000;

class AnalyticsEngine {
  constructor() {
    this._sessionId = this._makeSessionId();
    this._bindAutoTrackers();
  }

  track(type, payload = {}) {
    const user = state.getPath('user');
    const event = {
      id: `EVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      sessionId: this._sessionId,
      studentId: user?.name || 'anonymous',
      timestamp: new Date().toISOString(),
      payload: this._sanitize(payload)
    };
    const current = state.getPath('analytics.events', []);
    current.push(event);
    const trimmed = current.length > MAX_EVENTS ? current.slice(current.length - MAX_EVENTS) : current;
    state.setPath('analytics.events', trimmed);
    events.emit(EVT.ANALYTICS_EVENT, event);
    return event;
  }

  getEvents(filter = {}) {
    let list = state.getPath('analytics.events', []);
    if (filter.type) list = list.filter(e => e.type === filter.type);
    if (filter.studentId) list = list.filter(e => e.studentId === filter.studentId);
    if (filter.since) list = list.filter(e => e.timestamp >= filter.since);
    if (filter.questId) list = list.filter(e => e.payload?.questId === filter.questId);
    return list;
  }

  countBy(type) { return this.getEvents({ type }).length; }

  questionAnalytics() {
    const answers = this.getEvents({ type: EVT.QUESTION_ANSWERED });
    const hints = this.getEvents({ type: EVT.HINT_USED });
    const map = new Map();
    answers.forEach(e => {
      const qid = e.payload?.questionId;
      if (!qid) return;
      if (!map.has(qid)) map.set(qid, { questionId: qid, correct: 0, incorrect: 0, hints: 0, total: 0 });
      const row = map.get(qid);
      row.total++;
      if (e.payload.correct) row.correct++; else row.incorrect++;
    });
    hints.forEach(e => {
      const qid = e.payload?.questionId;
      if (!qid || !map.has(qid)) return;
      map.get(qid).hints++;
    });
    return Array.from(map.values());
  }

  hintAnalytics() {
    const hints = this.getEvents({ type: EVT.HINT_USED });
    const map = new Map();
    hints.forEach(e => {
      const concepts = e.payload?.conceptIds || [];
      concepts.forEach(cid => map.set(cid, (map.get(cid) || 0) + 1));
    });
    return Array.from(map.entries()).map(([conceptId, count]) => ({ conceptId, count })).sort((a, b) => b.count - a.count);
  }

  misconceptionAnalytics() {
    const list = this.getEvents({ type: EVT.MISCONCEPTION_DETECTED });
    const map = new Map();
    list.forEach(e => {
      const mid = e.payload?.misconceptionId;
      if (!mid) return;
      if (!map.has(mid)) map.set(mid, { misconceptionId: mid, students: new Set(), frequency: 0 });
      map.get(mid).students.add(e.studentId);
      map.get(mid).frequency++;
    });
    return Array.from(map.values()).map(r => ({
      misconceptionId: r.misconceptionId,
      studentsAffected: r.students.size,
      frequency: r.frequency
    })).sort((a, b) => b.frequency - a.frequency);
  }

  weeklyTrend() {
    const all = state.getPath('analytics.events', []);
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, label: d.toLocaleDateString('en-US', { weekday: 'short' }), questsStarted: 0, questsCompleted: 0, answers: 0, hints: 0 });
    }
    const index = Object.fromEntries(days.map(d => [d.date, d]));
    all.forEach(e => {
      const day = e.timestamp.slice(0, 10);
      const row = index[day];
      if (!row) return;
      if (e.type === EVT.QUEST_STARTED) row.questsStarted++;
      if (e.type === EVT.QUEST_COMPLETED) row.questsCompleted++;
      if (e.type === EVT.QUESTION_ANSWERED) row.answers++;
      if (e.type === EVT.HINT_USED) row.hints++;
    });
    return days;
  }

  classHeatmap() {
    const mastery = state.getPath('mastery', {});
    const result = [];
    Object.entries(mastery).forEach(([conceptId, m]) => {
      result.push({ conceptId, score: Math.round(m.score || 0), level: this._masteryLevel(m.score || 0) });
    });
    return result;
  }

  optionDistribution(questionId) {
    const answers = this.getEvents({ type: EVT.QUESTION_ANSWERED }).filter(e => e.payload?.questionId === questionId);
    const dist = {};
    answers.forEach(e => {
      const ans = e.payload?.answer;
      const key = Array.isArray(ans) ? ans.join(',') : String(ans);
      dist[key] = (dist[key] || 0) + 1;
    });
    return dist;
  }

  clear() { state.setPath('analytics.events', []); }

  _makeSessionId() { return `S-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }

  _masteryLevel(score) {
    if (score >= 90) return 'mastered';
    if (score >= 75) return 'proficient';
    if (score >= 50) return 'developing';
    return 'discovering';
  }

  _sanitize(payload) { try { return JSON.parse(JSON.stringify(payload)); } catch { return {}; } }

  _bindAutoTrackers() {
    events.on(EVT.LEVEL_UP, (p) => this.track(EVT.LEVEL_UP, p));
    events.on(EVT.WORLD_UNLOCKED, (p) => this.track(EVT.WORLD_UNLOCKED, p));
    events.on(EVT.CRYSTAL_EARNED, (p) => this.track(EVT.CRYSTAL_EARNED, p));
  }
}

export const analyticsEngine = new AnalyticsEngine();
export default analyticsEngine;