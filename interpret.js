'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.YIJING_INTERPRET=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const ranks=['初爻','二爻','三爻','四爻','五爻','上爻'];
  const values={6:{name:'老阴',bit:0,moving:true},7:{name:'少阳',bit:1,moving:false},8:{name:'少阴',bit:0,moving:false},9:{name:'老阳',bit:1,moving:true}};
  const source='https://zh.wikisource.org/zh-hans/易學象數論/占法';
  const validLines=lines=>Array.isArray(lines)&&lines.length===6&&lines.every(n=>Number.isInteger(n)&&Object.hasOwn(values,n));
  const time=n=>Number.isSafeInteger(n)&&n>=0?n:0;
  const plain=(s,n)=>typeof s==='string'?s.slice(0,n):'';
  function blankDraft(){return {question:'',method:'coins',throws:[],manualId:1,moving:[],updated:0};}
  function blank(){return {draft:blankDraft(),records:[]};}
  function validThrows(list){return Array.isArray(list)&&list.length<=6&&list.every(a=>Array.isArray(a)&&a.length===3&&a.every(n=>n===2||n===3));}
  function normalize(value){
    const result=blank(),d=value?.draft;
    if(d&&typeof d==='object')result.draft={question:plain(d.question,500),method:d.method==='manual'?'manual':'coins',throws:validThrows(d.throws)?d.throws.map(a=>a.slice()):[],manualId:Number.isInteger(d.manualId)&&d.manualId>=1&&d.manualId<=64?d.manualId:1,moving:[...new Set((Array.isArray(d.moving)?d.moving:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<6))].sort((a,b)=>a-b),updated:time(d.updated)};
    const records=new Map();
    for(const r of Array.isArray(value?.records)?value.records:[]){
      if(!r||typeof r.id!=='string'||!/^i-[a-zA-Z0-9-]{1,80}$/.test(r.id)||!validLines(r.lines)||!time(r.createdAt))continue;
      const next={id:r.id,question:plain(r.question,500),method:r.method==='manual'?'manual':'coins',lines:r.lines.map(Number),createdAt:time(r.createdAt),updated:Math.max(time(r.updated),time(r.createdAt)),reflection:plain(r.reflection,10000)};
      if(!records.has(next.id)||records.get(next.id).updated<next.updated)records.set(next.id,next);
    }
    result.records=[...records.values()].sort((a,b)=>b.createdAt-a.createdAt||a.id.localeCompare(b.id));return result;
  }
  function merge(a,b){
    a=normalize(a);b=normalize(b);
    return normalize({draft:b.draft.updated>a.draft.updated?b.draft:a.draft,records:[...a.records,...b.records]});
  }
  function coinThrow(randomBit){
    const bit=randomBit||(()=>{const a=new Uint8Array(1);globalThis.crypto.getRandomValues(a);return a[0]&1;});
    return Array.from({length:3},()=>bit()?3:2);
  }
  function manualLines(chapter,moving){return chapter.bits.map((b,i)=>moving.includes(i)?(b?9:6):(b?7:8));}
  function analyze(book,lines){
    if(!validLines(lines))throw new Error('请先完成六爻');
    const bits=lines.map(n=>values[n].bit),moving=lines.flatMap((n,i)=>values[n].moving?[i]:[]),changed=bits.map((b,i)=>moving.includes(i)?1-b:b);
    const match=bits=>book.chapters.find(c=>c.bits.join('')===bits.join(''));
    const base=match(bits),target=match(changed);
    if(!base||!target)throw new Error('未找到对应卦象');
    return {base,target,moving,bits,changed};
  }
  function lineName(bits,i){return i===0?'初'+(bits[i]?'九':'六'):i===5?'上'+(bits[i]?'九':'六'):(bits[i]?'九':'六')+['','二','三','四','五'][i];}
  // Reading selections follow the quoted 启蒙 rules. With three changes we intentionally
  // show both judgments, without claiming to implement the 前十／后十 priority scheme.
  function readingPlan(book,lines){
    const a=analyze(book,lines),n=a.moving.length,refs=[];
    const add=(chapter,title,priority)=>{const section=chapter.sections.findIndex(s=>s.title===title);if(section<0)throw new Error('原书章节缺失：'+chapter.title+title);refs.push({chapterId:chapter.id,section,title,priority});};
    const line=(chapter,i,priority)=>add(chapter,lineName(chapter.bits,i),priority);
    const stable=[0,1,2,3,4,5].filter(i=>!a.moving.includes(i));
    let explanation='';
    if(n===0){add(a.base,'卦辞','先读');explanation='六爻都不变，先读本卦卦辞，把握整个卦的处境。';}
    if(n===1){line(a.base,a.moving[0],'主读');explanation='一爻变，主读本卦这一条动爻的爻辞，再结合全卦理解。';}
    if(n===2){line(a.base,a.moving[1],'主读');line(a.base,a.moving[0],'参读');explanation='两爻变，读本卦两条动爻的爻辞，位置较高的一爻为主。';}
    if(n===3){add(a.base,'卦辞','本卦');add(a.target,'卦辞','变卦');explanation='三爻变，并列读本卦与变卦的卦辞，比较两种处境。本页不细分「前十、后十」的主次。';}
    if(n===4){line(a.target,stable[0],'主读');line(a.target,stable[1],'参读');explanation='四爻变，读变卦中两个未变位置的爻辞，位置较低的一爻为主。';}
    if(n===5){line(a.target,stable[0],'主读');explanation='五爻变，主读变卦中唯一未变位置的爻辞。';}
    if(n===6){if(a.base.id===1||a.base.id===2){add(a.base,a.base.id===1?'用九':'用六','主读');explanation='六爻全变，乾、坤分别读「用九」「用六」，这是六爻合看，不是第七爻。';}else{add(a.target,'卦辞','主读');explanation='六爻全变，主读变卦卦辞，观察整体处境的变化。';}}
    return {...a,refs,explanation};
  }
  function create({book,escape:esc,getRecord,update,refresh,toast}){
    let motion=null,motionTimer=null;
    const record=()=>normalize(getRecord());
    const chapter=id=>book.chapters.find(c=>c.id===Number(id));
    const stamp=()=>Math.max(Date.now(),record().draft.updated+1,...record().records.map(r=>r.updated+1));
    const commitDraft=patch=>{const r=record();r.draft={...r.draft,...patch,updated:stamp()};return update(r);};
    const redraw=selector=>{refresh();if(selector)document.querySelector(selector)?.focus({preventScroll:true});};
    const bar=bit=>`<span class="interp-bar ${bit?'yang':'yin'}" aria-hidden="true"><i></i>${bit?'':'<i></i>'}</span>`;
    const date=r=>new Date(r.createdAt).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
    const heading=(title,desc)=>`<header class="interp-heading"><div><span class="eyebrow">观象 · 读辞 · 思变</span><h1>${title}</h1><p>${desc}</p></div><a class="text-link" href="#interpret/history">我的卦记 · ${record().records.length} ↗</a></header>`;
    const methodDetails=()=>`<details class="interp-method"><summary>这里怎样起卦、怎样选解读？</summary><div><p>三枚虚拟钱币分别等概率出现「正 3」或「反 2」，相加得到 6、7、8、9；从初爻到上爻掷六次。6 为老阴、9 为老阳，都是动爻；7 为少阳、8 为少阴，保持不变。这是三钱法模拟。</p><p>选文参考朱熹《易学启蒙》变占法：零变读本卦卦辞；一变读动爻；二变读两动爻、以上为主；三变并读两卦卦辞；四变读变卦两静爻、以下为主；五变读变卦静爻；六变乾坤读用九／用六，其余读变卦卦辞。</p><p>这是读经入门顺序；三爻变未细分「前十、后十」主次。占法有不同传统，变卦也不表示必然发生的结果。</p><a href="${source}" target="_blank" rel="noopener" class="text-link">出处：《易学象数论·占法》所录启蒙占法 ↗</a><p>卦辞、爻辞、白话和解读取自本地《傅佩荣解读易经》；思考提示为本站编写，问题只保存在此浏览器。</p></div></details>`;
    function castingFigure(lines){return `<div class="interp-casting-lines" aria-label="六爻自下往上生成">${[5,4,3,2,1,0].map(i=>{const v=values[lines[i]],fresh=motion?.phase==='landed'&&i===lines.length-1;return `<div class="interp-casting-row ${v?.moving?'moving':''} ${i===lines.length?'next':''} ${fresh?'just-formed':''}"><span>${ranks[i]}</span>${v?bar(v.bit):'<span class="interp-empty-line"></span>'}<span>${v?`${lines[i]} · ${v.name}${v.moving?' ○':''}`:i===lines.length?(motion?.phase==='toss'?'正在成爻':'下一爻'):'待起'}</span></div>`;}).join('')}</div>`;}
    function coinsPanel(d){
      const visible=motion?d.throws.slice(0,motion.shown):d.throws,lines=visible.map(a=>a.reduce((s,n)=>s+n,0)),last=visible.at(-1),done=lines.length===6,tossing=motion?.phase==='toss';
      const faces=tossing?motion.throws[motion.shown]:last;
      return `<section class="interp-cast ${tossing?'is-tossing':motion?'is-landing':''}" aria-busy="${!!motion}"><div class="interp-cast-top"><span>自下而上，一爻一爻来</span><strong>${lines.length} / 6</strong></div>${castingFigure(lines)}<div class="interp-coins" aria-label="${tossing?'三枚钱币正在翻转':last?'最近一次钱币结果：'+last.join('、'):'三枚虚拟钱币'}">${(faces||[null,null,null]).map(n=>`<span class="interp-coin-slot" aria-hidden="true"><i class="interp-coin-shadow"></i><span class="interp-coin ${n===2?'reverse':''}"><span class="interp-coin-face coin-front"><b>${n?'正':'易'}</b><small>${n?'3':'·'}</small></span><span class="interp-coin-face coin-back"><b>反</b><small>2</small></span></span></span>`).join('')}</div><p class="interp-coin-result" role="status">${tossing?`钱币轻落，静候${ranks[lines.length]}…`:last?`${last.join(' + ')} = ${lines.at(-1)}，${values[lines.at(-1)].name}${values[lines.at(-1)].moving?'，此爻会变。':'，此爻不变。'}`:'正面记 3，反面记 2；三枚相加成一爻。'}</p><div class="interp-cast-actions">${motion?`<button class="button primary" disabled>${tossing?'正在掷'+ranks[lines.length]+'…':done?'六爻已成':'第 '+lines.length+' 爻已成'}</button>`:done?'<button class="button primary" data-interpret="read">六爻已成，开始解卦 →</button>':`<button class="button primary" data-interpret="toss">${lines.length?'掷出'+ranks[lines.length]:'掷出第一爻'} →</button><button class="text-link" data-interpret="finish">${lines.length?'完成余下爻':'一次起六爻'}</button>`}</div><div class="interp-undo-slot">${lines.length&&!motion?'<button class="interp-undo" data-interpret="undo">撤回刚才一爻</button>':''}</div></section>`;
    }
    function stopMotion(){clearTimeout(motionTimer);motionTimer=null;motion=null;}
    function motionMatches(d){return d.method==='coins'&&JSON.stringify(d.throws)===JSON.stringify(motion?.throws);}
    function paintCast(){
      const panel=document.querySelector('.interp-cast');if(!panel)return;
      const d=record().draft;if(motion&&!motionMatches(d))stopMotion();
      panel.outerHTML=coinsPanel(d);
      document.querySelectorAll('[data-interpret-method]').forEach(el=>{el.disabled=!!motion;});
    }
    function startCasting(all){
      if(motion)return;
      const d=record().draft;if(d.method!=='coins'||d.throws.length===6)return;
      let next=d.throws.slice();
      try{do{next.push(coinThrow());}while(all&&next.length<6);}catch(e){toast('此浏览器未能生成随机数，请用「已有卦象」录入。');return;}
      // Persist the actual throws once. Animation only reveals them, so refreshing
      // mid-flight cannot reroll a result or lose a completed batch.
      commitDraft({throws:next});
      if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){paintCast();document.querySelector(next.length===6?'[data-interpret="read"]':'[data-interpret="toss"]')?.focus({preventScroll:true});return;}
      const run={throws:next,shown:d.throws.length,phase:'toss'};motion=run;paintCast();
      const advance=()=>{
        if(motion!==run)return;
        if(!motionMatches(record().draft)){stopMotion();paintCast();return;}
        if(run.phase==='toss'){
          run.shown++;run.phase='landed';paintCast();
          motionTimer=setTimeout(advance,run.shown===next.length?450:520);
        }else if(run.shown<next.length){
          run.phase='toss';paintCast();motionTimer=setTimeout(advance,1100);
        }else{
          const focusCast=document.activeElement===document.body||document.activeElement?.closest('.interp-cast');
          stopMotion();paintCast();
          if(focusCast)document.querySelector(next.length===6?'[data-interpret="read"]':'[data-interpret="toss"]')?.focus({preventScroll:true});
        }
      };
      motionTimer=setTimeout(advance,1100);
    }
    function manualPanel(d){
      const c=chapter(d.manualId);
      return `<section class="interp-manual"><label class="interp-label" for="interp-base">选择本卦</label><select id="interp-base">${book.chapters.map(c=>`<option value="${c.id}" ${c.id===d.manualId?'selected':''}>${String(c.id).padStart(2,'0')} · ${c.title}</option>`).join('')}</select><div class="interp-manual-caption"><strong>${c.upper}上 · ${c.lower}下</strong><span>勾选动爻；没有动爻则不勾选。</span></div><div class="interp-manual-lines">${[5,4,3,2,1,0].map(i=>`<label class="interp-manual-row ${d.moving.includes(i)?'moving':''}"><span>${lineName(c.bits,i)}</span>${bar(c.bits[i])}<span><input type="checkbox" data-interpret-moving="${i}" ${d.moving.includes(i)?'checked':''}> 动爻</span></label>`).join('')}</div><p class="interp-order-hint">↑ 从下往上数：最下面是初爻，最上面是上爻。</p><button class="button primary" data-interpret="read">解读这一卦 →</button></section>`;
    }
    function entry(){
      const d=record().draft;
      return `${heading('把心中的事，放进卦里读。','从一个问题开始，看见卦象的变化，也读懂每一句的来由。')}<ol class="interp-steps"><li><b>01</b> 留一个问题</li><li><b>02</b> 起卦或录入</li><li><b>03</b> 对照原书解读</li></ol><div class="interp-entry-grid"><section class="interp-question-card"><span class="eyebrow">此刻，你想理清什么？</span><label class="interp-label" for="interp-question">写下一个具体问题 <span>选填</span></label><textarea id="interp-question" maxlength="500" rows="4" placeholder="例如：这个计划还没准备充分，我现在最该留意什么？">${esc(d.question)}</textarea><p class="interp-hint">把注意力放在处境、选择与行动上。问题和起卦进度会留在本机。</p><div class="interp-method-tabs" aria-label="选择起卦方式"><button data-interpret-method="coins" ${motion?'disabled':''} aria-pressed="${d.method==='coins'}"><strong>三钱起卦</strong><span>掷六次，逐步成卦</span></button><button data-interpret-method="manual" ${motion?'disabled':''} aria-pressed="${d.method==='manual'}"><strong>已有卦象</strong><span>选本卦，标出动爻</span></button></div><div class="interp-example-entry"><span class="interp-example-seal">读</span><div><strong>第一次解卦？先看一遍示例。</strong><p>需卦九五变 → 泰卦，学着找到该读的那一句。</p><a class="text-link" href="#interpret/example">看解卦示例 →</a></div></div></section>${d.method==='coins'?coinsPanel(d):manualPanel(d)}</div>${methodDetails()}`;
    }
    function diagram(c,moving,label){
      return `<section class="interp-diagram"><span class="interp-gua-label">${label}</span><div class="interp-gua-top"><h2>${c.title}</h2><span>第 ${c.id} 卦 · ${c.keyword}</span></div><span class="interp-mobile-composition">${c.upper}上 · ${c.lower}下</span><div class="interp-diagram-body"><div class="interp-figure" role="img" aria-label="${c.title}，${c.upper}上${c.lower}下；自下而上${c.bits.map((b,i)=>`${lineName(c.bits,i)}${moving.includes(i)?'，变化位置':''}`).join('、')}">${[5,4,3,2,1,0].map(i=>`<div class="interp-figure-row ${moving.includes(i)?'moving':''}"><span>${lineName(c.bits,i)}</span>${bar(c.bits[i])}<span>${moving.includes(i)?'变':'·'}</span></div>`).join('')}</div><div class="interp-trigram-labels"><span><small>上卦</small><b>${c.upper}</b> · ${book.trigrams.find(t=>t.name===c.upper).nature}</span><span><small>下卦</small><b>${c.lower}</b> · ${book.trigrams.find(t=>t.name===c.lower).nature}</span></div></div><a class="text-link" href="#read/${c.id}/0">细读${c.name}卦 ↗</a></section>`;
    }
    function readingCard(ref){
      const c=chapter(ref.chapterId),s=c.sections[ref.section],get=type=>s.blocks.filter(b=>b.type===type).map(b=>`<p>${esc(b.text)}</p>`).join('');
      const line=c.bits.findIndex((b,i)=>lineName(c.bits,i)===s.title);
      return `<article class="interp-reading-card"><div class="interp-reading-title"><div><span class="interp-priority">${ref.priority}</span><h3>${c.name}卦 · ${s.title}</h3></div><a href="#source/${s.page}" class="text-link">原书第 ${s.page} 页 ↗</a></div>${line>=0?`<div class="interp-line-context">${bar(c.bits[line])}<span>从下往上第 ${line+1} 爻 · ${c.bits[line]?'阳爻':'阴爻'}</span></div>`:''}<div class="interp-original"><span>原文</span>${get('original')}</div><div class="interp-translation"><span>书中白话</span>${get('translation')}</div><details class="interp-commentary"><summary>展开傅佩荣解读</summary><div>${get('commentary')}<a class="text-link" href="#read/${c.id}/${ref.section}">回到原书对照阅读 ↗</a></div></details></article>`;
    }
    function result(r,example=false){
      const p=readingPlan(book,r.lines),n=p.moving.length;
      return `${heading('一卦，读见变化。','先认卦象，再读关键句，最后把理解放回你的问题。')}<div class="interp-result-meta"><a class="text-link" href="#interpret">← ${example?'自己起一卦':'再起一卦'}</a><span>${example?'学习示例 · 不计入卦记':`${date(r)} · ${r.method==='coins'?'三钱起卦':'手动录入'}`}</span></div><section class="interp-question-result"><span>${example?'示例问题':'这一次的问题'}</span><p>${esc(r.question||'未填写问题 · 从卦辞出发，观察此刻的处境。')}</p></section><div class="interp-result-diagrams">${diagram(p.base,p.moving,'本卦 · 从这里读起')}<div class="interp-change-bridge"><strong>${n?n+' 爻变':'无动爻'}</strong><span>${n?'→':'＝'}</span><small>${n?'红色标出变化位置':'六爻保持原状'}</small></div>${diagram(p.target,p.moving,n?'变卦 · 换一个角度看':'本卦不变 · 仍读此卦')}</div><section class="interp-reading-plan"><span class="interp-plan-number">读</span><div><h2>这次先读：${p.refs.map(ref=>`${chapter(ref.chapterId).name}卦${ref.title}`).join('、')}</h2><p>${p.explanation}</p>${n?`<div class="interp-moving-links"><span>本卦动爻：</span>${p.moving.map(i=>`<a href="#read/${p.base.id}/${p.base.sections.findIndex(s=>s.title===lineName(p.base.bits,i))}">${lineName(p.base.bits,i)} ↗</a>`).join('')}</div>`:''}</div></section><div class="interp-reading-grid">${p.refs.map(readingCard).join('')}</div><section class="interp-reflection"><div><span class="eyebrow">把卦意放回生活</span><h2>读完这句话，再想三件事。</h2><p class="interp-hint">读卦提问 · 本站学习引导</p></div><ol><li><b>看处境</b><p>本卦的主题是「${p.base.keyword}」。原文中的哪些条件与你的处境相似，哪些并不相符？</p></li><li><b>看变化</b><p>${n?`从${p.base.name}到${p.target.name}，你注意到什么变化？要出现这样的变化，现实中还需要哪些条件？`:'没有动爻，先看卦辞的整体意思。眼下有哪些条件需要保持，哪些事实还需要确认？'}</p></li><li><b>落到行动</b><p>结合白话和书中解释，你能做的一个小行动是什么？用什么现实反馈检验这次理解？</p></li></ol>${example?'<a class="button primary" href="#interpret">带着自己的问题，起一卦 →</a>':`<label class="interp-label" for="interp-reflection">我的理解与后续验证</label><textarea id="interp-reflection" data-record-id="${r.id}" maxlength="10000" rows="4" placeholder="我读到……与实际相符的是……我准备先……">${esc(r.reflection)}</textarea><span class="interp-save-status" id="interp-save-status" role="status">卦记已收好；输入感悟时自动保存到本机，可随学习备份导出。</span>`}</section>${methodDetails()}`;
    }
    function history(){
      const records=record().records;
      return `${heading('把每次思考，留作一页卦记。','记录当时的问题，再回来看看，你的理解怎样变了。')}<a class="button primary" href="#interpret">起一个新卦 →</a><div class="interp-history">${records.length?records.map(r=>{const a=analyze(book,r.lines);return `<a class="interp-history-card" href="#interpret/record/${r.id}"><div><span>${date(r)} · ${r.method==='coins'?'三钱起卦':'手动录入'}</span><h2>${a.base.name}${a.moving.length?' → '+a.target.name:' · 无动爻'}</h2></div><p>${esc(r.question||'从卦辞出发，观察此刻的处境。')}</p><span>${a.moving.length} 条动爻 · ${r.reflection?'已有感悟':'等你写下感悟'} <b>回看 →</b></span></a>`;}).join(''):'<div class="interp-history-empty"><h2>第一篇卦记，从一个问题开始。</h2><p>完整起卦并打开解读后，问题和六爻会自动保存在这里。</p><a class="text-link" href="#interpret/example">先看解卦示例 →</a></div>'}</div>`;
    }
    function render(parts){
      if(motion&&(parts[1]||!motionMatches(record().draft)))stopMotion();
      let html;
      if(parts[1]==='example')html=result({question:'这件事还没准备好，现在该推进吗？',lines:[7,7,7,8,9,8]},true);
      else if(parts[1]==='history')html=history();
      else if(parts[1]==='record'){
        const r=record().records.find(r=>r.id===parts[2]);
        html=r?result(r):`${heading('还没找到这篇卦记。','卦记保存在起卦时的浏览器中；也可以导入之前的学习备份。')}<a class="button" href="#interpret/history">返回我的卦记</a>`;
      }else html=entry();
      return `<div class="interpret-page">${html}</div>`;
    }
    function handleClick(el){
      if(motion&&(el.hasAttribute('data-interpret-method')||el.hasAttribute('data-interpret')))return true;
      if(el.hasAttribute('data-interpret-method')){commitDraft({method:el.dataset.interpretMethod});redraw(`[data-interpret-method="${el.dataset.interpretMethod}"]`);return true;}
      if(!el.hasAttribute('data-interpret'))return false;
      const action=el.dataset.interpret,d=record().draft;
      if(action==='toss'||action==='finish'){
        startCasting(action==='finish');
      }
      if(action==='undo'){commitDraft({throws:d.throws.slice(0,-1)});redraw('[data-interpret="toss"]');}
      if(action==='read'){
        const lines=d.method==='coins'?d.throws.map(a=>a.reduce((s,n)=>s+n,0)):manualLines(chapter(d.manualId),d.moving);
        if(!validLines(lines)){toast('请先完成六爻');return true;}
        const r=record(),now=stamp(),id='i-'+(globalThis.crypto?.randomUUID?.()||now.toString(36)+'-'+Math.random().toString(36).slice(2));
        r.records.unshift({id,question:d.question.trim(),method:d.method,lines,createdAt:now,updated:now,reflection:''});r.draft={...blankDraft(),updated:now};
        const saved=update(r);location.hash='#interpret/record/'+id;if(!saved)toast('当前无法保存到浏览器，请从我的笔记导出备份。');
      }
      return true;
    }
    function handleInput(el){
      if(el.id==='interp-question'){commitDraft({question:el.value});return true;}
      if(el.id==='interp-reflection'){
        const r=record(),item=r.records.find(r=>r.id===el.dataset.recordId);if(!item)return true;
        item.reflection=el.value;item.updated=stamp();const saved=update(r),label=document.querySelector('#interp-save-status');if(label)label.textContent=saved?'感悟已自动保存到本机。':'暂未保存到浏览器，请导出备份保留这段感悟。';return true;
      }return false;
    }
    function handleChange(el){
      const d=record().draft;
      if(el.id==='interp-base'){commitDraft({manualId:Number(el.value),moving:[]});redraw('#interp-base');return true;}
      if(el.hasAttribute('data-interpret-moving')){const i=Number(el.dataset.interpretMoving);commitDraft({moving:el.checked?[...d.moving,i]:d.moving.filter(n=>n!==i)});redraw(`[data-interpret-moving="${i}"]`);return true;}
      return false;
    }
    const homeEntry=()=>`<a class="interp-home-entry" href="#interpret"><span class="interp-home-mark">问</span><div><span class="eyebrow">心里有一件具体的事？</span><h2>起一卦，读懂本卦与变化。</h2><p>三钱起卦或录入已有卦象，对照动爻和原书解读。</p></div><span class="button">去解卦 →</span></a>`;
    return {render,handleClick,handleInput,handleChange,homeEntry,stopMotion};
  }
  return {values,ranks,blank,normalize,merge,validLines,coinThrow,manualLines,analyze,readingPlan,create};
});
