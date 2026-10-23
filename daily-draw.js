'use strict';
// Pure record helpers are shared by the page and the persistence checks.
((root) => {
  const LIMIT = 180;
  function dayKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function validDay(day) {
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    const date = new Date(`${day}T12:00:00`);
    return !Number.isNaN(date.getTime()) && dayKey(date) === day;
  }
  function normalize(records) {
    if (!Array.isArray(records)) return [];
    const unique = new Map();
    for (const entry of records) {
      if (!entry || typeof entry.id !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(entry.id) ||
          !validDay(entry.day) || !Number.isInteger(entry.chapterId) || entry.chapterId < 1 || entry.chapterId > 64 ||
          !Number.isSafeInteger(entry.createdAt) || entry.createdAt < 0 || entry.createdAt > 8640000000000000) continue;
      unique.set(entry.id, {id:entry.id, day:entry.day, chapterId:entry.chapterId, createdAt:entry.createdAt});
    }
    return [...unique.values()].sort((a,b)=>b.createdAt-a.createdAt || b.id.localeCompare(a.id)).slice(0,LIMIT);
  }
  function merge(...groups) { return normalize(groups.flat()); }
  function today(records, date = new Date()) { return normalize(records).find(entry=>entry.day===dayKey(date)) || null; }
  function draw(date = new Date(), cryptoSource = root.crypto) {
    const words = new Uint32Array(3);
    cryptoSource.getRandomValues(words);
    // 2^32 is divisible by 64, so every hexagram has the same probability.
    return {id:`${date.getTime()}-${words[1].toString(16)}-${words[2].toString(16)}`,day:dayKey(date),chapterId:words[0]%64+1,createdAt:date.getTime()};
  }
  const api = {LIMIT,dayKey,normalize,merge,today,draw};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YIJING_DRAW = api;
})(typeof window !== 'undefined' ? window : globalThis);
