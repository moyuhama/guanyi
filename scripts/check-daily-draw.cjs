const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
const draw = require('../daily-draw.js');
const morning = new Date(2026,9,23,8,0,0);
const evening = new Date(2026,9,23,22,0,0);
const nextDay = new Date(2026,9,24,0,0,0);
const first = draw.draw(morning,webcrypto);
const second = draw.draw(evening,webcrypto);

assert.equal(draw.today([],morning),null);
assert.deepEqual(draw.normalize(undefined),[]); // Old backups have no draw records.
assert.equal(draw.today([first],evening).id,first.id);
assert.equal(draw.today([first,second],evening).id,second.id);
assert.equal(draw.today([first,second],nextDay),null); // New day opens a fresh draw.
assert.equal(draw.normalize([first,second]).length,2); // Earlier result stays in history.
assert.equal(draw.merge([first,second],[first]).length,2); // Backup merge is idempotent.
assert.deepEqual(draw.normalize(JSON.parse(JSON.stringify([first,second]))),draw.normalize([first,second]));
assert.equal(draw.normalize([{...first,day:'2026-02-30'},{...first,chapterId:65},null]).length,0);
assert.equal(draw.normalize([{...first,day:'2024-02-29'}]).length,1);
const entries=Array.from({length:200},(_,i)=>({...first,id:`record-id-${i}`,createdAt:morning.getTime()+i}));
assert.equal(draw.normalize(entries).length,180);
assert.equal(draw.normalize(entries)[0].id,'record-id-199');
assert.equal(draw.normalize(entries).at(-1).id,'record-id-20');
const results=Array.from({length:256},()=>draw.draw(morning,webcrypto));
assert.ok(results.every(entry=>entry.chapterId>=1&&entry.chapterId<=64));
assert.equal(new Set(results.map(entry=>entry.id)).size,256);
console.log('PASS: old backups, same-day retention, midnight reset, redraw history, merge, invalid input and retention limit.');
