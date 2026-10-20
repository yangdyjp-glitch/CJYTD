(() => {
'use strict';
const body=document.body;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
let motionEnabled=!reducedMotion.matches;
const motionToggle=document.getElementById('motion-toggle');
const motionLabel=document.getElementById('motion-label');
const hero=document.querySelector('.hero');
const header=document.getElementById('site-header');
const progress=document.getElementById('reading-progress');
function updateMotion(enabled){
 motionEnabled=Boolean(enabled)&&!reducedMotion.matches;
 body.classList.toggle('motion-paused',!motionEnabled);
 document.documentElement.style.scrollBehavior=motionEnabled?'':'auto';
 motionToggle.setAttribute('aria-pressed',String(!motionEnabled));
 motionToggle.setAttribute('aria-label',motionEnabled?'暂停动态效果':'开启动态效果');
 motionLabel.textContent=reducedMotion.matches?'已减少动态':motionEnabled?'暂停动效':'开启动效';
 motionToggle.disabled=reducedMotion.matches;
 if(!motionEnabled){
  ['--pointer-x','--pointer-y','--hero-drift','--hero-copy-drift'].forEach(p=>hero.style.setProperty(p,'0px'));
  document.querySelectorAll('[data-parallax]').forEach(frame=>frame.style.setProperty('--photo-y','0px'));
  document.querySelectorAll('[data-count]').forEach(el=>{el.textContent=Number(el.dataset.count).toLocaleString('zh-CN');});
 }
}
updateMotion(motionEnabled);
motionToggle.addEventListener('click',()=>updateMotion(!motionEnabled));
reducedMotion.addEventListener('change',()=>updateMotion(!reducedMotion.matches));
const menuButton=document.querySelector('.menu-button');
const navigation=document.getElementById('main-nav');
function setMenu(open){
 menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'关闭导航菜单':'打开导航菜单');
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
  themeButtons.forEach(button=>{const active=button===selected;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;document.getElementById(button.getAttribute('aria-controls')).hidden=!active;});
  scenes.forEach(scene=>scene.classList.toggle('is-active',scene.dataset.scene===nextTheme));
  if(announce)announcement.textContent='已切换到'+selected.querySelector('.theme-word').textContent+'主题。';
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
 let countsStarted=false;
 const countObserver=new IntersectionObserver(entries=>{
  if(countsStarted||!entries.some(entry=>entry.isIntersecting))return;countsStarted=true;countObserver.disconnect();
  const elements=[...document.querySelectorAll('[data-count]')],start=performance.now();
  function drawCount(now){const t=motionEnabled?Math.min((now-start)/1400,1):1,eased=1-Math.pow(1-t,3);elements.forEach(el=>{el.textContent=Math.round(Number(el.dataset.count)*eased).toLocaleString('zh-CN');});if(t<1)requestAnimationFrame(drawCount);}
  requestAnimationFrame(drawCount);
 },{threshold:.45});
 countObserver.observe(document.getElementById('impact-grid'));
}
const accordionButtons=[...document.querySelectorAll('.accordion-toggle')];
accordionButtons.forEach(button=>button.addEventListener('click',()=>{const next=button.getAttribute('aria-expanded')!=='true';accordionButtons.forEach(item=>{const expanded=item===button&&next;item.setAttribute('aria-expanded',String(expanded));document.getElementById(item.getAttribute('aria-controls')).hidden=!expanded;});}));
  const dialog = document.getElementById('intake-dialog');
  const form = document.getElementById('intake-form');
  const detail = document.getElementById('request-detail');
  const summary = document.getElementById('request-summary');
  const result = document.getElementById('summary-result');
  const status = document.getElementById('form-status');
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
      status.textContent = '内容已修改，请重新生成需求摘要。';
    }
  });
  document.getElementById('interest').addEventListener('change', () => {
    if (!result.hidden) {
      result.hidden = true;
      status.textContent = '服务方向已更改，请重新生成需求摘要。';
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = detail.value.trim();
    if (!value) {
      detail.setCustomValidity('请简要描述你的需求。');
      detail.reportValidity();
      return;
    }
    summary.value = `致中日青年人才发展协会：\n\n我想了解：${document.getElementById('interest').value}\n\n需求简述：\n${value}\n\n期待进一步沟通合作方式与具体安排。`;
    result.hidden = false;
    status.textContent = '需求摘要已生成，可复制或下载后联系协会。';
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
      status.textContent = '已复制需求摘要，可粘贴到你与协会的沟通中。';
    } catch {
      summary.focus();
      summary.select();
      status.textContent = '未能自动复制，请手动复制已选中的摘要，或下载需求单。';
    }
  });
  document.getElementById('download-summary').addEventListener('click', () => {
    const blob = new Blob(['\uFEFF', summary.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '青发协-交流合作需求单.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = '需求单已生成下载，可保存后用于联系协会。';
  });

document.querySelectorAll('[data-interest]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('interest').value=button.dataset.interest;document.getElementById('summary-result').hidden=true;document.getElementById('form-status').textContent='';}));
document.getElementById('year').textContent=new Date().getFullYear();
})();
