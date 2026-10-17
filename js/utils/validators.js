export function validateDatabase(db) {
  const errors = [];
  const warnings = [];
  const { worlds = [], zones = [], concepts = [], sources = [], quests = [], questions = [], feedback = [], hints = [], misconceptions = [], rewards = [], cards = [], badges = [], pets = [], achievements = [] } = db;

  const ids = (arr, key = 'id') => new Set(arr.map(x => x[key] || x.id));
  const worldIds = new Set(worlds.map(w => w.id));
  const zoneIds = new Set(zones.map(z => z.id));
  const conceptIds = new Set(concepts.map(c => c.id));
  const sourceIds = new Set(sources.map(s => s.id));
  const questIds = new Set(quests.map(q => q.id));
  const questionIds = new Set(questions.map(q => q.id));
  const feedbackIds = new Set(feedback.map(f => f.id));
  const hintIds = new Set(hints.map(h => h.id));
  const misconceptionIds = new Set(misconceptions.map(m => m.id));
  const rewardIds = new Set(rewards.map(r => r.id));
  const cardIds = new Set(cards.map(c => c.cardId));
  const badgeIds = new Set(badges.map(b => b.id));
  const crystalIds = new Set(['CRYSTAL-SCI', 'CRYSTAL-MAT', 'CRYSTAL-LIT', 'CRYSTAL-CUL', 'CRYSTAL-DIG']);

  function checkDup(label, arr, field = 'id') {
    const seen = new Set();
    arr.forEach(item => {
      const id = item[field];
      if (id == null) { errors.push(`${label} has an item missing "${field}"`); return; }
      if (seen.has(id)) errors.push(`Duplicate ${field} "${id}" in ${label}`);
      seen.add(id);
    });
  }

  checkDup('worlds', worlds);
  checkDup('zones', zones);
  checkDup('concepts', concepts);
  checkDup('sources', sources);
  checkDup('quests', quests);
  checkDup('questions', questions);
  checkDup('feedback', feedback);
  checkDup('hints', hints);
  checkDup('misconceptions', misconceptions);
  checkDup('rewards', rewards);
  checkDup('knowledgeCards', cards, 'cardId');
  checkDup('badges', badges);
  checkDup('pets', pets);
  checkDup('achievements', achievements);

  zones.forEach(z => { if (!worldIds.has(z.worldId)) errors.push(`Zone "${z.id}" references missing world "${z.worldId}"`); });
  concepts.forEach(c => {
    if (c.worldId && !worldIds.has(c.worldId)) errors.push(`Concept "${c.id}" missing world "${c.worldId}"`);
    if (c.zoneId && !zoneIds.has(c.zoneId)) errors.push(`Concept "${c.id}" missing zone "${c.zoneId}"`);
    if (c.parentId && !conceptIds.has(c.parentId)) errors.push(`Concept "${c.id}" missing parent "${c.parentId}"`);
  });

  quests.forEach(q => {
    if (!zoneIds.has(q.zoneId)) errors.push(`Quest "${q.id}" missing zone "${q.zoneId}"`);
    if (!worldIds.has(q.worldId)) errors.push(`Quest "${q.id}" missing world "${q.worldId}"`);
    if (q.rewardId && !rewardIds.has(q.rewardId)) errors.push(`Quest "${q.id}" missing reward "${q.rewardId}"`);
    (q.concepts || []).forEach(cid => { if (!conceptIds.has(cid)) errors.push(`Quest "${q.id}" missing concept "${cid}"`); });
    (q.sourceIds || []).forEach(sid => { if (!sourceIds.has(sid)) errors.push(`Quest "${q.id}" missing source "${sid}"`); });
    if (!q.sourceIds || !q.sourceIds.length) errors.push(`Quest "${q.id}" has no sourceIds.`);
  });

  questions.forEach(q => {
    if (!questIds.has(q.questId)) errors.push(`Question "${q.id}" missing quest "${q.questId}"`);
    if (!worldIds.has(q.world)) errors.push(`Question "${q.id}" missing world "${q.world}"`);
    if (!zoneIds.has(q.zone)) errors.push(`Question "${q.id}" missing zone "${q.zone}"`);
    if (!q.sourceIds || !q.sourceIds.length) errors.push(`Question "${q.id}" has no sourceIds.`);
    else q.sourceIds.forEach(sid => { if (!sourceIds.has(sid)) errors.push(`Question "${q.id}" missing source "${sid}"`); });
    if (!q.conceptIds || !q.conceptIds.length) errors.push(`Question "${q.id}" has no conceptIds.`);
    else q.conceptIds.forEach(cid => { if (!conceptIds.has(cid)) errors.push(`Question "${q.id}" missing concept "${cid}"`); });
    if (!q.feedbackId || !feedbackIds.has(q.feedbackId)) errors.push(`Question "${q.id}" missing feedbackId "${q.feedbackId}"`);
    if (!q.hintId || !hintIds.has(q.hintId)) errors.push(`Question "${q.id}" missing hintId "${q.hintId}"`);
    if (q.misconceptionTarget && !misconceptionIds.has(q.misconceptionTarget)) errors.push(`Question "${q.id}" missing misconceptionTarget "${q.misconceptionTarget}"`);
  });

  rewards.forEach(r => {
    (r.cards || []).forEach(cid => { if (!cardIds.has(cid)) errors.push(`Reward "${r.id}" missing card "${cid}"`); });
    (r.badges || []).forEach(bid => { if (!badgeIds.has(bid)) errors.push(`Reward "${r.id}" missing badge "${bid}"`); });
    (r.crystals || []).forEach(cid => { if (!crystalIds.has(cid)) errors.push(`Reward "${r.id}" missing crystal "${cid}"`); });
  });

  feedback.forEach(f => {
    if (f.misconceptionId && !misconceptionIds.has(f.misconceptionId)) errors.push(`Feedback "${f.id}" missing misconception "${f.misconceptionId}"`);
  });

  hints.forEach(h => {
    if (h.questionId && !questionIds.has(h.questionId)) warnings.push(`Hint "${h.id}" references question "${h.questionId}" not in questions.json`);
  });

  const questById = new Map(quests.map(q => [q.id, q]));
  questions.forEach(q => {
    const quest = questById.get(q.questId);
    if (quest) {
      if (quest.zoneId !== q.zone) errors.push(`Question "${q.id}" zone "${q.zone}" != quest zone "${quest.zoneId}"`);
      if (quest.worldId !== q.world) errors.push(`Question "${q.id}" world "${q.world}" != quest world "${quest.worldId}"`);
    }
  });

  const hblQuests = ['SCI-HBL-Q01', 'SCI-HBL-Q02', 'SCI-HBL-Q03', 'SCI-HBL-CH01', 'SCI-HBL-B01'];
  hblQuests.forEach(qid => {
    const count = questions.filter(q => q.questId === qid).length;
    const expected = qid.includes('CH') ? 6 : qid.includes('B0') ? 8 : 10;
    if (count !== expected) errors.push(`Quest "${qid}" expected ${expected} interactions, found ${count}`);
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function isValidQuestTransition(from, to) {
  const allowed = {
    locked: ['available'], available: ['briefing'], briefing: ['playing'],
    playing: ['feedback', 'completed', 'failed'], feedback: ['playing', 'retry', 'completed'],
    retry: ['playing'], completed: ['reward'], reward: ['saved'], saved: [], failed: ['retry', 'available']
  };
  return (allowed[from] || []).includes(to);
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return { valid: false, reason: 'Name is required.' };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, reason: 'Name must be at least 2 characters.' };
  if (trimmed.length > 30) return { valid: false, reason: 'Name must be 30 characters or less.' };
  if (!/^[A-Za-zÀ-ÿ0-9 .'-]+$/.test(trimmed)) return { valid: false, reason: 'Name contains unsupported characters.' };
  return { valid: true, value: trimmed };
}