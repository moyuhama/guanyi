'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YIJING_LEARNING=api;})(typeof window!=='undefined'?window:globalThis,function(){
  // Traditional public-domain mnemonic; explanations below are learning aids.
  const cards=[
    {name:'乾',song:'乾三连',hint:'三条都是完整的阳爻。',memory:'三条长线连成一片，先认出「全阳」。',accent:[0,1,2]},
    {name:'坤',song:'坤六断',hint:'三条阴爻，共六截短线。',memory:'每一条都从中间断开。「六断」数的是六截，仍然只有三爻。',accent:[0,1,2]},
    {name:'离',song:'离中虚',hint:'中间断开，上下完整。',memory:'先盯住正中间：中间空着，就是离。',accent:[1]},
    {name:'坎',song:'坎中满',hint:'中间完整，上下断开。',memory:'和离成对记：中间是一条实线，就是坎。',accent:[1]},
    {name:'震',song:'震仰盂',hint:'只有最下面一条是阳爻。',memory:'像一个开口向上的碗，底部封住。盂（yú）是盛东西的器皿。',accent:[0]},
    {name:'艮',song:'艮覆碗',hint:'只有最上面一条是阳爻。',memory:'把碗扣过来，上面封住，下面开口。艮读 gèn。',accent:[2]},
    {name:'兑',song:'兑上缺',hint:'最上面断开，下面两条完整。',memory:'找到上方的缺口，就记住了兑。',accent:[2]},
    {name:'巽',song:'巽下断',hint:'最下面断开，上面两条完整。',memory:'和兑成对记：缺口挪到最下面，就是巽。巽读 xùn。',accent:[0]}
  ];
  const names=cards.map(c=>c.name),firstFour=names.slice(0,4);
  const info=name=>cards.find(c=>c.name===name);
  const blank=()=>({selected:'乾',pool:'four',card:'乾',seen:[],known:{},updated:0});
  const validTime=n=>Number.isFinite(n)&&n>=0?n:0;
  function normalize(value){
    const r=blank();if(!value||typeof value!=='object')return r;
    for(const key of ['selected','card'])if(names.includes(value[key]))r[key]=value[key];
    if(['four','all','review'].includes(value.pool))r.pool=value.pool;
    r.seen=[...new Set((Array.isArray(value.seen)?value.seen:[]).filter(n=>names.includes(n)))];
    for(const name of names){const k=value.known?.[name];if(k&&typeof k.mastered==='boolean')r.known[name]={mastered:k.mastered,updated:validTime(k.updated)};}
    r.updated=validTime(value.updated);return r;
  }
  function merge(a,b){
    const left=normalize(a),right=normalize(b),newer=right.updated>left.updated?right:left;
    const r={...newer,known:{...left.known},seen:[...new Set([...left.seen,...right.seen])]};
    for(const [name,k] of Object.entries(right.known))if(!r.known[name]||k.updated>r.known[name].updated)r.known[name]=k;
    return normalize(r);
  }
  function deck(record,pool=record.pool){return pool==='four'?firstFour:pool==='review'?names.filter(n=>record.known[n]?.mastered===false):names;}
  function nextCard(record,current){const list=deck(record);return list.length?list[(list.indexOf(current)+1)%list.length]:null;}
  function flip(bits,index){if(bits.length!==3||!bits.every(b=>b===0||b===1)||!Number.isInteger(index)||index<0||index>2)throw new Error('无效的三爻');return bits.map((b,i)=>i===index?1-b:b);}
  function create({book,hex,escape:esc,getRecord,update,refresh}){
    let range='four',revealed=false,feedback='',bits=[1,1,1],lastChange='',routeKey='';
    const record=()=>normalize(getRecord());
    const tri=name=>book.trigrams.find(t=>t.name===name);
    const match=()=>book.trigrams.find(t=>t.bits.join('')===bits.join(''));
    const count=()=>names.filter(n=>record().known[n]?.mastered).length;
    const commit=changes=>update({...record(),...changes,updated:stamp()});
    const stamp=()=>Math.max(Date.now(),record().updated+1);
    const nav=path=>`<nav class="learn-tabs" aria-label="动手学习导航">${[['','学习地图'],['memory','口诀认图'],['cards','翻卡自测'],['bagua','三爻变八卦'],['lab','六爻实验'],['stories','生活情境']].map(([id,label])=>`<a href="#explore${id?'/'+id:''}" ${path===id?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
    const heading=(step,title,desc)=>`<header class="learn-heading"><span class="eyebrow">${step}</span><h1>${title}</h1><p>${desc}</p></header>`;
    const song=()=>`<div class="learn-song"><span>八卦取象歌</span><p>乾三连，坤六断；震仰盂，艮覆碗。<br>离中虚，坎中满；兑上缺，巽下断。</p><small>传统口诀 · <a href="https://www.eee-learning.com/book/juicy-ch01" target="_blank" rel="noopener">查看出处 ↗</a></small></div>`;
    function diagram(name,highlight=false){const t=tri(name),c=info(name);return `<div class="learn-figure" role="img" aria-label="${name}卦，自下而上：${t.bits.map(b=>b?'阳':'阴').join('、')}">${[2,1,0].map(i=>`<span class="learn-stroke ${highlight&&c.accent.includes(i)?'ink-red':''}"><i></i>${t.bits[i]?'':'<i></i>'}</span>`).join('')}</div>`;}
    function controls(compact=false){const t=match(),c=info(t.name);return `<div class="learn-builder ${compact?'is-compact':''}"><div class="builder-top"><span>三条线，八种可能</span><span>点一下，阴阳互换</span></div><div class="builder-lines" aria-label="可翻动的三个爻">${[2,1,0].map(i=>`<button data-learn-flip="${i}" aria-label="${['下','中','上'][i]}爻，${bits[i]?'阳':'阴'}爻，点击变为${bits[i]?'阴':'阳'}爻"><span>${['下','中','上'][i]}爻</span><span class="builder-stroke"><i></i>${bits[i]?'':'<i></i>'}</span><span>${bits[i]?'阳':'阴'} <b>↻</b></span></button>`).join('')}</div><div class="builder-result" aria-live="polite"><div><strong>${t.name}</strong><span>${t.pinyin} · ${t.nature}</span></div><div><b>${c.song}</b><p>${c.hint}</p></div></div><p class="builder-feedback" role="status">${lastChange||'试试翻动中爻：新的卦象会在这里出现。'}</p></div>`;}
    function homeEntry(){return `<section class="learn-home-entry"><div class="learn-home-copy"><span class="eyebrow">签外，再学一点</span><h2>今天，认熟一个卦。</h2><p>口诀配图记一遍，遮住名字再认一遍。<br>从乾、坤、离、坎开始，每次花几分钟。</p><div><a class="button primary" href="#explore">进入动手学易 →</a><span>已标记熟悉 ${count()} / 8 卦</span></div></div><a class="learn-home-sample" href="#explore/memory" aria-label="用口诀认识离卦">${diagram('离',true)}<div><strong>离中虚</strong><span>中间空，就是离。</span><small>点开看口诀与卦图 ↗</small></div></a></section>`;}
    function overview(){return `${nav('')}<section class="learn-hero"><div><span class="eyebrow">动手学易 · 每次学一点</span><h1>从认出一卦开始。</h1><p>先看图，念口诀，再遮住名字试一试。<br>看懂三条爻，六十四卦就有了起点。</p><div class="learn-hero-actions"><a class="button primary" href="#explore/memory">先认四个卦 →</a><a class="text-link" href="#explore/cards">已经认识？直接自测 ↗</a></div><div class="learn-progress"><span>八卦识记</span><progress max="8" value="${count()}" aria-label="已标记熟悉的八卦"></progress><b>${count()} / 8</b></div><small>按翻卡时自己的判断记录，熟悉度随学习备份保存。</small></div>${controls(true)}</section><section class="learn-path"><div class="section-heading"><h2>沿着这三步，慢慢学会</h2><span class="heading-note">不用一次背完</span></div><div class="learn-path-grid">${[['01','memory','口诀认图','先认乾坤，再分离坎。把口诀和图形连起来。','看口诀'],['02','cards','翻卡自测','先认图，再揭晓答案。记不住的，单独再练。','试着认卦'],['03','bagua','动手翻爻','只改一条线，看看卦名怎样变化，再组合六爻。','拨动三爻']].map(([n,path,title,desc,cta])=>`<a href="#explore/${path}" class="learn-path-card"><span>${n}</span><h3>${title}</h3><p>${desc}</p><b>${cta} ↗</b></a>`).join('')}</div></section><div class="learn-beyond"><a href="#explore/stories"><span class="learn-beyond-icon">问</span><div><h3>情境里读易</h3><p>从起步、等待、相处、重新开始，走进四段生活情境。</p></div><span>→</span></a><a href="#explore/lab"><span class="learn-beyond-icon">变</span><div><h3>六十四卦实验室</h3><p>翻动六爻，观察上下卦，再对照原书读卦辞。</p></div><span>→</span></a></div>`;}
    function memory(){const r=record(),list=range==='four'?firstFour:names,name=list.includes(r.selected)?r.selected:list[0],t=tri(name),c=info(name);return `${nav('memory')}${heading('01 / 口诀认图',range==='four'?'先认四个，慢慢记牢。':'八个卦，成对记。','点选一个卦，让口诀和图形对应起来。红色标出这一句要看的地方。')}<div class="learn-switch" aria-label="口诀学习范围"><button data-learn-range="four" aria-pressed="${range==='four'}">先认四个</button><button data-learn-range="all" aria-pressed="${range==='all'}">展开八个</button></div><div class="learn-memory-layout"><div class="learn-memory-grid" aria-label="选择要记的卦">${list.map(n=>`<button class="learn-memory-tile" data-learn-select="${n}" aria-pressed="${n===name}">${diagram(n)}<strong>${info(n).song}</strong><span>${tri(n).nature} · ${tri(n).pinyin}</span>${r.known[n]?.mastered?'<small>✓ 已标记熟悉</small>':'<small>点开看记法</small>'}</button>`).join('')}</div><article class="learn-memory-detail" aria-live="polite"><span class="eyebrow">看图记 · ${t.nature}</span><div class="learn-memory-focus">${diagram(name,true)}<div><h2>${c.song}</h2><span>${t.name} ${t.pinyin} · ${t.nature}</span></div></div><h3>${c.hint}</h3><p>${c.memory}</p><div class="learn-pair-note">${name==='离'||name==='坎'?'成对记：离中空，坎中实。':name==='乾'||name==='坤'?'成对记：乾全实，坤全断。':name==='震'||name==='艮'?'成对记：震在下方实，艮在上方实。':'成对记：兑在上方缺，巽在下方断。'}</div><a href="#explore/bagua/${name}" class="text-link">亲手翻动${name}卦，看看变化 ↗</a></article></div>${song()}<div class="learn-next"><span>看过口诀了，把名字遮起来试试。</span><a class="button primary" href="#explore/cards" data-learn-start="${range}">开始翻卡自测 →</a></div>`;}
    function flashcards(){const r=record(),list=deck(r),name=list.includes(r.card)?r.card:list[0],t=name?tri(name):null,c=name?info(name):null;return `${nav('cards')}${heading('02 / 翻卡自测','看一眼卦图，试着叫出名字。','先在心里回答，再翻开答案。不计时，也不用一次全记住。')}<div class="learn-deck-bar"><div class="learn-switch" aria-label="抽认卡范围">${[['four','先练四个'],['all','全部八卦'],['review','只练没记住的']].map(([id,label])=>`<button data-learn-pool="${id}" aria-pressed="${r.pool===id}">${label}${id==='review'?` · ${deck(r,'review').length}`:''}</button>`).join('')}</div><span>已标记熟悉 <b>${count()} / 8</b></span></div><div class="learn-flash-layout"><div class="learn-flash-area">${t?`<div class="learn-flash-card ${revealed?'is-revealed':''}"><span class="learn-card-kicker">${revealed?'对照一下，你认对了吗？':'这一卦，叫什么？'}</span>${revealed?diagram(name,true):hex(t.bits,'large')}<div class="learn-answer" aria-live="polite">${revealed?`<h2>${t.name} <small>${t.pinyin} · ${t.nature}</small></h2><strong>${c.song}</strong><p>${c.hint}</p>`:'<p>先认卦名，再想想它的自然意象。</p>'}</div>${revealed?`<div class="learn-grade"><button class="button" data-learn-grade="again">还没记住，再练</button><button class="button primary" data-learn-grade="known">认对了，记住了 ✓</button></div>`:'<button class="button primary" data-learn-reveal>翻开答案 ↻</button>'}<span class="learn-card-foot">${list.length} 个卦循环练习 · ${revealed?'按你的记忆情况选择':'支持鼠标、触摸和键盘操作'}</span></div>`:`<div class="learn-flash-card learn-empty"><span class="learn-empty-symbol">✓</span><h2>暂时没有待复习的卦</h2><p>在自测中选「还没记住」，它就会收进这里。<br>先从四个卦开始吧。</p><button class="button primary" data-learn-pool="four">练习乾、坤、离、坎 →</button></div>`}<p class="learn-card-feedback" role="status">${esc(feedback||'认不出来也没关系，翻开后对着口诀看一遍。')}</p></div><aside class="learn-review"><span class="eyebrow">我的八卦识记</span><h2>一点点，把八个认熟。</h2><div class="learn-review-list">${names.map(n=>`<div><strong>${n}</strong><span>${r.known[n]?.mastered?'✓ 熟悉':r.known[n]?'再练一次':'还没自测'}</span></div>`).join('')}</div><p>熟悉度由你自己标记。忘记了可以再选「还没记住」。</p><a href="#explore/memory" class="text-link">回口诀页再看一眼 ↗</a><a href="#explore/bagua" class="text-link">下一步：自己变出八卦 →</a></aside></div>`;}
    function bagua(){const t=match(),c=info(t.name),seen=record().seen;return `${nav('bagua')}${heading('03 / 动手翻爻','改一条线，会变成谁？','三条爻各有阴、阳两种状态，一共八种组合。试着把它们都找到。')}<div class="learn-bagua-layout">${controls()}<article class="learn-bagua-note"><span class="eyebrow">现在这一卦 · ${t.nature}</span><h2>${c.song}</h2><p>${c.memory}</p><div class="learn-bits-explain"><span>阳爻 <i></i> 完整的一条</span><span>阴爻 <i class="is-yin"></i> 从中间断开</span></div><p>看懂三爻之后，把两个八卦上下相叠，就会得到一个六爻卦。</p><a class="button primary" href="#explore/lab">试试六爻的组合 →</a><a class="text-link" href="#read/${t.id}/0">读一读上下皆${t.name}的${t.name}卦 ↗</a></article></div><section class="learn-found"><div class="section-heading"><h2>你找到的八种变化</h2><span>${seen.length} / 8</span></div><div class="learn-found-grid">${names.map(n=>`<button data-learn-preset="${n}" aria-label="以${n}卦为起点" aria-pressed="${t.name===n}" class="${seen.includes(n)?'is-found':''}">${diagram(n)}<strong>${n} <small>${tri(n).nature}</small></strong><span>${seen.includes(n)?'✓ 已看到':'点选这个起点'}</span></button>`).join('')}</div><p class="learn-small-note">每个卦都可以作为起点。这里观察结构变化，再回原书读它的含义。</p></section>`;}
    function drawBridge(c){return `<div class="draw-learning-bridge"><div><span>先看懂这一卦</span><a href="#explore/memory">从口诀学起 ↗</a></div><div class="draw-trigram-pair">${[['上卦',c.upper],['下卦',c.lower]].map(([part,name])=>`<a href="#explore/bagua/${name}" aria-label="动手认识${part}${name}">${hex(tri(name).bits)}<span><strong>${part} · ${name}为${tri(name).nature}</strong><small>${info(name).song} · 点开试一试</small></span><b>↗</b></a>`).join('')}</div></div>`;}
    function render(path='',param=''){
      const key=path+'/'+param;if(key!==routeKey){revealed=false;feedback='';routeKey=key;if(path==='bagua'){if(names.includes(param))bits=[...tri(param).bits];lastChange='';const name=match().name;commit({seen:[...new Set([...record().seen,name])]});}}
      return path==='memory'?memory():path==='cards'?flashcards():path==='bagua'?bagua():overview();
    }
    function redraw(focus){refresh();if(focus)document.querySelector(focus)?.focus({preventScroll:true});}
    function handleClick(el){
      const d=el.dataset;if(!Object.keys(d).some(k=>k.startsWith('learn')))return false;
      if(d.learnStart){commit({pool:d.learnStart,card:'乾'});revealed=false;feedback='';return false;}
      if(d.learnRange){range=d.learnRange;redraw(`[data-learn-range="${range}"]`);}
      if(d.learnSelect&&names.includes(d.learnSelect)){commit({selected:d.learnSelect});redraw(`[data-learn-select="${d.learnSelect}"]`);}
      if(d.learnPool){const r={...record(),pool:d.learnPool};commit({pool:r.pool,card:deck(r)[0]||'乾'});revealed=false;feedback='';redraw('[data-learn-reveal],.learn-empty button');}
      if(d.learnReveal!==undefined){revealed=true;redraw('[data-learn-grade="again"]');}
      if(d.learnGrade){const r=record(),list=deck(r),name=list.includes(r.card)?r.card:list[0];if(!revealed||!name)return true;const known={...r.known,[name]:{mastered:d.learnGrade==='known',updated:stamp()}},next={...r,known};commit({known,card:nextCard(next,name)||'乾'});revealed=false;feedback=`${name}卦已记下：${d.learnGrade==='known'?'标记为熟悉。':'加入复习，再看一遍口诀。'}`;redraw('[data-learn-reveal],.learn-empty button');}
      if(d.learnFlip!==undefined){const old=match(),i=Number(d.learnFlip),before=bits[i];bits=flip(bits,i);const t=match();lastChange=`${old.name} → ${t.name}：${['下','中','上'][i]}爻由${before?'阳变阴':'阴变阳'}。`;commit({seen:[...new Set([...record().seen,old.name,t.name])]});redraw(`[data-learn-flip="${i}"]`);}
      if(d.learnPreset&&names.includes(d.learnPreset)){bits=[...tri(d.learnPreset).bits];lastChange=`以${d.learnPreset}卦为起点，再翻动一条爻。`;commit({seen:[...new Set([...record().seen,d.learnPreset])]});redraw(`[data-learn-preset="${d.learnPreset}"]`);}
      return true;
    }
    return {render,handleClick,homeEntry,drawBridge,nav};
  }
  return {cards,names,firstFour,blank,normalize,merge,deck,nextCard,flip,create};
});
