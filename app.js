'use strict';
(() => {
  // The router restores saved reading positions and explicit section links.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const book = window.YIJING_DATA;
  const Draw = window.YIJING_DRAW;
  const Explore = window.YIJING_EXPLORE;
  const ReaderGuide = window.YIJING_READER_GUIDE;
  const Learning = window.YIJING_LEARNING;
  const Interpret = window.YIJING_INTERPRET;
  const Navigation = window.YIJING_NAVIGATION;
  const navigation = Navigation.create({history,location,describe:hash=>Navigation.describe(hash,book)});
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY = 'guanyi.study.v1';
  const defaults = () => ({version:1,completed:[],bookmarks:[],notes:{},lastRead:1,visits:[],quizBest:0,fontSize:20,positions:{},draws:[],explorations:{},learning:Learning.blank(),interpretation:Interpret.blank()});
  const validId = n => Number.isInteger(n) && n >= 1 && n <= 64;
  function normalize(value) {
    if (!value || typeof value !== 'object' || value.version !== 1) throw new Error('不支持的数据格式');
    const data = defaults();
    for (const key of ['completed','bookmarks']) data[key] = [...new Set((Array.isArray(value[key]) ? value[key] : []).filter(validId))];
    data.lastRead = validId(value.lastRead) ? value.lastRead : 1;
    data.visits = (Array.isArray(value.visits) ? value.visits : []).filter(x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x));
    data.quizBest = Math.min(8, Math.max(0, Number(value.quizBest) || 0));
    data.fontSize = Math.min(26, Math.max(18, Number(value.fontSize) || 20));
    for (const [id, n] of Object.entries(value.notes || {})) if (validId(Number(id)) && n && typeof n.text === 'string') data.notes[id] = {text:n.text.slice(0,20000),updated:Number(n.updated) || Date.now()};
    for (const [id, pos] of Object.entries(value.positions || {})) if (validId(Number(id)) && Number.isFinite(pos) && pos >= 0) data.positions[id] = pos;
    data.draws = Draw.normalize(value.draws);
    data.explorations = Explore.normalize(value.explorations);
    data.learning = Learning.normalize(value.learning);
    data.interpretation = Interpret.normalize(value.interpretation);
    return data;
  }
  let storageAvailable = true, state = defaults();
  try { const raw=localStorage.getItem(KEY); if(raw) state=normalize(JSON.parse(raw)); } catch(e) { storageAvailable=false; }
  const localDate = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  let toastTimer;
  function toast(message) { const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000); }
  function save() { try {localStorage.setItem(KEY,JSON.stringify(state));storageAvailable=true;return true;} catch(e) {storageAvailable=false;toast('浏览器无法保存，请导出备份以保留记录');return false;} }
  const paths={home:'<path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-8h6v8"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',book:'<path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v15"/>',repeat:'<path d="M20 7a8 8 0 0 0-13-3L3 7m0-5v5h5M4 17a8 8 0 0 0 13 3l4-3m0 5v-5h-5"/>',pen:'<path d="m15 4 5 5-11 11-6 1 1-6Z"/><path d="m12 7 5 5m0-10 5 5"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',check:'<path d="m5 12 4 4L20 5"/>',leaf:'<path d="M4 20c-3-11 4-17 16-16 0 13-5 16-13 13m-3 3L15 9"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>'};
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.book}</svg>`;
  const arrow = icon('arrow');
  const byId = id => book.chapters.find(c=>c.id===Number(id));
  const tri = name => book.trigrams.find(t=>t.name===name);
  const hex = (bits, size='') => `<span class="hexagram ${size}" role="img" aria-label="自下而上：${bits.map(b=>b?'阳':'阴').join('、')}">${bits.map(b=>`<span class="yao"><i></i>${b?'':'<i></i>'}</span>`).join('')}</span>`;
  const pageLink = p => `#source/${p}`;
  const pdfLink = p => `${encodeURIComponent(book.pdf)}#page=${p}`;
  const noteCount = () => Object.keys(state.notes).length;
  const explorer = Explore.create({book,hex,escape,getRecords:()=>state.explorations,update:(id,entry)=>{
    try { const stored=JSON.parse(localStorage.getItem(KEY)||'null');state.explorations=Explore.merge(state.explorations,stored?.explorations); } catch(e) { /* Preserve the in-memory journal if browser storage is unavailable. */ }
    state.explorations[id]=entry;return save();
  },refresh:()=>render({keepScroll:true}),toast});
  const learner = Learning.create({book,hex,escape,getRecord:()=>state.learning,update:next=>{
    try { const stored=JSON.parse(localStorage.getItem(KEY)||'null');state.learning=Learning.merge(state.learning,stored?.learning); } catch(e) { /* Keep local learning progress when storage cannot be read. */ }
    state.learning=Learning.merge(state.learning,next);return save();
  },refresh:()=>render({keepScroll:true})});
  const interpreter = Interpret.create({book,escape,getRecord:()=>state.interpretation,update:next=>{
    try { const stored=JSON.parse(localStorage.getItem(KEY)||'null');state.interpretation=Interpret.merge(state.interpretation,stored?.interpretation); } catch(e) { /* Keep the in-memory reading if storage is unavailable. */ }
    state.interpretation=Interpret.merge(state.interpretation,next);return save();
  },refresh:()=>render({keepScroll:true}),toast});
  function learningView(parts){
    const path=parts[1]||'';let param='';try{param=decodeURIComponent(parts[2]||'');}catch(e){}
    return ['','memory','cards','bagua'].includes(path)?learner.render(path,param):learner.nav(path==='lab'?'lab':'stories')+explorer.render(path==='stories'?'':path);
  }
  const pct = () => Math.round(state.completed.length/64*100);
  const navItems=[['home','home','每日一签'],['interpret','repeat','起卦与解卦'],['explore','leaf','动手学易'],['library','grid','六十四卦'],['basics','book','易学入门'],['practice','repeat','温故知新'],['notes','pen','我的笔记']];
  let routeName='home',activeRead=null,readMode='all',libraryFilter='all',upperFilter='',libraryQuery='',noteId=null,quiz=null,searchQuery='';
  const readerGuide = ReaderGuide.create({book,jump:index=>{
    if(!activeRead)return;
    savePosition();
    if(!$('#section-'+index))readMode='all';
    const target='#read/'+activeRead+'/'+index;
    if(location.hash===target){if(!$('#section-'+index))render({keepScroll:true});readerGuide.scrollToSection(index);}
    else location.hash=target;
  }});
  const pageHeading = (en,title,description,extra='') => `<div class="page-heading heading-flex"><div><span class="eyebrow">${en}</span><h1>${title}</h1><p>${description}</p></div>${extra}</div>`;
  function updateSearchChrome(){
    const form=$('#global-search'),active=routeName==='search'||Boolean($('#global-query').value)||form.contains(document.activeElement);
    $('#cancel-search').hidden=!active;
    form.querySelector('kbd').hidden=active;
    $('.topbar').classList.toggle('search-active',active);
  }
  function cancelSearch(){
    $('#global-query').value='';searchQuery='';
    $('#main').focus({preventScroll:true});
    if(routeName==='search')navigation.back();
    updateSearchChrome();
  }
  function updateChrome() {
    const active=routeName==='read'?'library':routeName==='draws'?'home':routeName;
    $('#navigation').innerHTML=navItems.map(([id,ic,label])=>`<a class="nav-link ${active===id?'active':''}" href="#${id}" ${active===id?'aria-current="page"':''}>${icon(ic)}<span>${label}</span>${active===id?'<i class="nav-dot"></i>':''}</a>`).join('');
    const titles={home:'每日一签',draws:'我的签录',interpret:'起卦与解卦',explore:'动手学易',library:'六十四卦',basics:'易学入门',practice:'温故知新',notes:'我的笔记',read:'六十四卦 / 静心阅读',search:'书中检索',source:'我的藏书'};
    const context=Navigation.describe(location.hash,book),backTarget=navigation.target();
    $('#breadcrumb').innerHTML=context.crumbs.map((crumb,i)=>`${i?'<span class="crumb-separator" aria-hidden="true">/</span>':''}${crumb.href?`<a class="breadcrumb-item" href="${escape(crumb.href)}">${escape(crumb.label)}</a>`:`<span class="breadcrumb-item" aria-current="page" title="${escape(crumb.label)}">${escape(crumb.label)}</span>`}`).join('');
    $('#page-back').disabled=!backTarget;
    $('#page-back').setAttribute('aria-label',backTarget?'返回'+Navigation.describe(backTarget,book).label:'已经在首页');
    $('#page-back').title=backTarget?'返回'+Navigation.describe(backTarget,book).label:'已经在首页';
    updateSearchChrome();
    $('#side-count').textContent=`${state.completed.length} / 64`;
    $('#side-progress').style.width=`${pct()}%`;
    document.documentElement.style.setProperty('--reading-size',`${state.fontSize}px`);
    document.title=`${routeName==='read'?byId(activeRead)?.title:titles[routeName]||'学习书房'} · 观易`;
  }
  let selectedDrawId=null, drawing=false, homeDay=Draw.dayKey();
  const drawDate = entry => new Date(`${entry.day}T12:00:00`).toLocaleDateString('zh-CN',{month:'long',day:'numeric'});
  const drawTime = entry => new Date(entry.createdAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
  function currentDraw() { return state.draws.find(entry=>entry.id===selectedDrawId) || Draw.today(state.draws); }
  function stickArt() {
    return `<div class="lot-art ${drawing?'is-drawing':''}" aria-hidden="true"><div class="lot-orbit orbit-one"></div><div class="lot-orbit orbit-two"></div><span class="orbit-word word-east">静</span><span class="orbit-word word-west">观</span><div class="lot-still-life"><div class="incense-shadow"></div><div class="lot-sticks">${[-30,-21,-12,-4,5,14,23,32].map((angle,i)=>`<i class="bamboo-stick stick-${i}" style="--tilt:${angle}deg;--rise:${[17,4,23,11,30,7,19,2][i]}px"><span>${['乾','坤','震','巽','坎','离','艮','兑'][i]}</span></i>`).join('')}<i class="bamboo-stick chosen-stick"><span>易</span></i></div><div class="lot-vessel"><span class="vessel-rim"></span><span class="vessel-inscription">观易</span><span class="vessel-seal">日有所悟</span></div></div><span class="art-footnote">六 十 四 卦 · 一 签 一 会</span></div>`;
  }
  function drawRitual() {
    return `<section class="daily-ritual ${drawing?'is-drawing':''}" aria-busy="${drawing}"><div class="daily-intro"><span class="eyebrow">A MOMENT WITH THE I CHING</span><h1>静心片刻，<br>遇见今日一签。</h1><p>把纷杂暂且放下，心中留一件想思考的事。<br>从六十四卦中抽取一签，让古人的智慧，<br>成为今天的一点启发。</p><button class="button draw-button" data-draw ${drawing?'disabled':''}>${drawing?'<span class="draw-spinner"></span> 正在抽签…':'抽取今日签 '+arrow}</button><span class="draw-caption" role="status">${drawing?'签筒轻摇，静候一卦。':'一签为引，读易为伴。'}</span></div>${stickArt()}<div class="ritual-steps"><span><i>01</i> 静心 · 留一个念头</span><span><i>02</i> 抽签 · 遇一重卦象</span><span><i>03</i> 读易 · 得一点体悟</span></div></section>`;
  }
  function excerpt(text, limit=190) {
    if(text.length<=limit)return text;
    const fragment=text.slice(0,limit),end=fragment.lastIndexOf('。');
    return (end>55?fragment.slice(0,end+1):fragment)+'…';
  }
  function drawResult(entry) {
    const c=byId(entry.chapterId),today=Draw.today(state.draws),isLatest=entry.id===today?.id;
    const explanation=c.sections[0].blocks.find(b=>b.type==='commentary')?.text||'';
    const dateLabel=entry.day===Draw.dayKey()?'今日':drawDate(entry);
    const recordLabel=isLatest?'今日签已收好':'签录回顾';
    return `<section class="daily-result" aria-label="抽签结果"><div class="result-ticket"><span class="ticket-kicker">${recordLabel}</span><span class="ticket-number">第 ${String(c.id).padStart(2,'0')} 卦</span>${hex(c.bits,'large')}<h1 id="draw-result-title" tabindex="-1">${c.name}</h1><span class="ticket-title">${c.title}</span><span class="ticket-keyword">${c.keyword}</span><div class="ticket-bottom"><span>${c.upper}上${c.lower}下</span><span>${dateLabel} · ${drawTime(entry)}</span></div><span class="ticket-seal">观易</span></div><div class="result-reading"><div class="result-topline"><span class="eyebrow">与你相遇的这一卦</span><a href="${pageLink(c.page)}" class="page-ref">原书第 ${c.page} 页 ↗</a></div><h2>${c.title}<span> · ${c.keyword}</span></h2>${learner.drawBridge(c)}<div class="lot-judgment"><span class="lot-label">签文 · 卦辞</span><p>${escape(c.judgment)}</p></div><div class="lot-translation"><span class="lot-label">白话</span><p>${escape(c.translation)}</p></div><details class="lot-explanation"><summary>读懂这一签 <span>书中解读节选</span></summary><p>${escape(excerpt(explanation,280))}</p><a class="text-link" href="#read/${c.id}/0">阅读全文 ${arrow}</a></details><div class="lot-reflection"><span>留给今天的一个问题</span><p>把「${c.keyword}」放进当下的生活，你会想到哪件事？</p></div><div class="result-actions"><a class="button primary" href="#read/${c.id}/0">细读这一卦 ${arrow}</a><button class="button" data-note="${c.id}">${icon('pen')}写下感悟</button><button class="button lot-bookmark ${state.bookmarks.includes(c.id)?'selected':''}" data-bookmark="${c.id}" aria-label="${state.bookmarks.includes(c.id)?'取消收藏这一卦':'收藏这一卦'}">${icon('bookmark')}${state.bookmarks.includes(c.id)?'已收藏':'收藏'}</button></div><div class="result-secondary"><span>${storageAvailable?'签录已保存在本机，随时可以回看。':'当前无法保存到浏览器，请及时导出备份。'}</span><div>${!isLatest?'<button class="text-link" data-draw-today>回到今日</button>':''}<button class="text-link" data-draw>再抽一签 ${icon('repeat')}</button></div></div></div></section>`;
  }
  function drawCard(entry) {
    const c=byId(entry.chapterId),current=currentDraw();
    return `<button class="card draw-record ${current?.id===entry.id?'current':''}" data-open-draw="${entry.id}"><span class="record-date">${entry.day===Draw.dayKey()?'今日':drawDate(entry)}<small>${drawTime(entry)}</small></span><span class="record-gua">${hex(c.bits,'small')}<span><strong>${c.name}</strong><small>${c.title}</small></span></span><span class="record-bottom">${c.keyword}<span>回看签文 ↗</span></span></button>`;
  }
  function home() {
    const entry=currentDraw(),latest=state.draws[0],date=new Date();
    homeDay=Draw.dayKey();
    return `<div class="daily-heading"><div><span class="eyebrow">日有所遇，心有所悟</span><h2>每日一签</h2></div><div class="daily-date"><strong>${String(date.getMonth()+1).padStart(2,'0')}<i>/</i>${String(date.getDate()).padStart(2,'0')}</strong><span>${date.toLocaleDateString('zh-CN',{year:'numeric',weekday:'long'})}</span></div></div>${entry&&!drawing?drawResult(entry):drawRitual()}<div class="daily-journal-line"><div>${latest?`<span>最近一签</span><button class="text-link" data-open-draw="${latest.id}">${drawDate(latest)} · ${byId(latest.chapterId).title}</button>`:'<span>抽签后，会自动保存到我的签录。</span>'}</div><a class="text-link" href="#draws">我的签录${state.draws.length?` · ${state.draws.length}`:''} ${arrow}</a></div>`;
  }
  function drawHistory() {
    return `${pageHeading('A JOURNAL OF ENCOUNTERS','我的签录','从偶然的一签，到日积月累的体悟。点击签录，重温当时遇见的卦。', '<a class="button secondary" href="#home">回到每日一签 '+arrow+'</a>')}<p class="source-notice">保留最近 ${Draw.LIMIT} 次抽签；再次抽签也会留下记录。签录随学习备份一起导出，可在「我的笔记」中备份与恢复。</p>${state.draws.length?`<div class="draw-history-grid all-draws">${state.draws.map(drawCard).join('')}</div>`:empty('静候第一签','抽签之后，每次结果都会自动收进这里。','#home','去抽一签')}`;
  }
  function startDraw() {
    if(drawing)return;
    // Read the latest records before appending, so an older tab keeps newer draws.
    try { const stored=JSON.parse(localStorage.getItem(KEY)||'null'); if(stored)state.draws=Draw.merge(state.draws,stored.draws||[]); } catch(e) { /* In-memory drawing still works when storage is unavailable. */ }
    const entry=Draw.draw();
    state.draws=Draw.merge([entry],state.draws);selectedDrawId=entry.id;save();
    drawing=true;render();
    const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100;
    window.setTimeout(()=>{drawing=false;if(routeName==='home'){render({keepScroll:true});$('#draw-result-title')?.focus({preventScroll:true});}},delay);
  }
  function guaCard(c){return `<a class="card gua-card" href="#read/${c.id}"><div class="gua-card-top">${hex(c.bits)}<span class="gua-num">${String(c.id).padStart(2,'0')}</span></div><h3>${c.name}</h3><div class="gua-title">${c.title} · ${c.upper}上${c.lower}下</div><div class="gua-card-bottom"><span>${c.keyword}</span><span class="gua-status">${state.completed.includes(c.id)?'✓ 已读':state.bookmarks.includes(c.id)?'◇ 已收藏':`第 ${c.page} 页`}</span></div></a>`;}
  function filteredChapters(){return book.chapters.filter(c=>(libraryFilter==='all'||libraryFilter==='upper'&&c.id<=30||libraryFilter==='lower'&&c.id>30||libraryFilter==='saved'&&state.bookmarks.includes(c.id)||libraryFilter==='done'&&state.completed.includes(c.id))&&(!upperFilter||c.upper===upperFilter)&&(!libraryQuery||(c.name+c.title+c.keyword).includes(libraryQuery)||String(c.id)===libraryQuery));}
  function library(){const chapters=filteredChapters();return `${pageHeading('SIXTY-FOUR HEXAGRAMS','六十四卦','依文王卦序，从乾坤到未济。每一卦，都是理解变化的一扇窗。',`<span class="tiny-label">已读 ${state.completed.length} 卦 · ${pct()}%</span>`)}<div class="filter-bar">${[['all','全部'],['upper','上经 · 30'],['lower','下经 · 34'],['saved','我的收藏'],['done','已读']].map(([v,t])=>`<button class="chip ${libraryFilter===v?'active':''}" data-filter="${v}" aria-pressed="${libraryFilter===v}">${t}</button>`).join('')}<select class="filter-select" id="upper-filter" aria-label="按上卦筛选"><option value="">上卦 · 全部</option>${book.trigrams.map(t=>`<option value="${t.name}" ${t.name===upperFilter?'selected':''}>${t.name} · ${t.nature}</option>`).join('')}</select><input id="library-query" class="filter-select" style="margin-left:0;width:135px" aria-label="按卦名或序号查找" placeholder="卦名 / 序号" value="${escape(libraryQuery)}"></div><div class="collection-meta"><span id="collection-count">共 ${chapters.length} 卦</span><span>卦画自下而上读</span></div><div id="gua-results">${chapters.length?`<div class="gua-grid">${chapters.map(guaCard).join('')}</div>`:empty('还没有找到卦象','试试其他筛选条件，或先读一卦并加入收藏。','#read/1','从乾卦开始')}</div>`;}
  const empty=(title,desc,href,label)=>`<div class="empty-state"><h3>${title}</h3><p>${desc}</p>${href?`<a class="button secondary" href="${href}">${label} ${arrow}</a>`:''}</div>`;
  const blockNames={original:'经传原文',translation:'白话译文',commentary:'书中解读'};
  function readerBlocks(c){return c.sections.map((s,i)=>{const blocks=s.blocks.filter(b=>readMode==='all'||b.type===readMode);return blocks.length?`<section class="reading-section" id="section-${i}" data-section-index="${i}"><div class="reading-section-heading"><h2 tabindex="-1">${s.title}</h2><button class="page-ref" data-reader-source="${s.page}">原书第 ${s.page} 页 · 看图文 ↗</button></div>${readerGuide.inline(c,i)}${blocks.map(b=>`<div class="reading-block ${b.type}"><span class="block-label">${blockNames[b.type]}</span>${b.text.split('\n\n').filter(Boolean).map(t=>`<p>${escape(t)}</p>`).join('')}</div>`).join('')}</section>`:'';}).join('');}

  function reader(c){if(!c)return empty('这一卦未找到','请选择第一至第六十四卦。','#library','返回卦目');
    return `<div class="reader-header"><div class="hex-tile">${hex(c.bits)}</div><div class="reader-heading"><span class="eyebrow">第 ${String(c.id).padStart(2,'0')} 卦 · ${c.id<=30?'上经':'下经'}</span><h1>${c.name}<small>${c.title} · ${c.keyword}</small></h1><p>${c.upper}上${c.lower}下 · PDF 第 ${c.page}–${c.endPage} 页</p></div><div class="reader-actions"><button class="button ${state.bookmarks.includes(c.id)?'selected':''}" data-bookmark="${c.id}">${icon('bookmark')}${state.bookmarks.includes(c.id)?'已收藏':'收藏'}</button><button class="button" data-note="${c.id}">${icon('pen')}记笔记</button><button class="button ${state.completed.includes(c.id)?'selected':'secondary'}" data-complete="${c.id}">${icon('check')}${state.completed.includes(c.id)?'已读完':'标记读完'}</button></div></div>
    <div class="reader-layout">${readerGuide.sidebar(c)}<article class="reading-article"><div class="reading-toolbar"><div class="reading-tabs" aria-label="阅读模式">${[['all','对照阅读'],['original','原文'],['translation','白话'],['commentary','解读']].map(([k,v])=>`<button class="chip ${readMode===k?'active':''}" data-mode="${k}" aria-pressed="${readMode===k}">${v}</button>`).join('')}</div><div class="font-controls"><button data-font="-1" aria-label="缩小字号">A−</button><span>字号</span><button data-font="1" aria-label="放大字号">A+</button></div></div><p class="source-notice">卦图与文字同步：点爻位跳到爻辞，往下阅读时高亮自动跟随。互卦、变卦等书中图示可点「看图文」对照原页。整理文字保留 PDF 用字及批注。</p><div id="reading-content">${readerBlocks(c)}</div>${state.notes[c.id]?`<div class="reading-note"><span class="eyebrow">我的思考</span><p>${escape(state.notes[c.id].text)}</p><button class="text-link" data-note="${c.id}">继续写笔记 ${arrow}</button></div>`:''}<div class="reader-pagination">${c.id>1?`<a class="button" href="#read/${c.id-1}">← ${byId(c.id-1).name}</a>`:'<span></span>'}<button class="button primary" data-complete="${c.id}">${state.completed.includes(c.id)?'✓ 已读完本卦':'读完了，记下这一程'}</button>${c.id<64?`<a class="button" href="#read/${c.id+1}">${byId(c.id+1).name} →</a>`:'<a class="button" href="#library">回到卦目 →</a>'}</div></article></div>`;
  }
  function basics(){return `${pageHeading('A GENTLE BEGINNING','易学入门','先认识符号，再读懂文字。不急着记住所有卦，先把最基本的两画看清。')}<div class="intro-lead"><div class="card intro-card"><span class="intro-symbol">${hex([1])}</span><div><h3>阳爻 <small class="muted">yáo</small></h3><p>一条完整的线，爻辞用「九」表示。</p></div></div><div class="card intro-card"><span class="intro-symbol">${hex([0])}</span><div><h3>阴爻</h3><p>一条中间断开的线，爻辞用「六」表示。</p></div></div></div><div class="section-heading"><h2>三爻成卦，八象初生</h2><a class="text-link" href="#source/2">参见前言 · 第 2 页 ↗</a></div><div class="tri-grid">${book.trigrams.map(t=>`<a class="card tri-card" href="#read/${t.id}">${hex(t.bits)}<div><h3>${t.name}<small>${t.pinyin}</small></h3><p>${t.nature} · ${t.quality}</p><small>阅读${t.name}卦 →</small></div></a>`).join('')}</div><section class="card composer"><div><span class="eyebrow">动手试一试</span><h2>两卦相重，变化由此展开</h2><label>上卦（外卦）<select id="compose-upper">${book.trigrams.map(t=>`<option value="${t.name}">${t.name} · ${t.nature}</option>`).join('')}</select></label><label>下卦（内卦）<select id="compose-lower">${book.trigrams.map(t=>`<option value="${t.name}">${t.name} · ${t.nature}</option>`).join('')}</select></label><p class="muted">八种上卦 × 八种下卦，组成六十四卦。</p></div><div class="composer-result" id="compose-result"></div></section><section class="card intro-article"><h3>一卦六爻，从下向上读</h3><p>六爻的位置依次是「初、二、三、四、五、上」。阳爻称九，阴爻称六：如最下面的阳爻叫「初九」，第二位的阴爻叫「六二」，最上面的阳爻叫「上九」。下三爻组成下卦，上三爻组成上卦。</p><p>读一卦时，可以先看卦画与卦名，读卦辞把握全卦，再逐爻阅读。遇到「彖传」，看它如何解释卦名、卦象与卦义；遇到「象传」，看它如何从自然之象引出人的行动。<a class="text-link" href="#source/4">参见第 4、6–7 页 ↗</a></p></section><section style="margin-top:29px"><div class="section-heading"><h2>再往深处，读《易传》</h2><span class="tiny-label">原书附篇</span></div><div class="supplements">${book.supplements.map(s=>`<a class="card supplement" href="${pageLink(s.page)}"><strong>${s.title}</strong><small>PDF 第 ${s.page} 页 ↗</small></a>`).join('')}</div></section>`;}
  function compose(){const upper=$('#compose-upper').value,lower=$('#compose-lower').value,c=book.chapters.find(c=>c.upper===upper&&c.lower===lower);$('#compose-result').innerHTML=`${hex(c.bits,'large')}<div><span class="eyebrow">第 ${c.id} 卦</span><h3>${c.title}</h3><p>${upper}上${lower}下 · ${c.keyword}</p><a class="button secondary" href="#read/${c.id}">阅读这一卦 ${arrow}</a></div>`;}
  function notes(){const entries=Object.entries(state.notes).sort((a,b)=>b[1].updated-a[1].updated);return `${pageHeading('THOUGHTS ALONG THE WAY','我的笔记','把经典中的一句话，放回自己的生活里。这里收藏你的每一次理解。',`<span class="tiny-label">${entries.length} 篇笔记 · ${state.completed.length} 卦已读</span>`)}<div class="notes-tools"><button class="button" data-export>${icon('download')}导出学习备份</button><button class="button" data-import>导入并合并备份</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><p class="source-notice">签录、八卦识记与复习、起卦记录与感悟、探索进度与感悟、笔记和收藏保存在当前浏览器。换浏览器或清除浏览器数据前，请导出备份。</p>${explorer.journal()}${entries.length?`<div class="notes-grid">${entries.map(([id,n])=>{const c=byId(id);return `<article class="card note-card"><div class="note-meta"><span>第 ${c.id} 卦 · ${c.keyword}</span><span>${new Date(n.updated).toLocaleDateString('zh-CN')}</span></div><h3>${c.title}</h3><p class="note-body">${escape(n.text)}</p><div class="note-card-bottom"><a class="text-link" href="#read/${c.id}">回到卦中 ${arrow}</a><button class="text-link" data-note="${id}">编辑</button><button class="text-link danger" data-delete-note="${id}">删除</button></div></article>`;}).join('')}</div>`:explorer.hasReflections()?'':empty('落笔之前，先读一卦','读到有所触动的地方，点「记笔记」，把你的想法留在这里。','#read/1','从乾卦开始')}`;}
  function practice(){return `${pageHeading('REVISIT & REFLECT','温故知新','用一组小练习，看看你是否认得八种基本卦象。答错也没关系，回到原文再看一遍。')}<div id="quiz-container">${quizView()}</div>`;}
  function quizView(){
    if(!quiz)return `<section class="card quiz-card"><span class="eyebrow">八卦识图 · 8 道练习</span><div class="quiz-figure">${hex([0,1,0],'large')}</div><h2>一眼看出，这是什么卦？</h2><p class="quiz-intro">观察三爻的阴阳组合，选出相应的卦名与自然意象。<br>不计时，慢慢想。每道题后都有解释。</p><button class="button primary" data-quiz-start>开始温习 ${arrow}</button><p class="muted" style="margin-top:22px">本地最好成绩：${state.quizBest} / 8</p></section>`;
    if(quiz.index>=8)return `<section class="card quiz-card"><span class="eyebrow">今日温习完成</span><h2>${quiz.score===8?'八象在心，继续读易。':'多看一遍，就多懂一点。'}</h2><div class="quiz-score">${quiz.score}<small> / 8</small></div><p class="quiz-intro">${quiz.score===8?'八种基本卦象全部答对。试着把上下卦组合起来，读懂一个六爻卦。':'回到八卦基础，对照爻画、卦名和自然意象，再试一次。'}</p><div class="source-actions" style="justify-content:center"><button class="button primary" data-quiz-start>再练一次</button><a class="button" href="#basics">回顾八卦</a></div></section>`;
    const q=quiz.questions[quiz.index],answered=quiz.answer!==null;
    return `<section class="card quiz-card"><div class="quiz-header"><span>识卦练习 ${quiz.index+1} / 8</span><span>已答对 ${quiz.score} 题</span></div><div class="progress-track"><i style="width:${quiz.index/8*100}%"></i></div><div class="quiz-figure">${hex(q.bits,'large')}</div><h2>这个卦象，代表什么？</h2><div class="quiz-options">${quiz.options.map(name=>{const t=tri(name);return `<button class="quiz-option ${answered&&name===q.name?'correct':answered&&name===quiz.answer?'wrong':''}" data-answer="${name}" ${answered?'disabled':''}>${name} · ${t.nature}</button>`;}).join('')}</div>${answered?`<div class="quiz-feedback"><strong>${quiz.answer===q.name?'答对了':'再记一次'} · ${q.name}为${q.nature}</strong><p>由下往上是${q.bits.map(x=>x?'阳':'阴').join('、')}。${q.description}</p><button class="button primary" data-quiz-next>${quiz.index===7?'查看结果':'下一题'} ${arrow}</button></div>`:'<p class="muted" style="margin-top:25px">提示：从最下面一爻开始观察。</p>'}</section>`;
  }
  const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function prepareQuestion(){const q=quiz.questions[quiz.index];if(q)quiz.options=shuffle([q.name,...shuffle(book.trigrams.filter(t=>t.name!==q.name)).slice(0,3).map(t=>t.name)]);quiz.answer=null;}
  function highlight(text,q){if(!q)return escape(text);return text.split(q).map(escape).join(`<mark>${escape(q)}</mark>`);}
  function search(){const q=searchQuery.trim();if(!q)return pageHeading('SEARCH THE BOOK','在书中寻找','在上方输入卦名、原文句子或关键词，开始检索。');
    const results=[];
    for(const c of book.chapters){const matched=c.sections.findIndex(s=>s.blocks.some(b=>b.text.includes(q)));if(matched!==-1||(c.name+c.title+c.keyword).includes(q)||String(c.id)===q){const section=c.sections[Math.max(0,matched)],text=section.blocks.map(b=>b.text).join(' '),index=text.indexOf(q),start=Math.max(0,index-35),excerpt=(start?'…':'')+text.slice(start,start+150)+'…';results.push({title:`${c.id}. ${c.title}`,meta:`${section.title} · ${c.keyword} · PDF 第 ${section.page} 页`,href:`#read/${c.id}/${Math.max(0,matched)}`,excerpt});}}
    for(const s of [book.preface,...book.supplements]){const index=s.text.indexOf(q);if(index!==-1||s.title.includes(q)){const start=Math.max(0,index-35);results.push({title:s.title,meta:`原书附篇 · PDF 第 ${s.page} 页`,href:pageLink(s.page),excerpt:(start?'…':'')+s.text.slice(start,start+150)+'…'});}}
    return `${pageHeading('SEARCH THE BOOK',`寻找「${escape(q)}」`,`找到 ${results.length} 个相关章节，检索范围包括前言、六十四卦与原书附篇。`)}${results.length?results.map(r=>`<a class="card search-result" href="${r.href}"><h3>${highlight(r.title,q)}</h3><div class="result-meta">${r.meta}</div><p>${highlight(r.excerpt,q)}</p></a>`).join(''):empty('还没有找到这句话','试着缩短关键词，或换一个卦名。PDF 中部分用字可能与常见版本不同。','#library','浏览六十四卦')}`;
  }
  let sourceMode='image',pageLoad=null,renderToken=0;
  function loadPages(){if(window.YIJING_PAGES)return Promise.resolve();if(!pageLoad)pageLoad=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/pages-data.js';s.onload=resolve;s.onerror=()=>{pageLoad=null;reject(new Error('无法加载原书文本'));};document.head.append(s);});return pageLoad;}
  function source(page){return `${pageHeading('YOUR LOCAL LIBRARY','书在手边，随时可读','这间书房以项目里的 PDF 为底本，六十四卦与附篇都可回到原页。')}<section class="card source-card"><div class="book-cover"><small>傅佩荣</small><strong>解读易经</strong></div><div><span class="eyebrow">本地藏书 · 全书 ${book.pages} 页</span><h2>傅佩荣解读易经</h2><p>包含前言、六十四卦，以及系辞、说卦、序卦、杂卦。<br>整理文本保留 PDF 中的用字及批注。文字提取不含卦图，校读请使用 PDF 原页。</p><div class="source-actions"><a class="button primary" href="${pdfLink(page)}" target="_blank" rel="noopener">打开 PDF 第 ${page} 页 ↗</a><button class="button" data-source-mode="${sourceMode==='text'?'image':'text'}">${sourceMode==='text'?'对照 PDF 原页':'切换整理文本'}</button></div></div></section><div class="page-controls">${page>1?`<a class="button" href="#source/${page-1}">← 上一页</a>`:'<span></span>'}<form id="page-jump"><label for="page-number">第</label><input id="page-number" type="number" value="${page}" min="1" max="212" required aria-label="PDF 页码"><span>/ 212 页</span><button class="button" type="submit">跳转</button></form>${page<212?`<a class="button" href="#source/${page+1}">下一页 →</a>`:'<span></span>'}</div>${sourceMode==='text'?`<div id="page-content" class="page-text">正在读取本地文本…</div>`:`<a class="facsimile" href="assets/pdf-pages/${String(page).padStart(3,'0')}.webp" target="_blank" rel="noopener" title="打开高清原页"><img src="assets/pdf-pages/${String(page).padStart(3,'0')}.webp" width="1132" height="1600" alt="傅佩荣解读易经 PDF 第 ${page} 页原貌"></a><p class="muted" style="margin-top:10px">点击原页可放大查看。页面图由本地 PDF 生成，完整文件可用上方按钮打开。</p>`}`;}
  function openNote(id){noteId=Number(id);const c=byId(noteId);$('#note-title').textContent=`${c.title} · 我的领悟`;$('#note-text').value=state.notes[noteId]?.text||'';$('#note-dialog').showModal();setTimeout(()=>$('#note-text').focus(),50);}
  function exportData(){const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`观易-学习备份-${localDate()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('学习备份已导出');}
  async function importData(file){if(!file)return;if(file.size>5*1024*1024){toast('备份文件过大，请选择观易导出的 JSON 文件');return;}try{const incoming=normalize(JSON.parse(await file.text()));state.completed=[...new Set([...state.completed,...incoming.completed])];state.bookmarks=[...new Set([...state.bookmarks,...incoming.bookmarks])];state.visits=[...new Set([...state.visits,...incoming.visits])];state.quizBest=Math.max(state.quizBest,incoming.quizBest);state.draws=Draw.merge(state.draws,incoming.draws);state.explorations=Explore.merge(state.explorations,incoming.explorations);state.learning=Learning.merge(state.learning,incoming.learning);state.interpretation=Interpret.merge(state.interpretation,incoming.interpretation);for(const [id,n] of Object.entries(incoming.notes)){if(!state.notes[id]||n.updated>state.notes[id].updated)state.notes[id]=n;}const persisted=save();render();toast(persisted?'备份已合并，重复笔记保留较新版本':'已合并到当前页面，请导出备份保留数据');}catch(e){toast('无法读取备份，请选择观易导出的有效 JSON 文件');}}
  function savePosition(){if(activeRead&&routeName==='read'){state.positions[activeRead]=window.scrollY;save();}}
  function render(options={}){
    navigation.sync();
    readerGuide.unmount();
    if(homeDay!==Draw.dayKey()){homeDay=Draw.dayKey();selectedDrawId=null;}
    const token=++renderToken,oldRead=activeRead,oldRoute=routeName;
    let parts=location.hash.slice(1).split('/');routeName=parts[0]||'home';
    if(!['home','library','basics','practice','notes','read','search','source','draws','explore','interpret'].includes(routeName))routeName='home';
    if(routeName!=='interpret')interpreter.stopMotion();
    activeRead=routeName==='read'&&validId(Number(parts[1]))?Number(parts[1]):null;
    if(activeRead){state.lastRead=activeRead;const day=localDate();if(!state.visits.includes(day))state.visits.push(day);save();}
    if(routeName==='search'){try{searchQuery=decodeURIComponent(parts.slice(1).join('/'));}catch(e){searchQuery='';}$('#global-query').value=searchQuery;}
    else if(oldRoute==='search'){searchQuery='';$('#global-query').value='';if($('#global-search').contains(document.activeElement))$('#main').focus({preventScroll:true});}
    const page=Math.max(1,Math.min(212,parseInt(parts[1],10)||1));
    const views={home,library,basics,practice,notes,interpret:()=>interpreter.render(parts),explore:()=>learningView(parts),draws:drawHistory,read:()=>reader(byId(activeRead)),search,source:()=>source(page)};
    const main=$('#main');main.innerHTML=views[routeName]();main.classList.remove('fade-in');void main.offsetWidth;main.classList.add('fade-in');
    updateChrome();$('#sidebar').classList.remove('open');$('#mobile-menu').setAttribute('aria-expanded','false');
    if(routeName==='basics')compose();
    if(activeRead)readerGuide.mount(byId(activeRead),Number(parts[2])||0);
    if(routeName==='source'&&sourceMode==='text')loadPages().then(()=>{if(token===renderToken&&$('#page-content'))$('#page-content').textContent=window.YIJING_PAGES[page-1];}).catch(e=>{if($('#page-content'))$('#page-content').textContent='整理文本加载失败，请使用上方按钮打开 PDF。';});
    if(!options.keepScroll){const section=routeName==='read'&&parts[2]!==undefined?Number(parts[2]):null;requestAnimationFrame(()=>{if(section!==null){readerGuide.scrollToSection(section);}else if(activeRead&&oldRead!==activeRead){window.scrollTo({top:state.positions[activeRead]||0,behavior:'instant'});}else if(oldRoute!==routeName||oldRead!==activeRead||routeName==='source'||routeName==='search'||routeName==='explore'||routeName==='interpret'){window.scrollTo({top:0,behavior:'instant'});}});}
  }
  document.addEventListener('click',e=>{
    const el=e.target.closest('button, a');if(!el)return;
    if(el.id==='cancel-search'){cancelSearch();return;}
    if(el.id==='page-back'){if(routeName==='search'){cancelSearch();return;}savePosition();if(navigation.back())el.disabled=true;return;}
    if(readerGuide.handleClick(el,e))return;
    if(interpreter.handleClick(el))return;
    if(learner.handleClick(el))return;
    if(explorer.handleClick(el))return;
    if(el.classList.contains('skip-link')){e.preventDefault();$('#main').focus();return;}
    if(el.matches('a[href^="#"]')){savePosition();if(el.getAttribute('href')===location.hash&&routeName!=='read'){window.scrollTo({top:0,behavior:'smooth'});}}
    if(el.classList.contains('search-result'))readMode='all';
    if(el.hasAttribute('data-draw'))startDraw();
    if(el.dataset.openDraw){selectedDrawId=el.dataset.openDraw;if(routeName==='home'){render();window.scrollTo({top:0,behavior:'smooth'});}else location.hash='home';}
    if(el.hasAttribute('data-draw-today')){selectedDrawId=null;render();}
    if(el.dataset.filter){libraryFilter=el.dataset.filter;render({keepScroll:true});}
    if(el.dataset.mode){readMode=el.dataset.mode;const c=byId(activeRead);$('#reading-content').innerHTML=readerBlocks(c);$$('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===readMode);b.setAttribute('aria-pressed',String(b.dataset.mode===readMode));});readerGuide.afterMode();}
    if(el.dataset.font){state.fontSize=Math.min(26,Math.max(18,state.fontSize+Number(el.dataset.font)));save();updateChrome();readerGuide.schedule();}
    if(el.dataset.bookmark){const id=Number(el.dataset.bookmark);state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();render({keepScroll:true});toast(state.bookmarks.includes(id)?'已加入收藏':'已取消收藏');}
    if(el.dataset.complete){const id=Number(el.dataset.complete);state.completed=state.completed.includes(id)?state.completed.filter(x=>x!==id):[...state.completed,id];save();render({keepScroll:true});toast(state.completed.includes(id)?'已记下这一程，愿有所悟。':'已恢复为未读');}
    if(el.dataset.note)openNote(el.dataset.note);
    if(el.dataset.deleteNote){const id=el.dataset.deleteNote;if(confirm(`删除「${byId(id).title}」的笔记？此操作无法撤销。`)){delete state.notes[id];save();render({keepScroll:true});toast('笔记已删除');}}
    if(el.hasAttribute('data-export'))exportData();
    if(el.hasAttribute('data-import'))$('#import-file').click();
    if(el.hasAttribute('data-quiz-start')){quiz={questions:shuffle(book.trigrams),index:0,score:0,answer:null,options:[]};prepareQuestion();$('#quiz-container').innerHTML=quizView();}
    if(el.dataset.answer&&quiz&&quiz.answer===null){quiz.answer=el.dataset.answer;if(quiz.answer===quiz.questions[quiz.index].name)quiz.score++;$('#quiz-container').innerHTML=quizView();}
    if(el.hasAttribute('data-quiz-next')&&quiz&&quiz.answer!==null){quiz.index++;if(quiz.index===8){state.quizBest=Math.max(state.quizBest,quiz.score);save();}else prepareQuestion();$('#quiz-container').innerHTML=quizView();}
    if(el.dataset.sourceMode){sourceMode=el.dataset.sourceMode;render({keepScroll:true});}
  });
  document.addEventListener('change',e=>{if(interpreter.handleChange(e.target))return;if(e.target.id==='upper-filter'){upperFilter=e.target.value;render({keepScroll:true});}if(['compose-upper','compose-lower'].includes(e.target.id))compose();if(e.target.id==='import-file')importData(e.target.files[0]);});
  document.addEventListener('input',e=>{if(interpreter.handleInput(e.target))return;explorer.handleInput(e.target);if(e.target.id==='library-query'){libraryQuery=e.target.value.trim();const chapters=filteredChapters();$('#collection-count').textContent=`共 ${chapters.length} 卦`;$('#gua-results').innerHTML=chapters.length?`<div class="gua-grid">${chapters.map(guaCard).join('')}</div>`:empty('还没有找到卦象','试试另一个卦名或序号。');}});
  $('#global-search').addEventListener('input',updateSearchChrome);
  $('#global-search').addEventListener('focusin',updateSearchChrome);
  $('#global-search').addEventListener('focusout',()=>requestAnimationFrame(updateSearchChrome));
  document.addEventListener('submit',e=>{if(e.target.id==='global-search'){e.preventDefault();const input=$('#global-query'),value=input.value.trim();if(!value){input.focus();return;}savePosition();input.value=value;input.blur();location.hash=`search/${encodeURIComponent(value)}`;}if(e.target.id==='page-jump'){e.preventDefault();location.hash=`source/${Math.max(1,Math.min(212,Number($('#page-number').value)||1))}`;}});
  $('#save-note').addEventListener('click',()=>{const text=$('#note-text').value.trim();if(!text){toast('先写下一点想法，再保存吧');return;}state.notes[noteId]={text,updated:Date.now()};const persisted=save();$('#note-dialog').close();render({keepScroll:true});if(persisted)toast('笔记已保存');});
  $('#note-dialog').addEventListener('click',e=>{if(e.target===$('#note-dialog'))$('#note-dialog').close();});
  $('#mobile-menu').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#mobile-menu').setAttribute('aria-expanded',String(open));});
  document.addEventListener('click',e=>{if(!e.target.closest('#sidebar,#mobile-menu')){$('#sidebar').classList.remove('open');$('#mobile-menu').setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented||e.isComposing||document.querySelector('dialog[open]'))return;
    const focused=document.activeElement,editing=['INPUT','TEXTAREA','SELECT'].includes(focused.tagName);
    if(e.key==='/'&&!editing){e.preventDefault();$('#global-query').focus();}
    if(e.key==='Escape'){
      if($('#sidebar').classList.contains('open')){$('#sidebar').classList.remove('open');$('#mobile-menu').setAttribute('aria-expanded','false');return;}
      if((!editing||focused.id==='global-query')&&(routeName==='search'||$('#global-search').contains(focused)||$('#global-query').value)){e.preventDefault();cancelSearch();}
    }
  });
  window.addEventListener('hashchange',()=>render());
  window.addEventListener('beforeunload',savePosition);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')savePosition();else checkNewDay();});
  function checkNewDay(){if(homeDay!==Draw.dayKey()){homeDay=Draw.dayKey();selectedDrawId=null;$('#top-date').textContent=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});if(routeName==='home'&&!drawing)render();}}
  window.setInterval(checkNewDay,30000);
  window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{state=normalize(JSON.parse(e.newValue));if(!drawing&&!$('#note-dialog').open&&!$('#reader-source-dialog')?.open&&!document.activeElement?.matches('#interp-question,#interp-reflection'))render({keepScroll:true});}catch(error){/* Ignore invalid external records. */}}});
  const syncHeaderHeight=()=>document.documentElement.style.setProperty('--app-header-height',`${$('.topbar').getBoundingClientRect().height}px`);
  if(window.ResizeObserver)new ResizeObserver(syncHeaderHeight).observe($('.topbar'));
  syncHeaderHeight();
  $('#search-icon').innerHTML=icon('search');$('#top-date').textContent=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});
  render();
  if(!storageAvailable)setTimeout(()=>toast('当前浏览器存储不可用，请用导出备份保留学习记录'),500);
})();
