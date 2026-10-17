import { state } from '../core/state.js';
import { events, EVT } from '../core/events.js';
import { app } from '../core/app.js';

const PET_XP_PER_QUEST = 25;
const PET_XP_PER_CARD = 10;
const PET_XP_PER_BOSS = 50;
const PET_XP_PER_CHALLENGE = 30;

const PET_LEVELS = [
  { level: 1, xp: 0, title: 'New Friend' },
  { level: 2, xp: 50, title: 'Playful' },
  { level: 3, xp: 150, title: 'Trusted' },
  { level: 4, xp: 350, title: 'Loyal' },
  { level: 5, xp: 600, title: 'Legendary Companion' }
];

class PetEngine {
  awardXP(petId, amount, reason = 'quest') {
    const current = state.getPath(`inventory.petXP.${petId}`, 0);
    const next = current + amount;
    state.setPath(`inventory.petXP.${petId}`, next);
    events.emit(EVT.PET_XP_GAINED, { petId, amount, total: next, reason });
  }

  awardAllXP(amount, reason = 'quest') {
    const owned = state.getPath('inventory.pets', []) || [];
    owned.forEach(pid => this.awardXP(pid, amount, reason));
  }

  awardForQuest(questType) {
    const amounts = { learning: PET_XP_PER_QUEST, challenge: PET_XP_PER_CHALLENGE, boss: PET_XP_PER_BOSS };
    this.awardAllXP(amounts[questType] || PET_XP_PER_QUEST, questType);
  }

  awardForCard() { this.awardAllXP(PET_XP_PER_CARD, 'card'); }

  getPet(petId) {
    const base = app.getPets().find(p => p.id === petId);
    if (!base) return null;
    const xp = state.getPath(`inventory.petXP.${petId}`, 0);
    const info = this._levelInfo(xp);
    return { ...base, xp, ...info };
  }

  getOwnedPets() {
    const owned = state.getPath('inventory.pets', []) || [];
    return owned.map(pid => this.getPet(pid)).filter(Boolean);
  }

  unlock(petId) {
    const owned = state.getPath('inventory.pets', []) || [];
    if (owned.includes(petId)) return;
    owned.push(petId);
    state.setPath('inventory.pets', owned);
  }

  _levelInfo(xp) {
    let cur = PET_LEVELS[0];
    for (const l of PET_LEVELS) { if (xp >= l.xp) cur = l; else break; }
    const idx = PET_LEVELS.indexOf(cur);
    const next = PET_LEVELS[idx + 1] || null;
    return {
      level: cur.level,
      title: cur.title,
      xpForNext: next ? next.xp : cur.xp,
      progress: next ? ((xp - cur.xp) / (next.xp - cur.xp)) * 100 : 100
    };
  }
}

export const petEngine = new PetEngine();
export default petEngine;