import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';

class CardEngine {
  isOwned(cardId) { return (state.getPath('inventory.cards', []) || []).includes(cardId); }

  getCard(cardId) {
    const base = app.getCard(cardId);
    if (!base) return null;
    const owned = this.isOwned(cardId);
    const mastery = state.getPath(`inventory.cardMastery.${cardId}`, 'discovered');
    return { ...base, owned, mastery };
  }

  list(filter = {}) {
    let list = app.getCards().map(c => this.getCard(c.cardId));
    if (filter.world) list = list.filter(c => c.world === filter.world);
    if (filter.category) list = list.filter(c => c.category === filter.category);
    if (filter.owned === true) list = list.filter(c => c.owned);
    if (filter.owned === false) list = list.filter(c => !c.owned);
    if (filter.rarity) list = list.filter(c => c.rarity === filter.rarity);
    return list;
  }

  view(cardId) {
    if (!this.isOwned(cardId)) return;
    const current = state.getPath(`inventory.cardViews.${cardId}`, 0);
    state.setPath(`inventory.cardViews.${cardId}`, current + 1);
    events.emit(EVT.CARD_VIEWED, { cardId });
  }

  setMastery(cardId, level) {
    const valid = ['discovered', 'understood', 'practiced', 'mastered'];
    if (!valid.includes(level)) return;
    state.setPath(`inventory.cardMastery.${cardId}`, level);
  }

  syncFromMastery(conceptId) {
    const conceptMastery = state.getPath(`mastery.${conceptId}`);
    if (!conceptMastery) return;
    const ownedCards = app.getCards().filter(c => this.isOwned(c.cardId));
    ownedCards.forEach(card => {
      const score = conceptMastery.score || 0;
      let level = 'discovered';
      if (score >= 90) level = 'mastered';
      else if (score >= 75) level = 'practiced';
      else if (score >= 50) level = 'understood';
      const prev = state.getPath(`inventory.cardMastery.${card.cardId}`, 'discovered');
      if (prev !== level && this._levelOrder(level) > this._levelOrder(prev)) {
        this.setMastery(card.cardId, level);
      }
    });
  }

  summary() {
    const all = app.getCards();
    const owned = all.filter(c => this.isOwned(c.cardId));
    const byRarity = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    owned.forEach(c => byRarity[c.rarity] = (byRarity[c.rarity] || 0) + 1);
    return {
      total: all.length,
      owned: owned.length,
      completion: all.length ? (owned.length / all.length) * 100 : 0,
      byRarity
    };
  }

  _levelOrder(l) { return { discovered: 0, understood: 1, practiced: 2, mastered: 3 }[l] ?? -1; }
}

export const cardEngine = new CardEngine();
export default cardEngine;