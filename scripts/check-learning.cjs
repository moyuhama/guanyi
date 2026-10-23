const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Learn=require('../learning.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/book-data.js'),'utf8'),context);
const book=context.window.YIJING_DATA;
// Independently check the mnemonic against the bottom-to-top source figures.
const expected={乾:'111',坤:'000',离:'101',坎:'010',震:'100',艮:'001',兑:'110',巽:'011'};
for(const card of Learn.cards){
  const t=book.trigrams.find(t=>t.name===card.name);
  assert.equal(t.bits.join(''),expected[t.name]);
  const c=book.chapters.find(c=>c.id===t.id);
  assert.equal(c.bits.join(''),expected[t.name].repeat(2));
  for(let i=0;i<3;i++){
    const changed=Learn.flip([...t.bits],i);
    assert.ok(book.trigrams.some(n=>n.bits.join('')===changed.join('')));
    assert.deepEqual(Learn.flip(changed,i),[...t.bits]);
  }
}
assert.throws(()=>Learn.flip([1,1,1],3));
assert.deepEqual(Learn.normalize(undefined),Learn.blank());
assert.deepEqual(Learn.normalize({selected:'bad',pool:'bad',seen:['乾','乾','bad'],known:{乾:{mastered:'yes'},坏:{mastered:true}}}),{...Learn.blank(),seen:['乾']});
// Each four-card round must cover the four introductory figures exactly once.
const initial=Learn.blank(),round=[];let card='乾';
for(let i=0;i<4;i++){round.push(card);card=Learn.nextCard(initial,card);}
assert.deepEqual(round,Learn.firstFour);assert.equal(card,'乾');
assert.deepEqual(Learn.deck({...initial,pool:'review'}),[]);
const old={...initial,pool:'review',card:'乾',seen:['乾'],known:{乾:{mastered:false,updated:10},坤:{mastered:true,updated:12}},updated:12};
const newer={...initial,pool:'all',card:'离',seen:['离'],known:{乾:{mastered:true,updated:20},离:{mastered:false,updated:20}},updated:20};
const merged=Learn.merge(old,newer);
assert.deepEqual(Learn.deck(merged,'review'),['离']);
assert.equal(merged.known.坤.mastered,true);assert.equal(merged.known.乾.mastered,true);
assert.deepEqual(merged.seen,['乾','离']);assert.equal(merged.card,'离');
assert.deepEqual(Learn.merge(merged,old),merged);
assert.deepEqual(Learn.merge(merged,undefined),merged);
assert.deepEqual(Learn.normalize(JSON.parse(JSON.stringify(merged))),merged);
assert.equal(Learn.nextCard({...merged,pool:'review'},'离'),'离');
assert.equal(Learn.nextCard({...merged,pool:'review',known:{离:{mastered:true,updated:30}}},'离'),null);
console.log('PASS: mnemonic/source figures, all 24 flips, pure-hexagram links, four-card coverage, review filtering, refresh data and non-destructive backup merge.');
