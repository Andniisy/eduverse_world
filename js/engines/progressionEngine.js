import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';

const LEVELS = [
  { level: 1, xp: 0, title: 'Knowledge Rookie' },
  { level: 2, xp: 250, title: 'Curious Explorer' },
  { level: 3, xp: 600, title: 'Junior Explorer' },
  { level: 4, xp: 1050, title: 'Knowledge Seeker' },
  { level: 5, xp: 1600, title: 'Smart Explorer' },
  { level: 6, xp: 2250, title: 'Knowledge Builder' },
  { level: 7, xp: 3000, title: 'Master Explorer' },
  { level: 8, xp: 3850, title: 'Advanced Explorer' },
  { level: 9, xp: 4800, title: 'Knowledge Guardian' },
  { level: 10, xp: 5850, title: 'EDUVERSE Hero' }
];

const WORLD_UNLOCK_RULES = {
  LIT: { world: 'SCI', quests: 3, challenge: 1 },
  CUL: { world: 'MAT', quests: 3, challenge: 1 },
  DIG: { world: 'LIT', quests: 3, challenge: 1 }
};

class ProgressionEngine {
  levelInfo(xp) {
    let current = LEVELS[0];
    for (const l of LEVELS) { if (xp >= l.xp) current = l; else break; }
    const idx = LEVELS.indexOf(current);
    const next = LEVELS[idx + 1] || null;
    return {
      level: current.level,
      title: current.title,
      xp,
      xpForNext: next ? next.xp : current.xp,
      xpIntoLevel: xp - current.xp,
      xpToNext: next ? next.xp - xp : 0,
      progress: next ? (xp - current.xp) / (next.xp - current.xp) * 100 : 100
    };
  }

  recomputeLevel() {
    const user = state.getPath('user');
    if (!user) return;
    const prevLevel = user.level || 1;
    const info = this.levelInfo(user.xp || 0);
    if (info.level !== prevLevel) {
      state.setPath('user.level', info.level);
      events.emit(EVT.LEVEL_UP, { from: prevLevel, to: info.level, title: info.title });
    }
  }

  isWorldUnlocked(worldId) {
    const world = app.getWorld(worldId);
    if (!world) return false;
    if (world.status === 'available') return true;
    const rule = WORLD_UNLOCK_RULES[worldId];
    if (!rule) return false;
    return this._meetsUnlockRule(rule);
  }

  isZoneUnlocked(worldId, zoneOrder) {
    if (!this.isWorldUnlocked(worldId)) return false;
    if (zoneOrder === 1) return true;
    const zones = app.getZonesForWorld(worldId);
    const prev = zones.find(z => z.order === zoneOrder - 1);
    if (!prev) return false;
    return this._meetsUnlockRule({ zone: prev.id, quests: 3, challenge: 1 });
  }

  countZoneCompletions(zoneId) {
    const quests = app.getQuestsForZone(zoneId);
    let done = 0;
    quests.forEach(q => {
      const p = state.getPath(`progress.${q.id}`, null);
      if (p?.completedAt && q.type === 'learning') done++;
    });
    return done;
  }

  countZoneChallenges(zoneId) {
    const quests = app.getQuestsForZone(zoneId);
    let done = 0;
    quests.forEach(q => {
      if (q.type !== 'challenge') return;
      const p = state.getPath(`progress.${q.id}`, null);
      if (p?.completedAt) done++;
    });
    return done;
  }

  countWorldCompletions(worldId) {
    const zones = app.getZonesForWorld(worldId);
    let done = 0;
    zones.forEach(z => { done += this.countZoneCompletions(z.id); done += this.countZoneChallenges(z.id); });
    return done;
  }

  countWorldChallenges(worldId) {
    const zones = app.getZonesForWorld(worldId);
    return zones.reduce((sum, z) => sum + this.countZoneChallenges(z.id), 0);
  }

  checkWorldUnlocks() {
    app.getWorlds().forEach(w => {
      const unlocked = this.isWorldUnlocked(w.id);
      const list = state.getPath('user.worldsUnlocked', []);
      if (unlocked && !list.includes(w.id)) {
        const next = list.slice(); next.push(w.id);
        state.setPath('user.worldsUnlocked', next);
        events.emit(EVT.WORLD_UNLOCKED, { worldId: w.id, world: w });
      }
    });
  }

  recomputeWorlds() {
    const unlocked = app.getWorlds().filter(w => this.isWorldUnlocked(w.id)).map(w => w.id);
    state.setPath('user.worldsUnlocked', unlocked);
  }

  updateStreak() {
    const user = state.getPath('user');
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = user.streak?.lastDate;
    if (!last) { state.setPath('user.streak', { current: 1, longest: 1, lastDate: today }); return; }
    if (last === today) return;
    const diff = Math.round((new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      const current = (user.streak.current || 0) + 1;
      const longest = Math.max(current, user.streak.longest || 0);
      state.setPath('user.streak', { current, longest, lastDate: today });
    } else if (diff > 1) {
      state.setPath('user.streak', { current: 1, longest: user.streak.longest || 1, lastDate: today });
    }
    events.emit(EVT.STREAK_UPDATED, state.getPath('user.streak'));
  }

  _meetsUnlockRule(rule) {
    if (rule.zone) {
      return this.countZoneCompletions(rule.zone) >= (rule.quests || 0)
          && this.countZoneChallenges(rule.zone) >= (rule.challenge || 0);
    }
    if (rule.world) {
      return this.countWorldCompletions(rule.world) >= (rule.quests || 0)
          && this.countWorldChallenges(rule.world) >= (rule.challenge || 0);
    }
    return false;
  }
}

export const progressionEngine = new ProgressionEngine();
export default progressionEngine;