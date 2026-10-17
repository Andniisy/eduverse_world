class EventBus {
  constructor() {
    this._listeners = new Map();
    this._onceListeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    if (!this._onceListeners.has(event)) this._onceListeners.set(event, new Set());
    this._onceListeners.get(event).add(handler);
    return () => { const s = this._onceListeners.get(event); if (s) s.delete(handler); };
  }

  off(event, handler) {
    const s = this._listeners.get(event);
    if (s) s.delete(handler);
    const o = this._onceListeners.get(event);
    if (o) o.delete(handler);
  }

  emit(event, payload) {
    const listeners = this._listeners.get(event);
    if (listeners) listeners.forEach(h => { try { h(payload); } catch (e) { console.error(`[Events] Handler error on "${event}":`, e); } });
    const once = this._onceListeners.get(event);
    if (once) {
      const snap = Array.from(once);
      once.clear();
      snap.forEach(h => { try { h(payload); } catch (e) { console.error(`[Events] Once handler error:`, e); } });
    }
  }

  clear(event) {
    if (event) { this._listeners.delete(event); this._onceListeners.delete(event); }
    else { this._listeners.clear(); this._onceListeners.clear(); }
  }
}

export const events = new EventBus();

export const EVT = {
  APP_READY: 'app:ready',
  SCREEN_CHANGED: 'screen:changed',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  AVATAR_CREATED: 'user:avatarCreated',
  LEVEL_UP: 'user:levelUp',
  QUEST_STARTED: 'quest:started',
  QUEST_BRIEFING_READY: 'quest:briefingReady',
  QUEST_COMPLETED: 'quest:completed',
  QUEST_FAILED: 'quest:failed',
  QUEST_RETRIED: 'quest:retried',
  QUESTION_VIEWED: 'question:viewed',
  QUESTION_ANSWERED: 'question:answered',
  QUESTION_CORRECT: 'question:correct',
  QUESTION_INCORRECT: 'question:incorrect',
  HINT_USED: 'hint:used',
  KNOWLEDGE_FLASH_SHOWN: 'feedback:knowledgeFlash',
  MISCONCEPTION_DETECTED: 'feedback:misconceptionDetected',
  REWARD_GRANTED: 'reward:granted',
  CARD_UNLOCKED: 'card:unlocked',
  CARD_VIEWED: 'card:viewed',
  BADGE_EARNED: 'badge:earned',
  CRYSTAL_EARNED: 'crystal:earned',
  ACHIEVEMENT_EARNED: 'achievement:earned',
  PET_XP_GAINED: 'pet:xpGained',
  WORLD_UNLOCKED: 'world:unlocked',
  ZONE_UNLOCKED: 'zone:unlocked',
  MASTERY_UPDATED: 'mastery:updated',
  STREAK_UPDATED: 'streak:updated',
  BOSS_STARTED: 'boss:started',
  BOSS_COMPLETED: 'boss:completed',
  ANALYTICS_EVENT: 'analytics:event',
  TOAST: 'ui:toast',
  MODAL_OPEN: 'ui:modalOpen',
  MODAL_CLOSE: 'ui:modalClose'
};

export default events;