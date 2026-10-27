/* THE COMMONPLACE — v7: from mathematical loops to engraved coin to iris to page.
   No external animation library. One canvas draws BOTH the coin and the iris.
   The final pupil opens a real window onto the homepage underneath. */
(() => {
  'use strict';
  const intro = document.getElementById('intro');
  if (!intro) return;
  const object = document.getElementById('intro-object');
  const coin = document.getElementById('intro-coin');
  const shadow = document.getElementById('intro-shadow');
  const canvas = document.getElementById('coin-surface');
  const enter = document.getElementById('intro-enter');
  const skip = document.getElementById('intro-skip');
  if (!object || !coin || !shadow || !canvas || !enter || !skip) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sessionKey = 'commonplace-intro-seen-v7';
  const clamp = (x, lo=0, hi=1) => Math.max(lo, Math.min(hi, x));
  const lerp = (a,b,t) => a+(b-a)*t;
  const ease = x => {x=clamp(x);return x*x*(3-2*x)};
  const out = x => 1-Math.pow(1-clamp(x),3);
  const inOut = x => x<.5?4*x*x*x:1-Math.pow(2-2*x,3)/2;
  const rnd = n => ((Math.sin(n*128.63+41.7)*12479.29)%1+1)%1;
  const rgb = s => [1,3,5].map(i=>parseInt(s.substring(i,i+2),16));
  const col = (a,b,p) => { const A=rgb(a),B=rgb(b);return `rgb(${A.map((n,i)=>Math.round(lerp(n,B[i],p))).join(',')})`;};
  const R = 304, C = 320, N=640;
  const backs = coin.querySelectorAll('.coin-back, .coin-edge');
  let anim=0, started=false, ended=false, origin=0;
  let loopPaths = [];

  // These compositions were deliberately spaced apart in v6. They are
  // all genuinely CLOSED curves; each group retains its own space at rest.
  function setupLoops(){
    document.querySelectorAll('.intro-knots').forEach(svg => {
    svg.querySelectorAll('path').forEach((path,i) => {
      const b=path.getBBox();
      const cx=b.x+b.width/2, cy=b.y+b.height/2;
      const vb=svg.viewBox.baseVal;
      const dx=vb.x+vb.width/2-cx, dy=vb.y+vb.height/2-cy;
      path.style.transformBox='fill-box';
      path.style.transformOrigin='center';
      path.style.willChange='transform,opacity';
      loopPaths.push({path,dx,dy,i});
    });
    });
  }

  // This rose-curve equation is echoed by the closed curves in the opening.
  // Its engraving becomes the structure from which the iris fibres emerge.
  function engravingPath(scale=1) {
    ctx.beginPath();
    for(let j=0;j<=300;j++) {
      const a=(j/300)*Math.PI*2;
      const r=150*scale*(.70+.30*Math.cos(4*a));
      const x=C+r*Math.cos(a),y=C+r*Math.sin(a);
      if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
  }

  const fibres=Array.from({length:172},(_,i)=>({
    angle:i*2*Math.PI/172,
    bend:(rnd(i+17)-.5)*.14,
    end:lerp(237,284,rnd(i+92)),
    alpha:lerp(.23,.73,rnd(i+183)),
    stroke:['#cbb394','#3b332f','#a98d69','#807369','#6d5745','#e0bd8c'][i%6]
  }));

  function fillCircle(fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(C,C,R,0,2*Math.PI);ctx.fill();}
  function paint(m=0,engrave=1){
    m=ease(m);engrave=clamp(engrave);
    ctx.clearRect(0,0,N,N);
    ctx.save();ctx.beginPath();ctx.arc(C,C,R,0,2*Math.PI);ctx.clip();

    // The SAME disk continuously changes colour, texture, and relief.
    const surface=ctx.createRadialGradient(230,190,0,C,C,425);
    const bronze=['#e8c9a9','#d0a384','#ae785d','#563f36'];
    const iris=['#9b8a76','#a17f60','#756c66','#37322f'];
    [.0,.31,.66,1].forEach((at,i)=>surface.addColorStop(at,col(bronze[i],iris[i],m)));
    fillCircle(surface);

    // The metallic concentric rings soften into a fine, coloured limbal ring.
    const metal=1-m;
    ctx.globalAlpha=metal;
    ctx.strokeStyle='#604334';ctx.lineWidth=11;
    ctx.beginPath();ctx.arc(C,C,284,0,2*Math.PI);ctx.stroke();
    ctx.strokeStyle='#f0d1aa';ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(C,C,274,0,2*Math.PI);ctx.stroke();
    ctx.strokeStyle='#674d40';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(C,C,263,0,2*Math.PI);ctx.stroke();

    // Identical closed rosette engravings, echoed by the outer knot drawings.
    // The lines fade while the fibres assume their direction and spacing.
    ctx.globalAlpha=metal*engrave;
    ctx.strokeStyle='#785440';ctx.lineWidth=5.5;
    engravingPath(1);ctx.stroke();
    ctx.strokeStyle='#e5b88f';ctx.lineWidth=1.9;
    engravingPath(.92);ctx.stroke();
    ctx.strokeStyle='#79523f';ctx.lineWidth=3.1;
    engravingPath(.52);ctx.stroke();

    // An iris never appears as a separate image/layer or a second DOM disk.
    // Its radial fibres are painted into this same changing coin surface.
    if(m>0){
      for(let i=0;i<fibres.length;i++){
        const f=fibres[i],a=f.angle;
        const inner=lerp(142,96,m)+(rnd(i+72)-.5)*9;
        const tip=lerp(225,f.end,m);
        const x1=C+inner*Math.cos(a),y1=C+inner*Math.sin(a);
        const x2=C+tip*Math.cos(a+f.bend),y2=C+tip*Math.sin(a+f.bend);
        const cx=C+lerp(inner,tip,.59)*Math.cos(a+f.bend*.48);
        const cy=C+lerp(inner,tip,.59)*Math.sin(a+f.bend*.48);
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);
        ctx.strokeStyle=f.stroke;ctx.lineWidth=lerp(1.1,2.3,rnd(i+6));
        ctx.globalAlpha=m*f.alpha;ctx.stroke();
      }
      ctx.globalAlpha=m*.8;
      ctx.strokeStyle='#44382e';ctx.lineWidth=8;
      ctx.beginPath();ctx.arc(C,C,274,0,2*Math.PI);ctx.stroke();
      ctx.globalAlpha=m;
      const innerTone=ctx.createRadialGradient(C,C,55,C,C,151);
      innerTone.addColorStop(0,'#1f1c1a');innerTone.addColorStop(.7,'#56463488');innerTone.addColorStop(1,'#58412e00');
      fillCircle(innerTone);
      // This dark centre will become a literal hole through to the website.
      const r=lerp(0,106,m);
      const pupil=ctx.createRadialGradient(C-12,C-16,4,C,C,Math.max(7,r));
      pupil.addColorStop(0,'#100f0e');pupil.addColorStop(.77,'#191715');pupil.addColorStop(1,'#35291f');
      ctx.fillStyle=pupil;ctx.beginPath();ctx.arc(C,C,r,0,2*Math.PI);ctx.fill();
      ctx.strokeStyle='#403329';ctx.lineWidth=5*m;ctx.stroke();
      ctx.globalAlpha=m*.27;
      ctx.fillStyle='#f8e5cc';ctx.beginPath();ctx.ellipse(255,244,16,22,-.45,0,2*Math.PI);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.strokeStyle=col('#664837','#3b3631',m);ctx.lineWidth=lerp(7,2,m);
    ctx.beginPath();ctx.arc(C,C,R-4,0,2*Math.PI);ctx.stroke();
    ctx.restore();
    backs.forEach(el=>{el.style.opacity=(1-m).toFixed(3)});
  }

  function move(x,y,pitch,roll,scale=1,yaw=0){
    object.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateZ(${roll.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    shadow.style.transform=`translateX(${(x*.8).toFixed(1)}px) scale(${clamp(1-y/300,.6,1.2).toFixed(3)})`;
    shadow.style.opacity=scale>1.8?'0':String(clamp(.43+y/380,.15,.6));
  }

  // The loops physically retreat towards the object's centre. During this
  // same gesture the matching engraving on the coin gains definition.
  function gather(u){
    const p=ease(u);
    const desktop=window.innerWidth>700;
    loopPaths.forEach(({path,dx,dy,i})=>{
      const active=path.ownerSVGElement.classList.contains(desktop?'intro-knots--desktop':'intro-knots--mobile');
      if(!active)return;
      const stagger=i%5*.055;
      const v=ease(clamp((u-stagger)/(1-stagger)));
      path.style.transform=`translate(${(dx*v).toFixed(2)}px,${(dy*v).toFixed(2)}px) scale(${(1-.93*v).toFixed(3)})`;
      path.style.opacity=(1-ease(clamp((v-.20)/.8))).toFixed(3);
    });
  }

  const DUR={GATHER:1050,FLIP:2640,IMPACT:320,ROLL:900,SETTLE:630,MORPH:2100,REVEAL:1500};
  const timing={gatherEnd:DUR.GATHER};
  timing.flipEnd=timing.gatherEnd+DUR.FLIP;
  timing.impactEnd=timing.flipEnd+DUR.IMPACT;
  timing.rollEnd=timing.impactEnd+DUR.ROLL;
  timing.settleEnd=timing.rollEnd+DUR.SETTLE;
  timing.morphEnd=timing.settleEnd+DUR.MORPH;
  timing.revealEnd=timing.morphEnd+DUR.REVEAL;
  const fraction=(t,a,d)=>clamp((t-a)/d);

  function portal(radius){
    // Transparent centre = REAL homepage, not a fade to an unrelated screen.
    // Apply the hole to the whole intro so it clips the pupil and its contents.
    const gradient=`radial-gradient(circle at 50% 50%, transparent ${Math.max(0,radius).toFixed(1)}px, #000 ${(radius+1.5).toFixed(1)}px)`;
    intro.style.webkitMaskImage=gradient;
    intro.style.maskImage=gradient;
  }
  function finish(){
    if(ended)return;
    ended=true;cancelAnimationFrame(anim);
    document.body.classList.remove('intro-active');
    intro.classList.add('intro-finished');
    try{sessionStorage.setItem(sessionKey,'yes')}catch(e){}
    if(intro.contains(document.activeElement))document.activeElement.blur();
    window.setTimeout(()=>intro.remove(),550);
  }
  paint(0,.5);
  // On reload, ?intro=1 provides an easy replay during design reviews.
  const replay = new URLSearchParams(window.location.search).has('intro');
  if(reduce){finish();return;}
  try{if(!replay&&sessionStorage.getItem(sessionKey)==='yes'){finish();return;}}catch(e){}
  intro.classList.add('is-ready');
  document.body.classList.add('intro-active');
  setupLoops();

  function frame(now){
    if(ended)return;
    const t=now-origin;
    if(t<timing.gatherEnd){
      const p=fraction(t,0,DUR.GATHER);
      gather(p);paint(0,lerp(.5,1,ease(p)));
      move(0,-5*Math.sin(p*Math.PI),72,0,1+.035*ease(p));
    } else if(t<timing.flipEnd){
      const u=fraction(t,timing.gatherEnd,DUR.FLIP),p=inOut(u);
      // Three forward turns, landing in the face-on plane.
      move(-53*ease(u),34*ease(u)-142*Math.sin(Math.PI*u),72+1008*p,-9*ease(u),1,Math.sin(u*6*Math.PI)*2);
    } else if(t<timing.impactEnd){
      const u=fraction(t,timing.flipEnd,DUR.IMPACT);
      // Fast impact, a brief rebound, and abrupt return to the surface.
      const rebound=17*Math.sin(Math.PI*u)*Math.exp(-1.7*u);
      move(-53,34-rebound,1080,-9+2*Math.sin(u*3*Math.PI),1-.018*Math.sin(Math.PI*u));
    } else if(t<timing.rollEnd){
      const u=fraction(t,timing.impactEnd,DUR.ROLL),p=out(u);
      // Rim rolling: Z-rotation follows the change in horizontal position.
      const dx=lerp(-53,41,p);
      const roll=lerp(-9,44,p)+(1-u)*5*Math.sin(u*10*Math.PI);
      move(dx,34-2*Math.sin(Math.PI*u),1080,roll);
    } else if(t<timing.settleEnd){
      const u=fraction(t,timing.rollEnd,DUR.SETTLE),p=ease(u),w=(1-u)*Math.sin(u*5*Math.PI);
      move(lerp(41,0,p),lerp(34,0,p)-2*w,1080+3*w,lerp(44,0,p)+5*w);
    } else if(t<timing.morphEnd){
      const u=fraction(t,timing.settleEnd,DUR.MORPH);
      intro.classList.add('is-transforming');
      move(0,0,1080,0);paint(u,1);
    } else if(t<timing.revealEnd){
      const u=fraction(t,timing.morphEnd,DUR.REVEAL),p=ease(u);
      intro.classList.add('is-opening');
      if(!intro.dataset.irisFinished){paint(1,1);intro.dataset.irisFinished='1';}
      const radiusNeeded=Math.hypot(window.innerWidth,window.innerHeight)*.52+30;
      const objectWidth=document.getElementById('intro-orbit').getBoundingClientRect().width;
      // Keep the pupil edge in approximate proportion to the growing iris.
      const endScale=Math.max(16,radiusNeeded/(Math.max(160,objectWidth)*.16));
      move(0,0,1080,0,lerp(1,endScale,p));
      portal(radiusNeeded*p);
    } else {finish();return;}
    anim=requestAnimationFrame(frame);
  }
  function start(){
    if(started||ended)return;
    started=true;intro.classList.add('is-playing');
    enter.disabled=true;origin=performance.now();anim=requestAnimationFrame(frame);
  }
  enter.addEventListener('click',start);
  document.getElementById('intro-canvas').addEventListener('click',start);
  skip.addEventListener('click',finish);
  intro.addEventListener('wheel',e=>{e.preventDefault();start();},{passive:false});
  let touchY=null;
  intro.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null},{passive:true});
  intro.addEventListener('touchend',e=>{if(touchY!==null&&Math.abs((e.changedTouches[0]?.clientY??touchY)-touchY)>35)start();touchY=null},{passive:true});
  intro.addEventListener('keydown',e=>{
    if(['ArrowDown','PageDown','Enter',' '].includes(e.key)){e.preventDefault();start();}
    if(e.key==='Escape')finish();
  });
})();
