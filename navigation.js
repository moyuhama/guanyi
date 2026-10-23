'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YIJING_NAVIGATION=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const titles={home:'每日一签',draws:'我的签录',interpret:'起卦与解卦',explore:'动手学易',library:'六十四卦',basics:'易学入门',practice:'温故知新',notes:'我的笔记',search:'书中检索',source:'我的藏书'};
  const lessons={memory:'口诀认图',cards:'翻卡自测',bagua:'动手翻爻',lab:'卦象实验室',stories:'生活情境',begin:'初入新局',wait:'等待时机',connect:'打破隔阂',return:'重新开始'};
  function describe(hash,book){
    const [route='home',sub='',id='']=String(hash||'#home').slice(1).split('/'),root=route||'home';
    let crumbs=[{label:titles[root]||'每日一签'}],parent=root==='home'?null:'#home',group=root;
    if(root==='read'){
      const chapter=book.chapters.find(c=>c.id===Number(sub));
      crumbs=[{label:'六十四卦',href:'#library'},{label:chapter?.title||'卦文阅读'}];parent='#library';group='read/'+sub;
    }else if(root==='explore'&&sub){
      crumbs=[{label:'动手学易',href:'#explore'},{label:lessons[sub]||'情境探索'}];parent='#explore';group='explore/'+sub;
    }else if(root==='interpret'&&sub){
      crumbs=[{label:'起卦与解卦',href:'#interpret'}];parent='#interpret';group='interpret/'+sub;
      if(sub==='record'){crumbs.push({label:'我的卦记',href:'#interpret/history'},{label:'卦象解读'});parent='#interpret/history';group+='/'+id;}
      else crumbs.push({label:sub==='history'?'我的卦记':sub==='example'?'解卦示例':'起卦与解卦'});
    }else if(root==='draws')crumbs=[{label:'每日一签',href:'#home'},{label:'我的签录'}];
    else if(root==='source'&&sub){crumbs=[{label:'我的藏书',href:'#source'},{label:'原书第 '+Math.max(1,Math.min(212,Number(sub)||1))+' 页'}];parent='#source';}
    return {crumbs,parent,group,label:crumbs.at(-1).label};
  }
  function create({history,location,describe}){
    let current=null,pending=null,goingBack=false;
    const hash=()=>location.hash||'#home';
    function valid(value){return value&&typeof value.hash==='string'&&value.hash.startsWith('#')&&Number.isSafeInteger(value.index)&&value.index>=0&&Array.isArray(value.trail)&&value.trail.length<=80&&value.trail.every(t=>t&&typeof t.hash==='string'&&t.hash.startsWith('#')&&Number.isSafeInteger(t.index)&&t.index>=0&&t.index<value.index);}
    function write(value){current=value;try{history.replaceState({...history.state,guanyiNavigation:value},'');}catch(e){/* In-memory navigation remains usable if history state cannot be stored. */}}
    function sync(){
      const nextHash=hash(),stored=history.state?.guanyiNavigation;
      if(pending?.hash===nextHash){write(pending);pending=null;goingBack=false;return;}
      if(valid(stored)&&stored.hash===nextHash){current=stored;goingBack=false;return;}
      if(current?.hash===nextHash)return;
      const trail=current?(describe(current.hash).group===describe(nextHash).group?current.trail:[...current.trail,{hash:current.hash,index:current.index}]):[];
      write({hash:nextHash,index:current?current.index+1:0,trail:trail.slice(-80)});goingBack=false;
    }
    function target(){return current?.trail.at(-1)?.hash||describe(hash()).parent;}
    function back(){
      if(goingBack)return false;
      const previous=current?.trail.at(-1),fallback=describe(hash()).parent;
      if(previous){goingBack=true;history.go(previous.index-current.index);return true;}
      if(fallback&&fallback!==hash()){
        // Replace a direct-entry page when returning to its parent, avoiding a loop.
        pending={hash:fallback,index:current?.index||0,trail:[]};goingBack=true;location.replace(fallback);return true;
      }
      return false;
    }
    return {sync,target,back};
  }
  return {describe,create};
});
