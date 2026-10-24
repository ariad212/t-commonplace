/* Intro v1. No libraries needed; only runs on homepage. */
(() => {
 const intro=document.getElementById('intro'); if(!intro)return;
 const object=document.getElementById('intro-object');
 const enter=document.getElementById('intro-enter');
 const skip=document.getElementById('intro-skip');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const storageKey='commonplace-intro-seen-v1';
 let running=false,finished=false;
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const sleep=async ms=>{await delay(ms);return !finished;};
 function finish(){ if(finished)return;finished=true; document.body.classList.remove('intro-active');intro.classList.add('intro-finished');try{sessionStorage.setItem(storageKey,'yes')}catch(e){};setTimeout(()=>intro.remove(),750); }
 if(reduce){finish();return;}
 try{if(sessionStorage.getItem(storageKey)==='yes'){finish();return}}catch(e){}
 document.body.classList.add('intro-active');
 function motion(frames,options){return object.animate(frames,{fill:'forwards',...options}).finished.catch(()=>{});}
 async function start(){
  if(running||finished)return;running=true;enter.disabled=true;enter.textContent='A closer look…';
  // Flip forwards (around horizontal X axis): not a sideways spin.
  await motion([{transform:'rotateX(72deg) rotateZ(-9deg)'},{transform:'rotateX(205deg) rotateZ(3deg)',offset:.43},{transform:'rotateX(345deg) rotateZ(-3deg)',offset:.78},{transform:'rotateX(360deg) rotateZ(0deg)'}],{duration:1350,easing:'cubic-bezier(.22,.61,.2,1)'});
  if(finished)return;
  // A precarious coin-on-edge wobble resolves to a face-on circle.
  await motion([{transform:'rotateX(360deg) rotateZ(0deg)'},{transform:'rotateX(360deg) rotateY(15deg) rotateZ(7deg)',offset:.3},{transform:'rotateX(360deg) rotateY(-9deg) rotateZ(-4deg)',offset:.63},{transform:'rotateX(360deg) rotateY(0deg) rotateZ(0deg)'}],{duration:1050,easing:'ease-in-out'});
  if(finished)return;
  intro.classList.add('is-transforming');
  if(!await sleep(1600))return;
  // Reset before CSS takes over so zoom doesn't jump.
  object.getAnimations().forEach(a=>{try{a.commitStyles()}catch(e){}a.cancel()});
  object.style.transform='rotateX(0deg)';
  intro.classList.add('is-zooming');
  if(!await sleep(900))return;
  intro.classList.add('is-blinking');
  if(!await sleep(520))return;
  finish();
 }
 enter.addEventListener('click',start);
 skip.addEventListener('click',finish);
 intro.addEventListener('wheel',e=>{if(finished)return;e.preventDefault();start()},{passive:false});
 let y=null;
 intro.addEventListener('touchstart',e=>{y=e.touches[0]?.clientY??null},{passive:true});
 intro.addEventListener('touchend',e=>{if(y!==null && Math.abs((e.changedTouches[0]?.clientY??y)-y)>35)start();y=null},{passive:true});
 intro.addEventListener('keydown',e=>{if(['ArrowDown','PageDown','Enter',' '].includes(e.key)){e.preventDefault();start()}if(e.key==='Escape')finish()});
})();
