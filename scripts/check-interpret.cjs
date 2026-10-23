const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const I=require('../interpret.js'),Guide=require('../reader-guide.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/book-data.js'),'utf8'),sandbox);
const book=sandbox.window.YIJING_DATA;
let cases=0;
// Every original hexagram and every moving-line subset: 64 × 64 cases.
for(const c of book.chapters)for(let mask=0;mask<64;mask++){
  const moving=Array.from({length:6},(_,i)=>i).filter(i=>mask&(1<<i));
  const lines=I.manualLines(c,moving),p=I.readingPlan(book,lines);
  assert.equal(p.base.id,c.id);
  for(let i=0;i<6;i++)assert.equal(p.target.bits[i],c.bits[i]^(moving.includes(i)?1:0));
  assert.equal(p.moving.join(','),moving.join(','));
  for(const ref of p.refs){
    const target=book.chapters.find(c=>c.id===ref.chapterId);
    assert.equal(target.sections[ref.section].title,ref.title);
    assert.ok(target.sections[ref.section].blocks.some(b=>b.type==='original'));
    assert.ok(target.sections[ref.section].blocks.some(b=>b.type==='translation'));
  }
  const n=moving.length,staticLines=[0,1,2,3,4,5].filter(i=>!moving.includes(i));
  const sectionFor=(chapter,i)=>Guide.sectionForLine(chapter,i);
  if(n===0){assert.equal(p.refs.length,1);assert.equal(p.refs[0].chapterId,c.id);assert.equal(p.refs[0].section,0);}
  if(n===1||n===2){assert.equal(p.refs.length,n);assert.equal(p.refs[0].chapterId,c.id);assert.equal(p.refs[0].section,sectionFor(c,moving[n-1]));}
  if(n===3){assert.equal(p.refs.map(r=>r.chapterId).join(','),[c.id,p.target.id].join(','));assert.ok(p.refs.every(r=>r.section===0));}
  if(n===4||n===5){assert.equal(p.refs.length,6-n);assert.ok(p.refs.every(r=>r.chapterId===p.target.id));assert.equal(p.refs[0].section,sectionFor(p.target,staticLines[0]));}
  if(n===6){assert.equal(p.refs.length,1);if(c.id<=2){assert.equal(p.refs[0].title,c.id===1?'用九':'用六');assert.equal(p.refs[0].chapterId,c.id);}else{assert.equal(p.refs[0].chapterId,p.target.id);assert.equal(p.refs[0].section,0);}}
  cases++;
}
// Independent known examples guard orientation and special selections.
let p=I.readingPlan(book,[7,7,7,8,9,8]);
assert.equal(p.base.id,5);assert.equal(p.target.id,11);assert.equal(p.refs[0].title,'九五');assert.equal(p.refs[0].section,7);
p=I.readingPlan(book,[6,8,8,8,8,8]);assert.equal(p.base.id,2);assert.equal(p.target.id,24);assert.equal(p.refs[0].title,'初六');
p=I.readingPlan(book,[7,7,7,7,7,9]);assert.equal(p.base.id,1);assert.equal(p.target.id,43);assert.equal(p.refs[0].title,'上九');
const distribution={6:0,7:0,8:0,9:0};
for(let mask=0;mask<8;mask++){let i=0;const toss=I.coinThrow(()=>mask>>i++&1);distribution[toss.reduce((a,b)=>a+b,0)]++;}
assert.deepEqual(distribution,{6:1,7:3,8:3,9:1});
assert.throws(()=>I.analyze(book,[6,7]));assert.equal(I.validLines([6,7,8,9,7,'8']),false);
const old={draft:{question:'旧问题',throws:[[2,2,2]],updated:10},records:[{id:'i-a',lines:[6,7,8,9,7,8],createdAt:1,updated:10,question:'问题',reflection:'旧感悟'}]};
const newer={draft:{question:'新问题',method:'manual',manualId:5,moving:[4],updated:20},records:[{id:'i-a',lines:[6,7,8,9,7,8],createdAt:1,updated:20,reflection:'新感悟'},{id:'i-b',lines:[9,9,9,9,9,9],createdAt:2,updated:2}]};
const merged=I.merge(old,newer);
assert.equal(merged.records.length,2);assert.equal(merged.records.find(r=>r.id==='i-a').reflection,'新感悟');assert.equal(merged.draft.question,'新问题');
assert.deepEqual(I.merge(merged,{}),merged);assert.deepEqual(I.normalize(JSON.parse(JSON.stringify(merged))),merged);
assert.deepEqual(I.normalize({draft:{throws:[[2,4,2]],moving:[-1,0,0,4,7]},records:[{id:'<script>',lines:[9,9,9,9,9,9],createdAt:1}]}).draft.moving,[0,4]);
assert.equal(I.normalize({records:[{id:'i-bad',lines:[9,9],createdAt:1}]}).records.length,0);
// Render the sample and malicious imported text without a browser dependency.
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const html=I.create({book,escape,getRecord:()=>({records:[{id:'i-x',lines:[7,7,7,8,9,8],createdAt:1,question:'<script>alert(1)</script>',reflection:'</textarea><script>x</script>'}]}),update:()=>true,refresh:()=>{},toast:()=>{}}).render(['interpret','record','i-x']);
assert.ok(html.includes('需卦九五'));assert.ok(html.includes('泰'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
console.log(`PASS: ${cases} casting combinations, all 0–6 moving-line rules and book references, coin distribution, draft persistence, backup merge and escaped content.`);
