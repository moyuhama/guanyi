'use strict';
(function(root,factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.YIJING_READER_GUIDE=api;
})(typeof window!=='undefined'?window:globalThis,function() {
  const ranks=['初','二','三','四','五','上'];
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function lineName(bits,index) {
    const yinYang=bits[index]?'九':'六';
    return index===0?'初'+yinYang:index===5?'上'+yinYang:yinYang+ranks[index];
  }
  function lineIndex(title) {
    const match=String(title).replace(/\s/g,'').match(/^(?:文言·)?(初[九六]|[九六][二三四五]|上[九六])(?:曰)?$/);
    if(!match)return null;
    const name=match[1];
    return name[0]==='初'?0:name[0]==='上'?5:ranks.indexOf(name[1]);
  }
  function sectionForLine(c,index) {
    return c.sections.findIndex(s=>s.title===lineName(c.bits,index));
  }
  function describe(book,c,index) {
    const section=c.sections[index]||c.sections[0],line=lineIndex(section.title);
    const t=name=>book.trigrams.find(t=>t.name===name);
    const whole=section.title==='用九'||section.title==='用六';
    if(line!==null) {
      const name=lineName(c.bits,line),part=line<3?'下卦':'上卦',trigram=t(line<3?c.lower:c.upper);
      return {line,whole:false,title:`${name} · 第 ${line+1} 爻 · ${c.bits[line]?'阳爻':'阴爻'}`,
        detail:`从下往上数第 ${line+1} 条，位于${part}${trigram.name}（${trigram.nature}）。${c.bits[line]?'实线是阳爻，所以称「九」。':'断线是阴爻，所以称「六」。'}`};
    }
    return {line:null,whole,title:whole?`${section.title} · 六爻合看`:`${section.title} · 看整个卦象`,
      detail:whole?`这里谈的是${c.bits[0]?'六个阳爻':'六个阴爻'}的整体，不是第七爻。`:`下三爻为${c.lower}（${t(c.lower).nature}），上三爻为${c.upper}（${t(c.upper).nature}）。先认上下，再读${section.title}。`};
  }
  function figure(c,line=null,whole=false) {
    const label=`${c.title}，自下而上：${c.bits.map((b,i)=>lineName(c.bits,i)).join('、')}${line!==null?`；当前为${lineName(c.bits,line)}`:whole?'；六爻合看':''}`;
    return `<svg class="reader-hex-svg" viewBox="0 0 116 124" role="img" aria-label="${esc(label)}">${c.bits.map((b,i)=>{const y=9+(5-i)*19+(i<3?4:0),active=i===line||whole;return `<g class="${active?'figure-active':'figure-idle'}">${b?`<rect x="12" y="${y}" width="92" height="9" rx="1"/>`:`<rect x="12" y="${y}" width="39" height="9" rx="1"/><rect x="65" y="${y}" width="39" height="9" rx="1"/>`}${i===line?`<path d="M0 ${y-1}L8 ${y+4.5}L0 ${y+10}Z"/>`:''}</g>`;}).join('')}</svg>`;
  }
  function create({book,jump}) {
    let currentChapter=null,currentSection=0,expanded=false,frame=0,resizeObserver=null,dialogPage=1;
    const small=()=>window.matchMedia('(max-width:1100px)').matches;
    const q=selector=>document.querySelector(selector);
    const qa=selector=>[...document.querySelectorAll(selector)];
    const trigram=name=>book.trigrams.find(t=>t.name===name);
    function inline(c,index) {
      const d=describe(book,c,index);
      return `<div class="section-diagram">${figure(c,d.line,d.whole)}<div><strong>${esc(d.title)}</strong><p>${esc(d.detail)}</p></div></div>`;
    }
    function sidebar(c) {
      const group=(name,part,indices)=>`<div class="guide-trigram"><div class="guide-trigram-label"><strong>${part}卦 · ${name}</strong><span>${trigram(name).nature} · ${trigram(name).quality}</span></div><div class="guide-line-group">${indices.map(i=>`<a class="guide-line" href="#read/${c.id}/${sectionForLine(c,i)}" data-reader-section="${sectionForLine(c,i)}" data-line-index="${i}" aria-label="${lineName(c.bits,i)}，从下往上第 ${i+1} 爻，${c.bits[i]?'阳爻':'阴爻'}；阅读爻辞"><span class="guide-line-name">${lineName(c.bits,i)}</span><span class="guide-line-bar" aria-hidden="true"><i></i>${c.bits[i]?'':'<i></i>'}</span><span class="guide-line-kind">${c.bits[i]?'阳':'阴'}</span><span class="guide-line-cursor" aria-hidden="true">←</span></a>`).join('')}</div></div>`;
      return `<aside class="reader-companion" aria-label="卦图与章节对照"><section class="reader-guide" id="reader-guide"><div class="guide-summary"><div class="guide-mini" id="guide-mini">${figure(c)}</div><div class="guide-summary-copy"><span>卦象对照 · ${esc(c.title)}</span><strong id="guide-current-label">卦辞 · 看整个卦象</strong></div><button type="button" class="guide-toggle" data-reader-toggle aria-expanded="false" aria-controls="guide-full">展开卦图</button></div><div class="guide-full" id="guide-full"><div class="guide-direction"><span>上</span><span>点一条爻，读对应的爻辞</span></div><div class="guide-diagram">${group(c.upper,'上',[5,4,3])}${group(c.lower,'下',[2,1,0])}</div><div class="guide-direction bottom"><span>初</span><span>↑ 从最下面一爻向上读</span></div><div class="guide-reading-note"><strong id="guide-note-title"></strong><p id="guide-note-description"></p></div><div class="guide-key"><span><i class="guide-key-yang" aria-hidden="true"></i>阳爻称九</span><span><i class="guide-key-yin" aria-hidden="true"></i>阴爻称六</span></div><button class="button guide-source-button" data-reader-source="${c.page}">原书图文 · 第 <span id="guide-page-number">${c.page}</span> 页</button></div></section><details class="reader-index"><summary>本卦目录 <span>${c.sections.length} 节</span></summary><nav class="reader-section-links" aria-label="本卦章节">${c.sections.map((s,i)=>`<a href="#read/${c.id}/${i}" data-reader-section="${i}">${esc(s.title)}</a>`).join('')}</nav></details></aside>`;
    }
    function offset() {
      const header=q('.topbar')?.getBoundingClientRect().height||0;
      if(small())return header+(q('.guide-summary')?.getBoundingClientRect().height||82)+47+18;
      return header+(q('.reading-toolbar')?.getBoundingClientRect().height||70)+18;
    }
    function setExpanded(value) {
      expanded=value;
      const full=q('#guide-full'),toggle=q('[data-reader-toggle]');
      if(full)full.hidden=small()&&!expanded;
      if(toggle){toggle.setAttribute('aria-expanded',String(!small()||expanded));toggle.textContent=expanded?'收起卦图':'展开卦图';}
      q('.reader-companion')?.classList.toggle('is-expanded',small()&&expanded);
    }
    function setActive(index) {
      if(!currentChapter||!currentChapter.sections[index])return;
      currentSection=index;
      const c=currentChapter,s=c.sections[index],d=describe(book,c,index);
      q('#guide-mini').innerHTML=figure(c,d.line,d.whole);
      q('#guide-current-label').textContent=d.title;
      q('#guide-note-title').textContent=d.title;
      q('#guide-note-description').textContent=d.detail;
      qa('.guide-line').forEach(el=>{
        const active=Number(el.dataset.lineIndex)===d.line;
        el.classList.toggle('active',active);el.classList.toggle('whole-active',d.whole);
        if(active)el.setAttribute('aria-current','location');else el.removeAttribute('aria-current');
      });
      qa('.reader-section-links a').forEach(el=>{
        if(Number(el.dataset.readerSection)===index)el.setAttribute('aria-current','location');else el.removeAttribute('aria-current');
      });
      q('#guide-page-number').textContent=s.page;
      q('.guide-source-button').dataset.readerSource=String(s.page);
      q('#reader-guide').dataset.section=String(index);
    }
    function sync() {
      frame=0;if(!currentChapter||!q('#reader-guide'))return;
      const anchor=offset();
      q('.reader-layout').style.setProperty('--reader-anchor-offset',`${anchor}px`);
      const sections=qa('#reading-content .reading-section');
      let active=sections[0];
      for(const s of sections){if(s.getBoundingClientRect().top<=anchor+8)active=s;else break;}
      // A short final section cannot always reach the top of the viewport.
      if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2&&sections.length)active=sections[sections.length-1];
      if(active){const index=Number(active.dataset.sectionIndex);if(index!==currentSection)setActive(index);}
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
    function resize(){setExpanded(expanded);schedule();}
    function unmount() {
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',resize);
      if(frame)cancelAnimationFrame(frame);frame=0;
      resizeObserver?.disconnect();resizeObserver=null;currentChapter=null;
      const dialog=q('#reader-source-dialog');if(dialog?.open)dialog.close();
    }
    function mount(c,index=0) {
      unmount();currentChapter=c;currentSection=-1;expanded=false;
      setExpanded(false);setActive(c.sections[index]?index:0);
      q('.reader-layout').style.setProperty('--reader-anchor-offset',`${offset()}px`);
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize);
      if(typeof ResizeObserver!=='undefined'){resizeObserver=new ResizeObserver(schedule);resizeObserver.observe(q('.reading-article'));}
      // Wait until the router has restored the scroll position before tracking it.
      requestAnimationFrame(()=>{if(currentChapter===c)schedule();});
    }
    function scrollToSection(index) {
      const target=q(`#section-${index}`);if(!target)return false;
      setExpanded(false);const contents=q('.reader-index');if(contents)contents.open=false;
      setActive(index);
      q('.reader-layout').style.setProperty('--reader-anchor-offset',`${offset()}px`);
      window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset()),behavior:'instant'});
      target.querySelector('h2')?.focus({preventScroll:true});schedule();return true;
    }
    function afterMode() {
      if(!scrollToSection(currentSection)) {
        const first=q('#reading-content .reading-section');
        if(first)scrollToSection(Number(first.dataset.sectionIndex));
      }
      schedule();
    }
    function ensureDialog() {
      let dialog=q('#reader-source-dialog');if(dialog)return dialog;
      dialog=document.createElement('dialog');dialog.id='reader-source-dialog';dialog.setAttribute('aria-labelledby','reader-source-title');
      dialog.innerHTML=`<div class="reader-source-top"><div><span>原书图文对照</span><h2 id="reader-source-title"></h2></div><button class="icon-button" data-reader-close aria-label="关闭原书对照">×</button></div><div class="reader-source-controls"><button class="button" data-reader-page="-1">← 上一页</button><span id="reader-source-count"></span><button class="button" data-reader-page="1">下一页 →</button></div><div class="reader-source-body"><p class="reader-source-caption">原页保留书中的卦图与批注。点击页面可以单独打开、放大查看。</p><a id="reader-source-image-link" target="_blank" rel="noopener"><img id="reader-source-image" width="1132" height="1600" alt=""></a><p id="reader-source-error" hidden>原页图暂时无法加载，请打开下方的 PDF 对照。</p></div><div class="reader-source-bottom"><span>关闭后回到刚才的阅读位置</span><a id="reader-source-pdf" class="text-link" target="_blank" rel="noopener">打开 PDF ↗</a></div>`;
      document.body.append(dialog);
      dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
      q('#reader-source-image').addEventListener('error',()=>{q('#reader-source-error').hidden=false;});
      return dialog;
    }
    function showPage(page) {
      const dialog=ensureDialog();dialogPage=Math.max(1,Math.min(book.pages,page));
      const path=`assets/pdf-pages/${String(dialogPage).padStart(3,'0')}.webp`;
      q('#reader-source-title').textContent=`《傅佩荣解读易经》 · 第 ${dialogPage} 页`;
      q('#reader-source-count').textContent=`${dialogPage} / ${book.pages}`;
      q('#reader-source-image').src=path;q('#reader-source-image').alt=`原书第 ${dialogPage} 页图文原貌`;
      q('#reader-source-image-link').href=path;q('#reader-source-pdf').href=`${encodeURIComponent(book.pdf)}#page=${dialogPage}`;
      q('#reader-source-error').hidden=true;q('.reader-source-body').scrollTop=0;
      q('[data-reader-page="-1"]').disabled=dialogPage===1;q('[data-reader-page="1"]').disabled=dialogPage===book.pages;
      if(!dialog.open)dialog.showModal();
    }
    function handleClick(el,event) {
      const d=el.dataset;
      if(d.readerSection!==undefined&&currentChapter){event.preventDefault();jump(Number(d.readerSection));return true;}
      if(d.readerToggle!==undefined){setExpanded(!expanded);return true;}
      if(d.readerSource!==undefined){showPage(Number(d.readerSource));return true;}
      if(d.readerClose!==undefined){q('#reader-source-dialog')?.close();return true;}
      if(d.readerPage!==undefined){showPage(dialogPage+Number(d.readerPage));return true;}
      return false;
    }
    return {sidebar,inline,mount,unmount,handleClick,afterMode,scrollToSection,schedule,current:()=>currentSection};
  }
  return {lineName,lineIndex,sectionForLine,describe,figure,create};
});
