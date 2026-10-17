export function formatNumber(n) { return Number(n || 0).toLocaleString('en-US'); }
export function formatCoins(n) { return `🪙 ${formatNumber(n)}`; }
export function formatXP(n) { return `⭐ ${formatNumber(n)} XP`; }
export function formatPercent(n, digits = 0) { return `${Number(n || 0).toFixed(digits)}%`; }

export function masteryLabel(status) {
  const map = { discovering: '🌱 Discovering', developing: '🌿 Developing', proficient: '⭐ Proficient', mastered: '🔥 Mastered' };
  return map[status] || '🌱 Discovering';
}

export function performanceLabel(percent) {
  if (percent >= 95) return 'Mastery Achieved';
  if (percent >= 80) return 'Great Explorer';
  if (percent >= 60) return 'Good Progress';
  if (percent >= 40) return 'Keep Exploring';
  return "Let's Learn";
}

export function performanceTier(percent) {
  if (percent >= 95) return 'mastery';
  if (percent >= 80) return 'great';
  if (percent >= 60) return 'good';
  if (percent >= 40) return 'exploring';
  return 'learning';
}

export function formatDifficulty(level) {
  const n = Math.max(0, Math.min(5, Number(level) || 0));
  return '⭐'.repeat(n);
}

export function rarityIcon(rarity) {
  const map = { common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡' };
  return map[rarity] || '⚪';
}

export function rarityLabel(rarity) {
  const r = rarity || 'common';
  return r.charAt(0).toUpperCase() + r.slice(1);
}

export function worldAccent(worldId) {
  const map = {
    SCI: 'var(--science-green)', MAT: 'var(--math-blue)', LIT: 'var(--literacy-purple)',
    CUL: 'var(--culture-orange)', DIG: 'var(--digital-cyan)'
  };
  return map[worldId] || 'var(--cosmic-purple)';
}

export function relativeTime(isoString) {
  if (!isoString) return '—';
  const then = new Date(isoString).getTime();
  const diff = Math.max(0, Date.now() - then);
  const minute = 60 * 1000, hour = 60 * minute, day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}