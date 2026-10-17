import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';

class RewardEngine {
  grant(rewardId, options = {}) {
    const reward = app.getReward(rewardId);
    if (!reward) { console.warn(`[RewardEngine] Unknown reward: ${rewardId}`); return null; }
    const user = state.getPath('user');
    if (!user) return null;

    const progress = state.getPath(`progress.${reward.id}`, null);
    const isReplay = !!progress?.completedAt;
    const xp = isReplay ? this._replayXP(progress.replayCount || 0) : reward.xp;
    const coins = isReplay ? 0 : reward.coins;

    state.setPath('user.xp', (user.xp || 0) + xp);
    state.setPath('user.coins', (user.coins || 0) + coins);

    const newCards = [];
    (reward.cards || []).forEach(cid => {
      const list = state.getPath('inventory.cards', []);
      if (!list.includes(cid)) {
        list.push(cid);
        state.setPath('inventory.cards', list);
        newCards.push(cid);
        events.emit(EVT.CARD_UNLOCKED, { cardId: cid });
      }
    });

    const newBadges = [];
    (reward.badges || []).forEach(bid => {
      const list = state.getPath('inventory.badges', []);
      if (!list.includes(bid)) {
        list.push(bid);
        state.setPath('inventory.badges', list);
        newBadges.push(bid);
        events.emit(EVT.BADGE_EARNED, { badgeId: bid });
      }
    });

    const newCrystals = [];
    (reward.crystals || []).forEach(cid => {
      const list = state.getPath('inventory.crystals', []);
      if (!list.includes(cid)) {
        list.push(cid);
        state.setPath('inventory.crystals', list);
        newCrystals.push(cid);
        events.emit(EVT.CRYSTAL_EARNED, { crystalId: cid });
      }
    });

    if (isReplay) {
      state.setPath(`progress.${reward.id}.replayCount`, (progress.replayCount || 0) + 1);
    }

    const summary = { rewardId, xp, coins, cards: newCards, badges: newBadges, crystals: newCrystals, isReplay };
    events.emit(EVT.REWARD_GRANTED, summary);
    return summary;
  }

  grantXP(amount, reason = 'bonus') {
    const user = state.getPath('user');
    if (!user) return;
    state.setPath('user.xp', (user.xp || 0) + amount);
    events.emit(EVT.REWARD_GRANTED, { xp: amount, coins: 0, reason });
  }

  grantCoins(amount, reason = 'bonus') {
    const user = state.getPath('user');
    if (!user) return;
    state.setPath('user.coins', (user.coins || 0) + amount);
    events.emit(EVT.REWARD_GRANTED, { xp: 0, coins: amount, reason });
  }

  isClaimed(rewardId) { return !!state.getPath(`progress.${rewardId}`, null)?.completedAt; }

  markClaimed(rewardId) {
    const existing = state.getPath(`progress.${rewardId}`, {}) || {};
    state.setPath(`progress.${rewardId}`, {
      ...existing,
      completedAt: existing.completedAt || new Date().toISOString(),
      replayCount: existing.replayCount || 0
    });
  }

  _replayXP(replayCount) {
    if (replayCount === 0) return 15;
    if (replayCount === 1) return 5;
    return 0;
  }
}

export const rewardEngine = new RewardEngine();
export default rewardEngine;