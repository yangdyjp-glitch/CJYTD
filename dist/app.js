(() => {
'use strict';
const japanese=document.documentElement.lang==='ja';
const locale=japanese?'ja-JP':'zh-CN';
const messages=japanese?{
 pauseEffects:'アニメーションと操作効果を停止',resumeEffects:'アニメーションと操作効果を再開',
 resume:'動きを再開',pauseInteraction:'操作効果を停止',pause:'動きを停止',
 closeMenu:'メニューを閉じる',openMenu:'メニューを開く',
 theme:name=>name+'のテーマに切り替えました。',
 category:(name,photos)=>name+'：'+photos+'。すべての写真を表示しています。もう一度選択すると強調表示を解除できます。',
 clearCategory:'分類の強調表示を解除しました。すべての写真を表示しています。',
 clearHighlight:'分類の強調表示を解除しました。',
 detailChanged:'内容が変更されました。相談内容のまとめを再作成してください。',
 interestChanged:'相談分野が変更されました。相談内容のまとめを再作成してください。',
 required:'ご相談内容を簡単にご記入ください。',
 summary:(interest,detail)=>`中日青年人材発展協会 御中\n\nご相談の分野：${interest}\n\nご相談内容：\n${detail}\n\n連携方法や具体的な進め方について、ご相談させていただけますと幸いです。`,
 generated:'相談内容をまとめました。コピーまたはダウンロードして、協会へのお問い合わせにご利用ください。',
 copied:'コピーしました。協会へのメッセージに貼り付けてご利用ください。',
 copyFailed:'自動コピーできませんでした。選択中の内容を手動でコピーするか、相談メモをダウンロードしてください。',
 filename:'中日青年人材発展協会-相談メモ.txt',
 downloaded:'相談メモをダウンロードしました。お問い合わせの際にご利用ください。'
}:{
 pauseEffects:'暂停动态和交互效果',resumeEffects:'开启动态和交互效果',
 resume:'开启动效',pauseInteraction:'暂停交互',pause:'暂停动效',
 closeMenu:'关闭导航菜单',openMenu:'打开导航菜单',
 theme:name=>'已切换到'+name+'主题。',
 category:(name,photos)=>name+'：'+photos+'。全部照片仍在页面展示。再次点选可取消高亮。',
 clearCategory:'已取消分类高亮，全部照片仍在页面展示。',clearHighlight:'已取消分类高亮。',
 detailChanged:'内容已修改，请重新生成需求摘要。',interestChanged:'服务方向已更改，请重新生成需求摘要。',
 required:'请简要描述你的需求。',
 summary:(interest,detail)=>`致中日青年人才发展协会：\n\n我想了解：${interest}\n\n需求简述：\n${detail}\n\n期待进一步沟通合作方式与具体安排。`,
 generated:'需求摘要已生成，可复制或下载后联系协会。',copied:'已复制需求摘要，可粘贴到你与协会的沟通中。',
 copyFailed:'未能自动复制，请手动复制已选中的摘要，或下载需求单。',
 filename:'青发协-交流合作需求单.txt',downloaded:'需求单已生成下载，可保存后用于联系协会。'
};
// Relative links also work when index.html is opened directly from disk.
function updateLanguageLinks(){
 document.querySelectorAll('[data-language-link]').forEach(link=>{
  link.href=link.dataset.languageLink+window.location.hash;
 });
}
updateLanguageLinks();
window.addEventListener('hashchange',updateLanguageLinks);
const body=document.body;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
let effectsEnabled=true;
let motionEnabled=!reducedMotion.matches;
let syncSectionMotion=()=>{};
let countAnimationFrame=0;
const motionToggle=document.getElementById('motion-toggle');
const motionLabel=document.getElementById('motion-label');
const hero=document.querySelector('.hero');
const header=document.getElementById('site-header');
const progress=document.getElementById('reading-progress');
function updateMotion(enabled){
 effectsEnabled=Boolean(enabled);
 motionEnabled=effectsEnabled&&!reducedMotion.matches;
 body.classList.toggle('motion-paused',!motionEnabled);
 body.classList.toggle('interaction-paused',!effectsEnabled);
 document.documentElement.style.scrollBehavior=motionEnabled?'':'auto';
 motionToggle.setAttribute('aria-pressed',String(!effectsEnabled));
 motionToggle.setAttribute('aria-label',effectsEnabled?messages.pauseEffects:messages.resumeEffects);
 motionLabel.textContent=!effectsEnabled?messages.resume:reducedMotion.matches?messages.pauseInteraction:messages.pause;
 motionToggle.disabled=false;
 if(!motionEnabled){
  ['--pointer-x','--pointer-y','--hero-drift','--hero-copy-drift'].forEach(p=>hero.style.setProperty(p,'0px'));
  document.querySelectorAll('[data-parallax]').forEach(frame=>frame.style.setProperty('--photo-y','0px'));
  document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=Number(el.dataset.count).toLocaleString(locale);});
 }
 syncSectionMotion();
}
updateMotion(effectsEnabled);
motionToggle.addEventListener('click',()=>updateMotion(!effectsEnabled));
reducedMotion.addEventListener('change',()=>updateMotion(effectsEnabled));
const menuButton=document.querySelector('.menu-button');
const navigation=document.getElementById('main-nav');
function setMenu(open){
 menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?messages.closeMenu:messages.openMenu);
 navigation.classList.toggle('is-open',open);header.classList.toggle('menu-is-open',open);body.classList.toggle('menu-open',open);
 document.getElementById('main').inert=open;document.querySelector('.site-footer').inert=open;
}
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
window.matchMedia('(min-width: 851px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});
const themeButtons=[...document.querySelectorAll('[data-theme-button]')];
const scenes=[...document.querySelectorAll('[data-scene]')];
const announcement=document.getElementById('theme-announcement');
let currentTheme='youth';
function selectTheme(index,focus=false,announce=false){
 const selected=themeButtons[index],nextTheme=selected.dataset.themeButton;
 if(nextTheme!==currentTheme){
  currentTheme=nextTheme;body.dataset.theme=nextTheme;
  themeButtons.forEach(button=>{const active=button===selected;button.classList.toggle('is-active',active);document.getElementById(button.getAttribute('aria-controls')).hidden=!active;});
  scenes.forEach(scene=>scene.classList.toggle('is-active',scene.dataset.scene===nextTheme));
  if(announce)announcement.textContent=messages.theme(selected.querySelector('.theme-word').textContent);
 }
 if(focus)selected.focus();
}
themeButtons.forEach((button,index)=>{
 button.addEventListener('pointerenter',event=>{if(finePointer.matches&&event.pointerType!=='touch')selectTheme(index);});
 button.addEventListener('focus',()=>selectTheme(index));
 button.addEventListener('click',()=>selectTheme(index,false,true));
 button.addEventListener('keydown',event=>{
  let next;if(event.key==='ArrowRight')next=(index+1)%themeButtons.length;if(event.key==='ArrowLeft')next=(index+themeButtons.length-1)%themeButtons.length;if(event.key==='Home')next=0;if(event.key==='End')next=themeButtons.length-1;
  if(next!==undefined){event.preventDefault();selectTheme(next,true,true);}
 });
});
let pointerFrame=0;
hero.addEventListener('pointermove',event=>{
 if(!motionEnabled||!finePointer.matches||event.pointerType==='touch')return;
 if(pointerFrame)cancelAnimationFrame(pointerFrame);
 pointerFrame=requestAnimationFrame(()=>{const b=hero.getBoundingClientRect();hero.style.setProperty('--pointer-x',(((event.clientX-b.left)/b.width-.5)*-12)+'px');hero.style.setProperty('--pointer-y',(((event.clientY-b.top)/b.height-.5)*-9)+'px');pointerFrame=0;});
},{passive:true});
hero.addEventListener('pointerleave',()=>{if(pointerFrame)cancelAnimationFrame(pointerFrame);pointerFrame=0;hero.style.setProperty('--pointer-x','0px');hero.style.setProperty('--pointer-y','0px');});
let scrollFrame=0;
const parallaxFrames=[...document.querySelectorAll('[data-parallax]')];
function renderScroll(){
 const y=window.scrollY;header.classList.toggle('is-scrolled',y>40);
 const range=document.documentElement.scrollHeight-window.innerHeight;
 progress.style.transform='scaleX('+(range>0?Math.min(1,Math.max(0,y/range)):0)+')';
 if(motionEnabled){
  if(y<hero.offsetHeight){hero.style.setProperty('--hero-drift',Math.min(y*.12,95)+'px');hero.style.setProperty('--hero-copy-drift',Math.min(y*.055,40)+'px');}
  const measurements=parallaxFrames.map(frame=>({frame,rect:frame.getBoundingClientRect()}));
  measurements.forEach(({frame,rect})=>{if(rect.top<window.innerHeight&&rect.bottom>0){const delta=(window.innerHeight/2-(rect.top+rect.height/2))/window.innerHeight,limit=Math.min(22,rect.height*.035);frame.style.setProperty('--photo-y',Math.max(-limit,Math.min(limit,delta*36))+'px');}});
 }
 scrollFrame=0;
}
function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(renderScroll);}
window.addEventListener('scroll',scheduleScroll,{passive:true});window.addEventListener('resize',scheduleScroll,{passive:true});renderScroll();
if('IntersectionObserver' in window){
 body.classList.add('motion-ready');
 const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}});},{threshold:.14});
 document.querySelectorAll('[data-reveal]').forEach(el=>revealObserver.observe(el));
 const chapterObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;document.querySelectorAll('[data-chapter-link]').forEach(link=>{const active=link.dataset.chapterLink===entry.target.dataset.chapter;link.classList.toggle('is-current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});});},{rootMargin:'-20% 0px -45% 0px',threshold:0});
 document.querySelectorAll('[data-chapter]').forEach(section=>chapterObserver.observe(section));
}

// Presentation effects repeat while visible; pause them offscreen or in a hidden tab.
// Reduced-motion users retain step-by-step color feedback without moving elements.
const countElements=[...document.querySelectorAll('[data-count]')];
function finishCounts(){
 cancelAnimationFrame(countAnimationFrame);countAnimationFrame=0;
 countElements.forEach(el=>{el.textContent=Number(el.dataset.count).toLocaleString(locale);});
}
function animateCounts(){
 cancelAnimationFrame(countAnimationFrame);
 if(!motionEnabled){finishCounts();return;}
 const start=performance.now();
 function drawCount(now){
  const t=Math.min((now-start)/1400,1),eased=1-Math.pow(1-t,3);
  countElements.forEach(el=>{el.textContent=Math.round(Number(el.dataset.count)*eased).toLocaleString(locale);});
  countAnimationFrame=t<1?requestAnimationFrame(drawCount):0;
 }
 countAnimationFrame=requestAnimationFrame(drawCount);
}
function createVisibleLoop(root,startCycle,stopCycle,duration,threshold=.18){
 let visible=false,running=false,timer=0;
 function cycle(){
  root.dataset.motionCycle=String(Number(root.dataset.motionCycle||0)+1);
  root.dataset.motionState='running';
  startCycle();
  timer=window.setTimeout(cycle,duration);
 }
 function sync(){
  const shouldRun=visible&&effectsEnabled&&!document.hidden;
  if(shouldRun&&!running){running=true;cycle();}
  else if(!shouldRun&&running){
   running=false;clearTimeout(timer);timer=0;stopCycle();
   root.dataset.motionState='paused';
  }
 }
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=threshold);
   sync();
  },{threshold});
  observer.observe(root);
 }else{visible=true;sync();}
 document.addEventListener('visibilitychange',sync);
 return sync;
}
function createSectionSequence(root,itemSelector){
 const items=[...root.querySelectorAll(itemSelector)];
 let stepTimers=[];
 function clearSteps(){stepTimers.forEach(clearTimeout);stepTimers=[];}
 function finish(){
  clearSteps();root.style.setProperty('--sequence-progress','1');
  items.forEach(item=>{item.classList.remove('is-active');item.classList.add('is-complete');});
  root.dataset.motionState='holding';
 }
 function play(){
  clearSteps();root.dataset.motionState='resetting';
  root.style.setProperty('--sequence-progress','0');
  items.forEach(item=>item.classList.remove('is-active','is-complete'));
  items.forEach((_,index)=>{
   stepTimers.push(window.setTimeout(()=>{
    root.dataset.motionState='running';
    items.forEach((item,i)=>{item.classList.toggle('is-active',i===index);item.classList.toggle('is-complete',i<index);});
    root.style.setProperty('--sequence-progress',String(index/Math.max(1,items.length-1)));
   },80+index*1000));
  });
  stepTimers.push(window.setTimeout(finish,80+items.length*1000));
 }
 return createVisibleLoop(root,play,finish,items.length*1000+2000);
}
const sequenceUpdates=[
 createSectionSequence(document.querySelector('[data-about-motion]'),'.about-direction'),
 createSectionSequence(document.querySelector('[data-process-flow]'),'.process-list li'),
 createVisibleLoop(document.getElementById('impact-grid'),animateCounts,finishCounts,8000,.35)
];
syncSectionMotion=()=>{
 sequenceUpdates.forEach(update=>update());
 if(!motionEnabled)finishCounts();
};
syncSectionMotion();
// Category previews share the existing photo layout; selecting never hides photos.
document.querySelectorAll('[data-category-navigation]').forEach(control=>{
 const chapter=control.closest('.chapter');
 const buttons=[...control.querySelectorAll('[data-category]')];
 const photos=[...chapter.querySelectorAll('[data-category-photo]')];
 const status=control.querySelector('.category-status');
 let selected=null;
 function render(key){
  const index=buttons.findIndex(button=>button.dataset.category===key);
  control.classList.toggle('has-category',index!==-1);
  if(index!==-1)control.style.setProperty('--category-index',String(index));
  buttons.forEach(button=>{
   button.classList.toggle('is-preview',button.dataset.category===key);
   button.setAttribute('aria-pressed',String(button.dataset.category===selected));
  });
  photos.forEach(photo=>photo.classList.toggle('is-category-match',photo.dataset.categoryPhoto===key));
 }
 buttons.forEach(button=>{
  button.addEventListener('pointerenter',event=>{
   if(finePointer.matches&&event.pointerType!=='touch')render(button.dataset.category);
  });
  button.addEventListener('click',()=>{
   selected=selected===button.dataset.category?null:button.dataset.category;
   render(selected);
   const matches=photos.filter(photo=>photo.dataset.categoryPhoto===selected);
   status.textContent=selected
    ?messages.category(button.querySelector('.category-name').textContent,matches.map(photo=>photo.querySelector('figcaption').textContent).join('、'))
    :messages.clearCategory;
  });
 });
 control.addEventListener('pointerleave',()=>render(selected));
 control.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   selected=null;render(null);status.textContent=messages.clearHighlight;
  }
 });
});

  const dialog = document.getElementById('intake-dialog');
  const form = document.getElementById('intake-form');
  const detail = document.getElementById('request-detail');
  const summary = document.getElementById('request-summary');
  const result = document.getElementById('summary-result');
  const status = document.getElementById('form-status');
  detail.addEventListener('invalid', () => {
    if (!detail.value.trim()) detail.setCustomValidity(messages.required);
  });
  let opener;
  document.querySelectorAll('[data-open-intake]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (opener) opener.focus();
  });
  detail.addEventListener('input', () => {
    detail.setCustomValidity('');
    if (!result.hidden) {
      result.hidden = true;
      status.textContent = messages.detailChanged;
    }
  });
  document.getElementById('interest').addEventListener('change', () => {
    if (!result.hidden) {
      result.hidden = true;
      status.textContent = messages.interestChanged;
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = detail.value.trim();
    if (!value) {
      detail.setCustomValidity(messages.required);
      detail.reportValidity();
      return;
    }
    summary.value = messages.summary(document.getElementById('interest').value,value);
    result.hidden = false;
    status.textContent = messages.generated;
    summary.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });
  document.getElementById('copy-summary').addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary.value);
      } else {
        summary.focus();
        summary.select();
        if (!document.execCommand('copy')) throw new Error('copy unavailable');
      }
      status.textContent = messages.copied;
    } catch {
      summary.focus();
      summary.select();
      status.textContent = messages.copyFailed;
    }
  });
  document.getElementById('download-summary').addEventListener('click', () => {
    const blob = new Blob(['\uFEFF', summary.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = messages.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = messages.downloaded;
  });

document.querySelectorAll('[data-interest]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('interest').value=button.dataset.interest;document.getElementById('summary-result').hidden=true;document.getElementById('form-status').textContent='';}));
document.getElementById('year').textContent=new Date().getFullYear();
})();
