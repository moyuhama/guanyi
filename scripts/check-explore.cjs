const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Explore = require('../explore.js');
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/book-data.js'),'utf8'),sandbox);
const book = sandbox.window.YIJING_DATA;

// Every possible six-line figure and each of its six neighbors must resolve.
const found = new Set();
for (let n=0;n<64;n++) {
  const bits=Array.from({length:6},(_,i)=>(n>>i)&1);
  const c=Explore.chapterFor(book,bits);
  assert.ok(c,`Missing figure ${bits}`);found.add(c.id);
  for(let i=0;i<6;i++) {
    const next=Explore.flip(bits,i);
    assert.ok(Explore.chapterFor(book,next));
    assert.deepEqual(Explore.flip(next,i),bits);
    assert.notDeepEqual(next,bits);
  }
}
assert.equal(found.size,64);
assert.equal(Explore.chapterFor(book,Explore.flip([0,0,0,0,0,0],0)).id,24);
assert.equal(Explore.chapterFor(book,[1,1,1,0,0,0]).id,11);
assert.equal(Explore.chapterFor(book,[0,0,0,1,1,1]).id,12);
for(const l of Explore.lessons) {
  const c=book.chapters.find(c=>c.id===l.chapter),s=c.sections[l.section];
  assert.ok(s.blocks.find(b=>b.type==='original')?.text);
  assert.ok(s.blocks.find(b=>b.type==='translation')?.text);
  assert.ok(s.page>=1&&s.page<=212);
  assert.equal(Explore.ready(l,{seen:l.required}),true);
  assert.equal(Explore.ready(l,{seen:[]}),false);
}

// Old backups, malformed imports, mid-journey resume, and non-destructive merge.
assert.deepEqual(Explore.normalize(undefined),{});
assert.deepEqual(Explore.merge({begin:{...Explore.blank(),choice:1}},undefined).begin.choice,1);
assert.equal(Explore.normalize({begin:{step:3,completed:true,seen:[]}}).begin.step,0);
assert.equal(Explore.normalize({begin:{step:2,choice:0,seen:[0,'4',5,99]}}).begin.step,1);
const completed={begin:{step:3,choice:1,seen:[0,4,5],completed:true,reflection:'我的第一次感悟',updated:100}};
const resumed={begin:{step:2,choice:2,seen:[0],reflection:'后来改写的感悟',updated:200}};
const merged=Explore.merge(completed,resumed);
assert.equal(merged.begin.completed,true);
assert.equal(merged.begin.reflection,'后来改写的感悟');
assert.equal(merged.begin.choice,2);
assert.equal(merged.begin.step,1); // Input had not unlocked step 2; normalizing keeps the real reached step.
assert.equal(Explore.ready(Explore.lessons[0],merged.begin),true);
assert.deepEqual(Explore.merge(merged,completed),merged);
assert.equal(Explore.merge(completed,{begin:{...Explore.blank(),updated:300}}).begin.completed,true);
assert.deepEqual(Explore.normalize(JSON.parse(JSON.stringify(completed))),completed);
assert.equal(Explore.normalize({begin:{reflection:'字'.repeat(3000)}}).begin.reflection.length,2000);
assert.throws(()=>Explore.flip([1,1,1,1,1,1],6));
console.log('PASS: all 64 figures / 384 flips, source references, learning gates, reload state, old backups and journal merge.');
