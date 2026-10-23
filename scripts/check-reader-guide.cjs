const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Guide=require('../reader-guide.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/book-data.js'),'utf8'),sandbox);
const book=sandbox.window.YIJING_DATA;

// Check all 384 links against the real book, including six-line orientation.
for(const c of book.chapters) {
  const lower=book.trigrams.find(t=>t.name===c.lower),upper=book.trigrams.find(t=>t.name===c.upper);
  assert.equal(c.bits.slice(0,3).join(''),lower.bits.join(''));
  assert.equal(c.bits.slice(3).join(''),upper.bits.join(''));
  const targets=[];
  for(let i=0;i<6;i++) {
    const index=Guide.sectionForLine(c,i),name=Guide.lineName(c.bits,i);
    assert.ok(index>=0,`${c.name} ${name} has no source section`);
    targets.push(index);
    assert.equal(c.sections[index].title,name);
    assert.equal(Guide.lineIndex(name),i);
    const context=Guide.describe(book,c,index);
    assert.equal(context.line,i);
    assert.ok(context.title.includes(c.bits[i]?'阳爻':'阴爻'));
    assert.ok(context.detail.includes(i<3?'下卦':'上卦'));
    assert.ok(context.detail.includes(`第 ${i+1} 条`));
    assert.ok(c.sections[index].page>=c.page&&c.sections[index].page<=c.endPage);
  }
  assert.equal(new Set(targets).size,6);
  assert.equal(Guide.describe(book,c,0).line,null);
}
const qian=book.chapters[0],kun=book.chapters[1];
assert.equal(Guide.lineIndex('初九曰'),0);
assert.equal(Guide.lineIndex('文言 · 六二'),1);
assert.equal(Guide.lineIndex('九四'),3);
assert.equal(Guide.lineIndex('上六'),5);
for(const title of ['卦辞','彖传','象传','小象传','文言 · 阳气','用九','用六'])assert.equal(Guide.lineIndex(title),null);
assert.equal(Guide.sectionForLine(qian,3),4); // Use the primary 九四, not the later 文言 paragraph.
assert.equal(Guide.describe(book,qian,15).line,3); // Later discussion still highlights 九四.
assert.equal(Guide.describe(book,kun,12).line,1);
assert.equal(Guide.describe(book,qian,7).whole,true);
assert.equal(Guide.describe(book,kun,9).whole,true);
assert.ok(Guide.describe(book,qian,7).detail.includes('不是第七爻'));
console.log('PASS: 64 hexagrams, 384 exact source links, yin/yang and upper/lower mapping, repeated line commentary, and 用九/用六.');
