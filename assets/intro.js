/* THE COMMONPLACE — Intro v3. All animation is local: no libraries or subscriptions.
   One canvas is BOTH the coin face and the final iris; there is no eye overlay. */
(() => {
  'use strict';
  const intro = document.getElementById('intro');
  if (!intro) return;
  const object = document.getElementById('intro-object');
  const coin = document.getElementById('intro-coin');
  const shadow = document.getElementById('intro-shadow');
  const canvas = document.getElementById('coin-surface');
  const ctx = canvas && canvas.getContext('2d');
  const enter = document.getElementById('intro-enter');
  const skip = document.getElementById('intro-skip');
  if (!ctx || !object || !coin || !shadow || !enter || !skip) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sessionKey = 'commonplace-intro-seen-v4';
  let running = false, finished = false, raf = 0;
  const C = 320, R = 307;
  const clamp = (v, a=0, b=1) => Math.min(b,Math.max(a,v));
  const mix = (a,b,t) => a+(b-a)*t;
  const smooth = t => {t=clamp(t);return t*t*(3-2*t)};
  const out = t => 1-Math.pow(1-clamp(t),3);
  const cubic = t => t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const seeded = i => ((Math.sin(i*127.1+91.7)*43758.5453)%1+1)%1;
  const fibres = Array.from({length:285},(_,i)=>({
    a:(i/285)*Math.PI*2,
    length:mix(170,239,seeded(i+7)),
    bend:mix(-.12,.12,seeded(i+73)),
    width:mix(.5,2.2,seeded(i+111)),
    alpha:mix(.13,.63,seeded(i+42)),
    color:['#d2aa7c','#4d4844','#968d83','#9e7754','#d2c3a9','#645348'][i%6]
  }));
  function circleFill(gradient){ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(C,C,R,0,Math.PI*2);ctx.fill();}
  function paint(m=0){
    m=smooth(m);
    ctx.clearRect(0,0,640,640);
    ctx.save();ctx.beginPath();ctx.arc(C,C,R,0,Math.PI*2);ctx.clip();
    // The physical coin, metallic with an engraved centre.
    const bronze=ctx.createRadialGradient(225,180,25,330,330,425);
    bronze.addColorStop(0,'#e7c4a2');bronze.addColorStop(.27,'#c79575');
    bronze.addColorStop(.64,'#ac755b');bronze.addColorStop(1,'#5e3f34');
    circleFill(bronze);
    if(m<1){
      ctx.globalAlpha=1-m;
      ctx.strokeStyle='#644634';ctx.lineWidth=13;
      ctx.beginPath();ctx.arc(C,C,285,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='#efd0aa';ctx.lineWidth=5;
      ctx.beginPath();ctx.arc(C,C,274,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='#6a4d3d';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(C,C,260,0,Math.PI*2);ctx.stroke();
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='normal 184px Georgia,serif';
      ctx.fillStyle='#6b4938';ctx.fillText('✳',C,C+10);
      ctx.globalAlpha=1;
    }
    // Rather than fading a second HTML element on top, redraw this SAME
    // disk each frame with increasingly biological colours and texture.
    if(m>0){
      ctx.globalAlpha=m;
      const iris=ctx.createRadialGradient(305,290,0,320,320,R);
      iris.addColorStop(0,'#252320');iris.addColorStop(.20,'#3f3731');
      iris.addColorStop(.29,'#73533e');iris.addColorStop(.44,'#ac8661');
      iris.addColorStop(.58,'#867c73');iris.addColorStop(.72,'#79644d');
      iris.addColorStop(.88,'#544e4a');iris.addColorStop(1,'#342f2b');
      circleFill(iris);
      for(const f of fibres){
        const a=f.a, inner=81+12*seeded(f.a*4000), end=f.length+48;
        const x1=C+inner*Math.cos(a), y1=C+inner*Math.sin(a);
        const x2=C+end*Math.cos(a+f.bend), y2=C+end*Math.sin(a+f.bend);
        ctx.beginPath();ctx.moveTo(x1,y1);
        ctx.quadraticCurveTo(C+170*Math.cos(a+f.bend*.75),C+170*Math.sin(a+f.bend*.75),x2,y2);
        ctx.strokeStyle=f.color;ctx.lineWidth=f.width;ctx.globalAlpha=m*f.alpha;ctx.stroke();
      }
      ctx.globalAlpha=m;
      const innerShadow=ctx.createRadialGradient(C,C,91,C,C,152);
      innerShadow.addColorStop(0,'#241f1d99');innerShadow.addColorStop(.7,'#3c2a1e30');innerShadow.addColorStop(1,'#231e1a00');
      circleFill(innerShadow);
      const pupilRadius=mix(4,110,m);
      const pupil=ctx.createRadialGradient(303,295,9,C,C,pupilRadius);
      pupil.addColorStop(0,'#100f0e');pupil.addColorStop(.78,'#161513');pupil.addColorStop(1,'#342920');
      ctx.fillStyle=pupil;ctx.beginPath();ctx.arc(C,C,pupilRadius,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#49362a';ctx.lineWidth=7*m;ctx.stroke();
      ctx.globalAlpha=m*.48;
      ctx.fillStyle='#fbebd1';ctx.beginPath();ctx.ellipse(252,250,20,27,-.4,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
    // A shared circle boundary, changing metal -> iris rather than duplicating faces.
    ctx.strokeStyle=m>.6?'#39342e':'#634535';ctx.globalAlpha=.9;
    ctx.lineWidth=mix(9,3,m);ctx.beginPath();ctx.arc(C,C,R-5,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    const metallic=1-m;
    coin.querySelector('.coin-back').style.opacity=metallic;
    coin.querySelector('.coin-edge').style.opacity=metallic;
  }
  paint(0);
  function finish(){
    if(finished)return;
    finished=true;cancelAnimationFrame(raf);
    document.body.classList.remove('intro-active');
    intro.classList.add('intro-finished');
    try{sessionStorage.setItem(sessionKey,'yes')}catch(e){}
    if(intro.contains(document.activeElement))document.activeElement.blur();
    window.setTimeout(()=>intro.remove(),750);
  }
  if(reduce){finish();return;}
  try{if(sessionStorage.getItem(sessionKey)==='yes'){finish();return;}}catch(e){}
  intro.classList.add('is-ready');
  document.body.classList.add('intro-active');
  const FLIP=4200, LAND=420, ROLL=1120, SETTLE=660, MORPH=2050, ZOOM=1120, BLINK=700;
  const at={ land:FLIP, roll:FLIP+LAND, settle:FLIP+LAND+ROLL,
    morph:FLIP+LAND+ROLL+SETTLE, zoom:FLIP+LAND+ROLL+SETTLE+MORPH,
    blink:FLIP+LAND+ROLL+SETTLE+MORPH+ZOOM};
  let startTime=0;
  const drawMotion=(x,y,pitch,roll,yaw=0,scale=1)=>{
    object.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotateZ(${roll.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    shadow.style.transform=`translateX(${(x*.87).toFixed(2)}px) scale(${(scale>2?1:mix(.7,1.15,clamp(y/45))).toFixed(3)})`;
    shadow.style.opacity=(scale>2?0:clamp(mix(.22,.65,clamp(y/45)))).toFixed(3);
  };
  const lerpT=(time,start,len)=>clamp((time-start)/len);
  function frame(now){
    if(finished)return;
    const t=now-startTime;
    if(t < at.land){
      // Forward, not sideways: ~three full X-axis revolutions.
      const u=lerpT(t,0,FLIP),p=cubic(u);
      drawMotion(-84*smooth(u),40*smooth(u)-139*Math.sin(Math.PI*u),72+1008*p,-13*smooth(u),2*Math.sin(u*Math.PI*5));
    } else if(t < at.roll){
      // Impact on the rim: compression, a little bounce, then contact.
      const u=lerpT(t,at.land,LAND);
      const bounce=Math.sin(Math.PI*u);
      drawMotion(-84,40+12*Math.sin(u*Math.PI*2)-16*bounce,1080,-13,3*Math.sin(u*Math.PI*2),1-.027*bounce);
    } else if(t < at.settle){
      // The coin actually travels across the imaginary ground while rotating on its rim.
      const u=lerpT(t,at.roll,ROLL),p=out(u);
      const wobble=(1-u)*Math.sin(u*Math.PI*6);
      drawMotion(mix(-84,44,p),40-3*Math.sin(Math.PI*u),1080+7*wobble,mix(-13,48,p),8*wobble);
    } else if(t < at.morph){
      // A precarious diminishing wobble ends with a circle facing the visitor.
      const u=lerpT(t,at.settle,SETTLE),p=smooth(u),osc=Math.sin(u*Math.PI*4)*(1-p);
      drawMotion(mix(44,19,p),40-2*osc,1080+5*osc,mix(48,0,p)+4*osc,4*osc);
    } else if(t < at.zoom){
      const u=lerpT(t,at.morph,MORPH),p=smooth(u);
      intro.classList.add('is-transforming');
      drawMotion(mix(19,0,p),mix(40,0,p),1080,0);
      paint(u); // single surface: there cannot be a second iris over a metal coin
    } else if(t < at.blink){
      const u=lerpT(t,at.zoom,ZOOM);
      if(!intro.classList.contains('is-zooming')) paint(1); // remove every final trace of metal
      intro.classList.add('is-zooming');
      drawMotion(0,0,1080,0,0,mix(1,24,u*u*u));
    } else if(t < at.blink+BLINK){
      intro.classList.add('is-blinking');
      drawMotion(0,0,1080,0,0,24);
    } else {finish();return;}
    raf=requestAnimationFrame(frame);
  }
  function start(){
    if(running||finished)return;
    running=true;intro.classList.add('is-playing');enter.disabled=true;
    startTime=performance.now();raf=requestAnimationFrame(frame);
  }
  enter.addEventListener('click',start);
  document.getElementById('intro-canvas').addEventListener('click',start);
  skip.addEventListener('click',finish);
  intro.addEventListener('wheel',e=>{if(finished)return;e.preventDefault();start();},{passive:false});
  let touchY=null;
  intro.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null;},{passive:true});
  intro.addEventListener('touchend',e=>{if(touchY!==null&&Math.abs((e.changedTouches[0]?.clientY??touchY)-touchY)>35)start();touchY=null;},{passive:true});
  intro.addEventListener('keydown',e=>{
    if(['ArrowDown','PageDown','Enter',' '].includes(e.key)){e.preventDefault();start();}
    if(e.key==='Escape')finish();
  });
})();
