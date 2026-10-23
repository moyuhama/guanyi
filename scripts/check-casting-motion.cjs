const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const bookContext={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/book-data.js'),'utf8'),bookContext);
const pending=new Map(),panel={outerHTML:''},methods=[{},{}];
let clock=0,reduced=false,focusCount=0;
const document={body:{},querySelector:selector=>selector==='.interp-cast'?panel:{focus(){focusCount++;}},querySelectorAll:()=>methods};
document.activeElement=document.body;
const context={module:{exports:{}},crypto:require('node:crypto').webcrypto,document,
  matchMedia:()=>({matches:reduced}),setTimeout:callback=>{pending.set(++clock,callback);return clock;},clearTimeout:id=>pending.delete(id)};
vm.runInNewContext(fs.readFileSync(require.resolve('../interpret.js'),'utf8'),context);
const I=context.module.exports;
let saved=I.blank();
const make=()=>I.create({book:bookContext.window.YIJING_DATA,escape:s=>String(s??''),getRecord:()=>saved,update:r=>{saved=I.normalize(r);return true;},refresh:()=>{},toast:message=>{throw Error(message);}});
let app=make();
const click=action=>app.handleClick({dataset:{interpret:action},hasAttribute:name=>name==='data-interpret'});
const tick=()=>{const [id,callback]=pending.entries().next().value;pending.delete(id);callback();};
const drain=()=>{let count=0;while(pending.size){assert.ok(count++<30);tick();}};

click('toss');
assert.equal(saved.draft.throws.length,1,'Persist the outcome before visual animation');
assert.match(panel.outerHTML,/is-tossing/);
assert.match(panel.outerHTML,/>0 \/ 6</);
assert.ok(methods.every(b=>b.disabled));
click('finish');click('undo');
assert.equal(saved.draft.throws.length,1,'Repeated clicks cannot draw or undo mid-flight');
tick();
assert.match(panel.outerHTML,/just-formed/);
assert.match(panel.outerHTML,/>1 \/ 6</);
drain();assert.ok(methods.every(b=>!b.disabled));
assert.equal(focusCount,1);

click('finish');assert.equal(saved.draft.throws.length,6);
tick();assert.match(panel.outerHTML,/>2 \/ 6</);
drain();assert.match(panel.outerHTML,/>6 \/ 6</);
assert.match(panel.outerHTML,/data-interpret="read"/);
click('toss');assert.equal(saved.draft.throws.length,6,'Cannot add a seventh line');

saved=I.blank();click('toss');
const persisted=JSON.stringify(saved),beforeLeave=panel.outerHTML;
app.stopMotion();assert.equal(pending.size,0);
assert.equal(panel.outerHTML,beforeLeave,'Leaving the page does not repaint it');
saved=I.normalize(JSON.parse(persisted));app=make();
const restored=app.render(['interpret']);
assert.match(restored,/>1 \/ 6</);assert.doesNotMatch(restored,/is-tossing/);

click('finish');
saved.draft.method='manual';
app.render(['interpret']);assert.equal(pending.size,0,'A different draft from another tab cancels obsolete animation');
saved=I.blank();reduced=true;
click('finish');assert.equal(saved.draft.throws.length,6);assert.equal(pending.size,0);
assert.doesNotMatch(panel.outerHTML,/is-tossing/);
assert.match(panel.outerHTML,/data-interpret="read"/);
console.log('PASS: single and sequential casting, duplicate-click lock, six-line limit, persisted mid-flight outcomes, navigation cancellation, cross-tab changes and reduced motion.');
