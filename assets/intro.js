/* THE COMMONPLACE — Intro v5. All animation is local: no libraries or subscriptions.
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
  const sessionKey = 'commonplace-intro-seen-v5';
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
  // The airborne path is ballistic rather than eased into its landing.
  // The final vertical velocity is deliberately high: no more soft hovering.
  const FLIP=4050, LAND=840, ROLL=1180, SETTLE=760, MORPH=2050, ZOOM=1120, BLINK=700;
  const at={land:FLIP,roll:FLIP+LAND,settle:FLIP+LAND+ROLL,
    morph:FLIP+LAND+ROLL+SETTLE,zoom:FLIP+LAND+ROLL+SETTLE+MORPH,
    blink:FLIP+LAND+ROLL+SETTLE+MORPH+ZOOM};
  const GROUND=58;
  const xImpact=-90, xRollEnd=54, xRest=18;
  let startTime=0;
  function drawMotion(x,y,pitch,tilt,yaw=0,scale=1,squash=0){
    const radius=Math.max(85,object.clientWidth/2);
    object.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotateZ(${tilt.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) scale(${scale.toFixed(4)}) scaleY(${(1-squash).toFixed(4)})`;
    // A fixed ground plane + a moving, height-sensitive shadow sells contact.
    // The darkest/sharpest shadow appears at impact, not while in flight.
    const elevation=Math.max(0,GROUND-y);
    const airborne=clamp(elevation/165);
    const contact=1-airborne;
    shadow.style.transform=`translateX(${x.toFixed(2)}px) scale(${(mix(1.0,.58,airborne)).toFixed(3)},${(mix(1,.85,airborne)).toFixed(3)})`;
    shadow.style.opacity=(scale>2?0:mix(.70,.13,airborne)).toFixed(3);
    shadow.style.filter=`blur(${mix(4,22,airborne).toFixed(2)}px)`;
    // The small flattening at the exact moment of impact is very brief.
    coin.style.filter=squash>0?`brightness(${(1+.09*squash).toFixed(3)})`:'none';
  }
  const lerpT=(time,start,len)=>clamp((time-start)/len);
  const hop=(u,height)=>-height*4*u*(1-u);
  const radius=()=>Math.max(85,object.clientWidth/2);
  function frame(now){
    if(finished)return;
    const t=now-startTime;
    if(t < at.land){
      const u=lerpT(t,0,FLIP);
      // Three forward face-on rotations; rotation never eases to a stop before impact.
      // y = -611u + 669u²; the accelerating descent reaches the surface hard.
      drawMotion(xImpact*u, -611*u+669*u*u,
        72+1008*u, -17*u, 2*Math.sin(u*Math.PI*6),1);
    } else if(t < at.roll){
      const ms=t-at.land;
      if(ms<85){
        // Contact impulse: squash and a few pixels of compression.
        const v=ms/85;
        const compress=Math.sin(Math.PI*v);
        drawMotion(xImpact,GROUND+7*compress,1080,-17+3*compress,0,1,.070*compress);
      } else if(ms<545){
        // First rebound: rises quickly, then accelerates back into the surface.
        const v=(ms-85)/460;
        drawMotion(xImpact+10*v,GROUND+hop(v,40),1080+12*v,-17+10*v,6*Math.sin(Math.PI*v));
      } else if(ms<805){
        // Second, much smaller rebound; diminishing restitution.
        const v=(ms-545)/260;
        drawMotion(xImpact+10+7*v,GROUND+hop(v,11),1092+3*v,-7+5*v,2.5*Math.sin(Math.PI*v));
      } else {
        const v=(ms-805)/(LAND-805);
        drawMotion(xImpact+17,GROUND,1095,-2,0,1,.014*(1-v));
      }
    } else if(t < at.settle){
      const u=lerpT(t,at.roll,ROLL);
      // The spin is coupled to the travelled distance (wheel-like rolling),
      // and both lose speed together through rolling resistance.
      const travelled=(xRollEnd-(xImpact+17))*(1-Math.pow(1-u,2.35));
      const x=xImpact+17+travelled;
      const angle=(-2)+(travelled/radius())*(180/Math.PI);
      const rattle=(1-u)*Math.sin(u*Math.PI*14);
      drawMotion(x,GROUND-2.8*Math.abs(rattle),1095+5*rattle,
        angle+3.2*rattle,3*rattle);
    } else if(t < at.morph){
      const u=lerpT(t,at.settle,SETTLE), dec=Math.pow(1-u,1.7);
      const wobble=Math.sin(u*Math.PI*7.5)*dec;
      const p=out(u),endAngle=((xRollEnd-(xImpact+17))/radius())*(180/Math.PI)-2;
      drawMotion(mix(xRollEnd,xRest,p),GROUND-4*Math.abs(wobble),
        mix(1095,1080,p)+5*wobble,mix(endAngle,0,p)+6*wobble,3*wobble);
    } else if(t < at.zoom){
      const u=lerpT(t,at.morph,MORPH),p=smooth(u);
      intro.classList.add('is-transforming');
      drawMotion(mix(xRest,0,p),mix(GROUND,0,p),1080,0);
      paint(u); // Morph the very same physical surface, never overlay another eye.
    } else if(t < at.blink){
      const u=lerpT(t,at.zoom,ZOOM);
      if(!intro.classList.contains('is-zooming')) paint(1);
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
