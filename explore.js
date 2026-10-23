'use strict';
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.YIJING_EXPLORE = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  const lessons = [
    {
      id:'begin', number:'01', name:'初入新局', tag:'关于起步', glyph:'芽', tone:'sprout',
      title:'还没准备好，也要往前冲吗？', subtitle:'从一条潜龙，认识做事的时机。',
      chapter:1, section:1, concept:'时与位', required:[0,4,5],
      story:'你刚接手一个陌生的项目。身边的人已经开始展示成果，而你还在摸清门道。明天的讨论会上，要不要主动提出一个大方案？',
      question:'如果是你，此刻更倾向于……',
      options:[
        ['先把方案抛出来，边做边学','主动尝试能带来反馈。不过，先分清哪些是已知、哪些是假设，会让这一步更稳。'],
        ['先弄清关键问题，再小范围试一试','你给准备留了一点空间。接下来可以想：什么信号出现时，我就愿意迈出下一步？'],
        ['等完全有把握了，再开口','谨慎可以减少疏漏。但如果一直等“完全准备好”，也可能错过学习的机会。']
      ],
      bridge:'同样是龙，潜在水下、飞在天空、飞得过高，行动方式会一样吗？',
      observe:'点三处爻位，看看同一条龙的不同处境。',
      discovery:'乾卦的六爻给出不同处境。这里取初、五、上三处作对照：主动与克制，都要放在所处的位置里理解。',
      insight:'“潜龙勿用”可以引出一个学习问题：我现在欠缺的，究竟是勇气，还是条件？把准备做具体，等待才有方向。',
      prompt:'为了下一步，我今天可以补齐哪一个条件？',
      placeholder:'例如：先找一位熟悉项目的人，确认最关键的限制。',
      takeaway:'行动之前，先看自己在哪里。'
    },
    {
      id:'wait', number:'02', name:'等待时机', tag:'关于进退', glyph:'云', tone:'rain',
      title:'等待的时候，还能做些什么？', subtitle:'在云与天之间，分清等待和停滞。',
      chapter:5, section:1, concept:'内外之象', required:[0,1],
      story:'一件很想推进的事，卡在尚未确认的条件上。消息迟迟没来，你已经反复刷新了好多次。心里着急，手上却不知道该做什么。',
      question:'接下来的半小时，你会……',
      options:[
        ['再催一次，尽快要一个答案','催问有时能澄清进度。也可以先看看：对方需要的信息，我已经给全了吗？'],
        ['放下刷新，准备自己能掌握的部分','把注意力移回可做的事，会让等待有内容。准备好了，也要记得观察外部条件。'],
        ['先彻底放下，等消息来了再说','暂时休息能恢复精力。你也可以为下一次确认设个时间，让放下有一个边界。']
      ],
      bridge:'需卦把“内在有力量”和“前面有险阻”放在一起。它们怎样同时存在？',
      observe:'点开上卦与下卦，拼出需卦的处境。',
      discovery:'需卦下乾上坎。乾的刚健在内，坎的险在前；有能力向前，也要辨认前面的条件。',
      insight:'等待不必等于停滞。借需卦来想一想：哪些条件要等，哪些准备现在就能做？这两个问题可以分开回答。',
      prompt:'在等待的这段时间，有哪一件事在我的掌握之中？',
      placeholder:'例如：把需要确认的问题列成三条，明天下午再集中询问。',
      takeaway:'看清外部条件，照顾内部准备。'
    },
    {
      id:'connect', number:'03', name:'打破隔阂', tag:'关于相处', glyph:'交', tone:'bridge',
      title:'都在说话，为什么还是不相通？', subtitle:'交换天地的位置，发现关系中的“交”。',
      chapter:11, section:1, concept:'上下相交', required:[1],
      story:'你和搭档都很认真，却总觉得对方没听懂自己。讨论越久，两人的解释越多，真正需要解决的问题反而越来越模糊。',
      question:'如果想让这次讨论发生一点变化，你会……',
      options:[
        ['再把自己的理由讲得完整一点','解释有价值，但也可能重复原来的路径。先确认对方卡在哪一点，再决定补充什么。'],
        ['请对方说完，再复述我听到的重点','这会给彼此一个校正理解的机会。复述之后，还可以问一句：我漏掉了什么？'],
        ['先暂停，给彼此一点空间','暂停可以降低情绪。约定何时、带着什么问题回来，会让这段空隙更有帮助。']
      ],
      bridge:'同样是天与地，位置交换之后，为什么一个叫泰，一个叫否？',
      observe:'交换一次天地的位置，对照泰与否。',
      discovery:'泰与否都由乾、坤组成。原书用“天地交”与“天地不交”解释两种关系；关键在于彼此是否相通。',
      insight:'把“交”放进生活，可以从让理解流动开始：听见对方的需要，再让自己的想法有机会被理解。',
      prompt:'下一次沟通，我想先问对方哪一个问题？',
      placeholder:'例如：这件事里，你最担心的是什么？',
      takeaway:'关系的变化，可能从一次认真倾听开始。'
    },
    {
      id:'return', number:'04', name:'重新开始', tag:'关于改变', glyph:'复', tone:'return',
      title:'中断以后，怎样重新出发？', subtitle:'只改变一爻，看见一点点生机。',
      chapter:24, section:1, concept:'一阳来复', required:[0],
      story:'原本想每天读一点书，忙过一阵，已经搁下很久。翻开时又觉得落下太多，甚至想等到“有一整段空闲”再重新开始。',
      question:'今天重新拿起书，你更愿意……',
      options:[
        ['一次补上落下的所有内容','想追回进度很自然。不过，任务太大时也会增加开始的难度。可以先试一小段。'],
        ['就读一页，给今天一个小小的开始','这个起点很具体。做完之后，留意怎样让明天也容易开始，比立刻加量更有用。'],
        ['等状态好一点，再定新计划','状态会影响行动，也会受行动影响。你愿不愿意用一个很小的动作，先试试今天的状态？']
      ],
      bridge:'六条阴爻之中，如果最下方先出现一条阳爻，会发生什么？',
      observe:'点击最下方的初爻，让第一缕阳气回来。',
      discovery:'坤卦六爻皆阴。初爻由阴变阳，就得到复卦：阳从最下面回来。这里用翻爻观察两个卦的结构。',
      insight:'借“一阳来复”来体会重新开始：变化可以很小，却已经有了方向。先给自己一个做得到、还愿意重复的起点。',
      prompt:'今天小到不会拖延的一步，是什么？',
      placeholder:'例如：睡前读完一页，只记下最有感触的一句话。',
      takeaway:'一个小小的开始，也已经是回来。'
    }
  ];
  const findLesson = id => lessons.find(l => l.id === id);
  const blank = () => ({step:0,choice:null,seen:[],reflection:'',completed:false,updated:0});
  const ready = (lesson, record) => lesson.required.every(n => record.seen.includes(n));
  function normalize(value) {
    const result = {};
    if (!value || typeof value !== 'object') return result;
    for (const l of lessons) {
      const v = value[l.id];
      if (!v || typeof v !== 'object') continue;
      const r = blank();
      r.choice = Number.isInteger(v.choice) && v.choice >= 0 && v.choice < l.options.length ? v.choice : null;
      r.seen = [...new Set((Array.isArray(v.seen) ? v.seen : []).filter(n => l.required.includes(n)))];
      r.reflection = typeof v.reflection === 'string' ? v.reflection.slice(0,2000) : '';
      r.updated = Number.isFinite(v.updated) && v.updated >= 0 ? v.updated : 0;
      r.completed = v.completed === true && r.choice !== null && ready(l,r);
      const maxStep = r.completed ? 3 : r.choice === null ? 0 : ready(l,r) ? 2 : 1;
      r.step = Math.min(maxStep, Math.max(0, Number.isInteger(v.step) ? v.step : 0));
      result[l.id] = r;
    }
    return result;
  }
  function merge(a,b) {
    const left=normalize(a),right=normalize(b),result={...left};
    for (const [id,r] of Object.entries(right)) {
      const old=left[id];
      if (!old) { result[id]=r; continue; }
      const newer=r.updated>old.updated?r:old,older=newer===r?old:r;
      result[id]={...newer,choice:newer.choice??older.choice,seen:[...new Set([...old.seen,...r.seen])],completed:old.completed||r.completed};
    }
    return normalize(result);
  }
  function flip(bits,index) {
    if (bits.length!==6 || !bits.every(b=>b===0||b===1) || !Number.isInteger(index) || index<0 || index>5) throw new Error('无效的爻位');
    return bits.map((b,i)=>i===index?1-b:b);
  }
  const chapterFor = (book,bits) => book.chapters.find(c=>c.bits.join('')===bits.join(''));

  function create({book,hex,escape:esc,getRecords,update,refresh,toast}) {
    let activeId='', dragonPosition=0, connectionSwapped=false, returnHint='';
    let labBits=[1,0,0,0,0,0], labHistory=[], labMessage='从复卦出发。试着翻动一爻，看看它会变成哪一卦。';
    const chapter=id=>book.chapters.find(c=>c.id===id);
    const record=l=>getRecords()[l.id]||blank();
    const completionCount=()=>lessons.filter(l=>record(l).completed).length;
    const section=(id,index)=>chapter(id).sections[index];
    const original=(id,index)=>section(id,index).blocks.find(b=>b.type==='original')?.text||'';
    const nature=name=>book.trigrams.find(t=>t.name===name).nature;
    const arrow='<span aria-hidden="true">↗</span>';
    const illustration=(tone)=>`<svg viewBox="0 0 240 140" fill="none" class="scene-art" aria-hidden="true"><circle cx="174" cy="38" r="22" fill="currentColor" opacity=".09"/>${{
      sprout:'<path d="M20 117C65 99 107 128 150 108S211 101 231 111M122 115C119 90 113 72 124 43"/><path d="M121 88C91 90 79 70 80 57C103 55 119 64 121 88ZM121 70C142 72 163 53 160 39C137 37 124 49 121 70Z" fill="currentColor" fill-opacity=".1"/>',
      rain:'<path d="M30 56C35 43 52 40 64 46C62 21 105 15 115 40C136 28 162 47 153 64H34M65 83l-6 17m33-17-6 17m34-17-6 17m32-17-6 17M20 119c36-10 54 9 91 0s64 9 111 0"/>',
      bridge:'<path d="M18 110C63 80 77 112 113 103s67-25 109 1M35 99C61 25 176 25 205 98M54 94c32-48 98-48 132-2M72 61v16m26-27v15m29-17v15m28-10v15m25-4v16"/><path d="M100 117h32m10 9h43M25 130h50"/>',
      return:'<path d="M22 118c48-19 100-13 151-3s40-4 53-6M118 113V89m0 12c-16 0-26-8-27-16 14-2 24 5 27 16m0-5c16 0 25-10 26-19-16 0-23 7-26 19"/><path d="M69 66a54 54 0 0 1 104-8m-10-7 11 8 4-13" stroke-dasharray="3 5"/>'
    }[tone]}</svg>`;
    function homeEntry() {
      return `<a class="explore-home-entry" href="#explore"><span class="explore-entry-symbol" aria-hidden="true">游</span><span><small>让学习发生在你的选择里</small><strong>走进一个处境，读懂一点易。</strong><em>选一段生活情境 · 动手看卦象 · 带走一点领悟</em></span><span class="explore-entry-cta">动手学易 ${arrow}</span></a>`;
    }
    function overview() {
      const count=completionCount(),ongoing=lessons.find(l=>getRecords()[l.id]&&!record(l).completed);
      return `<section class="explore-intro"><div><span class="eyebrow">情境里读易</span><h1>不急着读懂易经，<br>先走进一个处境。</h1><p>做一次选择，动手改变卦象，<br>再回到古人的一句话。让理解，一点点发生。</p><a class="button primary" href="#explore/${ongoing?.id||'begin'}">${ongoing?'接着上次探索':'从第一段旅程开始'} <span aria-hidden="true">→</span></a></div><div class="explore-intro-art">${illustration('sprout')}<span class="explore-seal">知 · 行</span><p>在变化里，慢慢生长</p></div></section><div class="explore-route"><span><b>01</b> 入境 <small>从生活出发</small></span><i>→</i><span><b>02</b> 观象 <small>亲手试一试</small></span><i>→</i><span><b>03</b> 会意 <small>留一点给自己</small></span></div><section><div class="section-heading"><h2>此刻，想从哪里出发？</h2><span class="explore-count">已走过 <b>${count}</b> / 4 段旅程</span></div><div class="scene-grid">${lessons.map(l=>{const r=record(l),started=!!getRecords()[l.id];return `<a class="scene-card ${l.tone}" href="#explore/${l.id}"><div class="scene-topline"><span>${l.number} / ${l.tag}</span><span class="scene-status">${r.completed?'✓ 已探索':started?'继续探索':'约 3 分钟'}</span></div>${illustration(l.tone)}<div class="scene-card-copy"><span class="scene-concept">${l.concept}</span><h3>${l.name}</h3><p>${l.title}</p><div class="scene-card-bottom"><span>${l.subtitle}</span>${arrow}</div></div></a>`;}).join('')}</div></section><a class="explore-lab-entry" href="#explore/lab"><div class="lab-entry-symbol">${hex([1,0,1,0,1,0])}</div><div><span class="eyebrow">自由探索</span><h2>卦象实验室</h2><p>六条爻，六十四种组合。随手翻一爻，看看变化通向哪里。</p></div><span class="button secondary">动手试试 →</span></a><p class="explore-provenance">生活情境与互动提示为本站学习引导；经传原文、白话译文取自你的《傅佩荣解读易经》PDF，均可回到原页。</p>`;
    }
    function sourceCard(l) {
      const s=section(l.chapter,l.section),c=chapter(l.chapter);
      return `<article class="explore-source"><div class="explore-source-top"><span>回到原书 · ${c.name}卦 · ${s.title}</span><a href="#source/${s.page}">PDF 第 ${s.page} 页 ↗</a></div><blockquote>${esc(s.blocks.find(b=>b.type==='original')?.text||'')}</blockquote><details><summary>展开书中白话</summary><p>${esc(s.blocks.find(b=>b.type==='translation')?.text||'')}</p></details></article>`;
    }
    function lineButtons(bits,action,selected=[],labels=[]) {
      return `<div class="explore-lines" aria-label="六爻，自下而上读">${bits.map((b,i)=>`<button class="explore-line ${b?'yang':'yin'} ${selected.includes(i)?'discovered':''}" data-ex-${action}="${i}" aria-label="${['初','二','三','四','五','上'][i]}爻，${b?'阳':'阴'}爻${action==='flip'?'，点击翻转':''}" ${action==='dragon'&&![0,4,5].includes(i)?'disabled':''}><span class="line-rank">${['初','二','三','四','五','上'][i]}</span><span class="line-strokes"><i></i>${b?'':'<i></i>'}</span><span class="line-hint">${labels[i]|| (action==='flip'?'翻转':selected.includes(i)?'已看':'点这里')}</span></button>`).join('')}</div>`;
    }
    function observe(l,r) {
      if(l.id==='begin') {
        const pos=dragonPosition, texts={0:['潜龙','条件还在积累，可以先把根扎稳。'],4:['飞龙','来到能施展的位置，也需要合适的人与支持。'],5:['亢龙','一味向上，可能超过合适的限度。']};
        return `<div class="observation-board dragon-board"><div><span class="tiny-label">乾卦 · 从下往上看</span>${lineButtons(chapter(1).bits,'dragon',r.seen,['潜龙','·','·','·','飞龙','亢龙'])}</div><div class="observation-caption" aria-live="polite"><span class="observation-big">${texts[pos][0]}</span><p class="observation-quote">${esc(original(1,pos+1))}</p><p>${r.seen.length?texts[pos][1]:'先点亮左侧三个位置。位置不同，给行动的提示也不同。'}</p><a class="text-link" href="#read/1/${pos+1}">看看这一爻的原文 ↗</a></div></div>`;
      }
      if(l.id==='wait') return `<div class="observation-board need-board"><div class="trigram-discovery">${[[1,'坎','上卦 · 坎为水','水聚在天上，可以取云的形象。坎也有险的意味：外部条件仍需要观察。'],[0,'乾','下卦 · 乾为天','乾为健。内在有行动的力量，也能先做准备，不必急着冲进险中。']].map(([n,name,title,desc])=>`<button data-ex-reveal="${n}" class="trigram-reveal ${r.seen.includes(n)?'revealed':''}" aria-expanded="${r.seen.includes(n)}">${hex(book.trigrams.find(t=>t.name===name).bits)}<span><strong>${r.seen.includes(n)?title:n?'点开上卦':'点开下卦'}</strong><small>${r.seen.includes(n)?desc:'这一半，藏着怎样的处境？'}</small></span><i>${r.seen.includes(n)?'✓':'+'}</i></button>`).join('')}</div><div class="observation-caption">${illustration('rain')}<span class="observation-big">需 · 有所等待</span><p>${ready(l,r)?'内在刚健，前方有险。两种状态同时出现，才构成这里的“等待”。':'上三爻与下三爻，各提供一个观察的角度。'}</p></div></div>`;
      if(l.id==='connect') {const c=chapter(connectionSwapped?12:11);return `<div class="observation-board connect-board"><div class="exchange-figure"><span class="exchange-name">${c.name}</span><div class="exchange-trigram">${hex(c.bits.slice(3))}<span>上卦 · ${c.upper} / ${nature(c.upper)}</span></div><div class="exchange-flow" aria-hidden="true">${connectionSwapped?'↑　　↓':'↓　　↑'}</div><div class="exchange-trigram">${hex(c.bits.slice(0,3))}<span>下卦 · ${c.lower} / ${nature(c.lower)}</span></div></div><div class="observation-caption" aria-live="polite"><span class="observation-big">${connectionSwapped?'否 · 不相通':'泰 · 相交相通'}</span><p class="observation-quote">${connectionSwapped?'天地不交，而万物不通也。':'天地交，而万物通也。'}</p><p>${connectionSwapped?'天在上，地在下，各自远离。原书借“不交”说明闭塞。':'地在上，天在下。原书借二气相交，说明通达。'}</p><button class="button secondary" data-ex-swap>交换天地的位置 ⇅</button><a class="text-link" href="#read/${c.id}/1">查看${c.name}卦的《彖传》 ↗</a></div></div>`;}
      const changed=r.seen.includes(0),c=chapter(changed?24:2);
      return `<div class="observation-board return-board"><div><span class="tiny-label">${changed?'复卦 · 一阳在下':'坤卦 · 六爻皆阴'}</span>${lineButtons(c.bits,'return',r.seen,['初爻','·','·','·','·','·'])}</div><div class="observation-caption" aria-live="polite">${illustration('return')}<span class="observation-big">${changed?'一阳来复':'从最小的一步开始'}</span><p>${returnHint|| (changed?'最下面一爻变了，整卦便从坤走向复。一点变化，也有了新方向。':'找到最下方的初爻，点击它，把阴爻变成阳爻。')}</p><small>翻爻用于观察卦象结构。</small></div></div>`;
    }
    function journey(l) {
      const r=record(l),unlocked=r.choice===null?0:ready(l,r)?2:1;
      const steps=['入境','观象','会意'];
      const body=r.step===0?`<div class="scene-story"><span class="eyebrow">如果你正身处其中</span><h2 id="explore-stage-title" tabindex="-1">${l.title}</h2><p>${l.story}</p></div><h3 class="choice-question">${l.question}</h3><div class="scene-choices">${l.options.map(([label],i)=>`<button data-ex-choice="${i}" class="scene-choice ${r.choice===i?'chosen':''}" aria-pressed="${r.choice===i}"><span>${['A','B','C'][i]}</span>${label}<i>${r.choice===i?'✓':'→'}</i></button>`).join('')}</div>${r.choice!==null?`<div class="scene-response" role="status"><span>换个角度想一想</span><p>${l.options[r.choice][1]}</p><p class="response-bridge">${l.bridge}</p></div>`:'<p class="explore-soft-hint">没有标准答案。先选一个最接近你当下想法的回应。</p>'}<div class="journey-actions"><span>先体会处境，再看古人如何观察。</span><button class="button primary" data-ex-next ${r.choice===null?'disabled':''}>去卦象里看看 →</button></div>`:
      r.step===1?`<div class="scene-story"><span class="eyebrow">动手，让卦象说话</span><h2 id="explore-stage-title" tabindex="-1">${l.observe}</h2><p>${l.bridge}</p></div>${observe(l,r)}<div class="discovery-progress" role="status"><span>${ready(l,r)?'✓ 你发现了':'已发现 '+r.seen.length+' / '+l.required.length}</span><p>${ready(l,r)?l.discovery:'按上面的提示试一试，每个动作都会带来一点新线索。'}</p></div><div class="journey-actions"><button class="text-link" data-ex-step="0">← 回看我的选择</button><button class="button primary" data-ex-next ${!ready(l,r)?'disabled':''}>带着发现，读一句原文 →</button></div>`:
      r.step===2?`<div class="scene-story"><span class="eyebrow">让发现与原典相遇</span><h2 id="explore-stage-title" tabindex="-1">${l.takeaway}</h2></div>${sourceCard(l)}<div class="explore-insight"><span>把它放进生活 · 学习引导</span><p>${l.insight}</p></div><label class="reflection-label" for="explore-reflection">${l.prompt}<small>可选，写给自己就好</small></label><textarea id="explore-reflection" class="explore-reflection" maxlength="2000" rows="3" placeholder="${l.placeholder}">${esc(r.reflection)}</textarea><span class="reflection-save-status" role="status">${r.reflection?'已随进度保存在本机':'输入即保存，可在这里继续修改'}</span><div class="journey-actions"><button class="text-link" data-ex-step="1">← 回到卦象</button><button class="button primary" data-ex-finish>收好这次探索 ✓</button></div>`:
      `<div class="journey-finished"><span class="finished-seal">有所悟</span><span class="eyebrow">${l.name} · 这一程已收好</span><h2 id="explore-stage-title" tabindex="-1">${l.takeaway}</h2><p>你已从一个生活选择，走到了${chapter(l.chapter).name}卦里的「${l.concept}」。</p><div class="finished-takeaway"><span>这次，我带走了</span><p>${esc(r.reflection||l.insight)}</p></div><div class="finished-actions"><a class="button primary" href="#explore/${lessons[(lessons.indexOf(l)+1)%lessons.length].id}">去下一段旅程 →</a><a class="button" href="#read/${l.chapter}/${l.section}">继续读${chapter(l.chapter).name}卦 ↗</a><button class="text-link" data-ex-step="2">回看与修改感悟</button></div><p class="muted">探索进度与感悟保存在本机，可随「我的笔记」中的学习备份导出。</p></div>`;
      return `<div class="explore-back"><a href="#explore/stories">← 全部旅程</a><span>${l.number} / ${l.name} · ${l.concept}</span><a href="#explore/lab">卦象实验室 ↗</a></div><div class="journey-layout"><aside class="journey-aside ${l.tone}"><span class="eyebrow">一段关于${l.tag.slice(2)}的旅程</span><h1>${l.name}</h1>${illustration(l.tone)}<p>${l.subtitle}</p><ol class="journey-steps">${steps.map((s,i)=>`<li><button data-ex-step="${i}" ${i>unlocked?'disabled':''} ${r.step===i?'aria-current="step"':''}><span>${r.step>i?'✓':String(i+1).padStart(2,'0')}</span><strong>${s}</strong><small>${['做一次选择','发现卦中之象','带走一点领悟'][i]}</small></button></li>`).join('')}</ol><small class="journey-autosave">进度自动保存 · 随时可以回来</small></aside><section class="journey-content" aria-label="探索步骤">${body}</section></div><p class="explore-provenance">情境、反馈和行动问题为本站学习引导，不是原书译文。引用文字保留 PDF 用字，可点击页码对照。</p>`;
    }
    function laboratory() {
      const c=chapterFor(book,labBits);
      return `<div class="explore-back"><a href="#explore">← 回到动手学易</a><span>自由探索 / 六爻之间</span></div><div class="page-heading"><span class="eyebrow">THE HEXAGRAM LAB</span><h1>只改一爻，会怎样？</h1><p>点击任意一条爻，观察卦名、上下卦与卦辞如何变化。六爻从下往上读。</p></div><div class="lab-presets"><span>换一个起点</span>${[1,2,11,12,24].map(id=>`<button class="chip ${c.id===id?'active':''}" data-ex-preset="${id}">${chapter(id).name}</button>`).join('')}</div><section class="lab-board"><div class="lab-controls"><span class="eyebrow">点击实线与断线，自由翻转</span>${lineButtons(labBits,'flip')}<div class="lab-controls-bottom"><button class="button" data-ex-undo ${!labHistory.length?'disabled':''}>← 撤销一步</button><button class="text-link" data-ex-reset>回到复卦</button></div><p class="lab-change" role="status">${labMessage}</p></div><div class="lab-result" aria-live="polite"><span class="eyebrow">第 ${String(c.id).padStart(2,'0')} 卦</span><h2>${c.name}<small>${c.title}</small></h2><div class="lab-composition"><span>上卦 · ${c.upper} / ${nature(c.upper)}</span><span>下卦 · ${c.lower} / ${nature(c.lower)}</span></div><span class="lot-label">经传原文 · 卦辞</span><p class="lab-judgment">${esc(c.judgment)}</p><span class="lot-label">书中白话</span><p class="lab-translation">${esc(c.translation)}</p><a class="button secondary" href="#read/${c.id}/0">读懂${c.name}卦 ↗</a><a class="text-link" href="#source/${c.page}">原书第 ${c.page} 页 ↗</a></div></section><div class="lab-hint"><span>试试这两条小路径</span><p>从坤开始，只翻初爻，遇见「复」。从乾开始，把上三爻依次翻成阴爻，遇见「泰」。</p><small>这里是卦象结构实验；生活情境中的含义，还需要结合卦辞、爻位与原书解释继续理解。</small></div>`;
    }
    function render(path='') {
      if(activeId!==path){activeId=path;dragonPosition=0;connectionSwapped=false;returnHint='';}
      if(path==='lab')return laboratory();
      const l=findLesson(path);
      return l?journey(l):overview();
    }
    function commit(l,changes) {
      const next={...record(l),...changes,updated:Date.now()};
      return update(l.id,next);
    }
    function redraw(selector,scroll=false) {
      refresh();
      const target=document.querySelector(selector||'#explore-stage-title');
      target?.focus({preventScroll:true});
      if(scroll)target?.scrollIntoView({block:'start',behavior:'instant'});
    }
    function discover(l,n) { commit(l,{seen:[...new Set([...record(l).seen,n])]}); }
    function changeLab(bits,message) {
      labHistory.push([...labBits]);if(labHistory.length>64)labHistory.shift();
      labBits=bits;labMessage=message;
    }
    function handleClick(el) {
      if(![...el.attributes].some(a=>a.name.startsWith('data-ex-')))return false;
      const d=el.dataset,l=findLesson(activeId),r=l?record(l):null;
      if(d.exChoice!==undefined&&l){commit(l,{choice:Number(d.exChoice)});redraw(`[data-ex-choice="${d.exChoice}"]`);}
      if(d.exNext!==undefined&&l){if((r.step===0&&r.choice!==null)||(r.step===1&&ready(l,r))){commit(l,{step:r.step+1});redraw(null,true);}}
      if(d.exStep!==undefined&&l){const step=Number(d.exStep),max=r.choice===null?0:ready(l,r)?2:1;if(step<=max){commit(l,{step});redraw(null,true);}}
      if(d.exDragon!==undefined&&l?.id==='begin'){dragonPosition=Number(d.exDragon);discover(l,dragonPosition);redraw(`[data-ex-dragon="${d.exDragon}"]`);}
      if(d.exReveal!==undefined&&l?.id==='wait'){discover(l,Number(d.exReveal));redraw(`[data-ex-reveal="${d.exReveal}"]`);}
      if(d.exSwap!==undefined&&l?.id==='connect'){connectionSwapped=!connectionSwapped;discover(l,1);redraw('[data-ex-swap]');}
      if(d.exReturn!==undefined&&l?.id==='return'){if(Number(d.exReturn)===0){returnHint='';discover(l,0);}else returnHint='这一爻也能改变卦象。这一程先试最下面的初爻；想任意翻转，可以去卦象实验室。';redraw(`[data-ex-return="${d.exReturn}"]`);}
      if(d.exFinish!==undefined&&l&&ready(l,r)&&r.choice!==null){const ok=commit(l,{step:3,completed:true});redraw(null,true);if(ok)toast('这一程的发现与感悟，已收好。');}
      if(d.exFlip!==undefined){const i=Number(d.exFlip),old=chapterFor(book,labBits),next=flip(labBits,i),c=chapterFor(book,next);changeLab(next,`${old.name} → ${c.name}：${['初','二','三','四','五','上'][i]}爻由${labBits[i]?'阳变阴':'阴变阳'}。`);redraw(`[data-ex-flip="${i}"]`);}
      if(d.exPreset!==undefined){const c=chapter(Number(d.exPreset));changeLab([...c.bits],`以${c.name}卦为起点。任选一爻，继续观察。`);redraw(`[data-ex-preset="${c.id}"]`);}
      if(d.exUndo!==undefined&&labHistory.length){labBits=labHistory.pop();labMessage=`撤销一步，回到${chapterFor(book,labBits).name}卦。`;redraw('[data-ex-undo]');}
      if(d.exReset!==undefined){changeLab([1,0,0,0,0,0],'回到复卦，再试一条新的路径。');redraw('[data-ex-reset]');}
      return true;
    }
    function handleInput(el) {
      if(el.id!=='explore-reflection')return;
      const l=findLesson(activeId);if(!l)return;
      const ok=commit(l,{reflection:el.value.slice(0,2000)});
      const status=document.querySelector('.reflection-save-status');
      if(status)status.textContent=ok?'已随进度保存在本机':'暂时无法写入浏览器，请导出学习备份';
    }
    const reflections=()=>lessons.filter(l=>record(l).reflection.trim()).sort((a,b)=>record(b).updated-record(a).updated);
    function journal() {
      const entries=reflections();
      if(!entries.length)return '';
      return `<section class="explore-journal"><div class="section-heading"><h2>探索手记</h2><a class="text-link" href="#explore">回到动手学易 ↗</a></div><div class="notes-grid">${entries.map(l=>`<article class="card note-card"><div class="note-meta"><span>${l.name} · ${l.concept}</span><span>${new Date(record(l).updated).toLocaleDateString('zh-CN')}</span></div><h3>${chapter(l.chapter).name}卦 · 我的发现</h3><p class="note-body">${esc(record(l).reflection)}</p><div class="note-card-bottom"><a class="text-link" href="#explore/${l.id}">回看这段旅程 ↗</a><a class="text-link" href="#read/${l.chapter}/${l.section}">回到原文 →</a></div></article>`).join('')}</div></section>`;
    }
    return {render,handleClick,handleInput,homeEntry,journal,hasReflections:()=>reflections().length>0};
  }
  return {lessons,blank,ready,normalize,merge,flip,chapterFor,create};
});
