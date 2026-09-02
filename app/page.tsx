'use client';

import {useEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';

type PixelMode='hero'|'metrics'|'cta';

function PixelCanvas({mode}:{mode:PixelMode}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    let frame=0,raf=0,width=0,height=0,dpr=1;
    const resize=()=>{const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio,2);width=r.width;height=r.height;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
    const ribbon=(cx:number,cy:number,scale:number,phase:number,reverse=false)=>{
      for(let i=-35;i<36;i++)for(let j=-4;j<5;j++){
        const fade=Math.max(0,1-Math.abs(i)/36)*Math.max(0,1-Math.abs(j)/5);
        const x=cx+i*6*scale+(reverse?-j:j)*2;
        const y=cy+j*7*scale+Math.sin(i*.23+frame*.012+phase)*20*scale+Math.cos(i*.08+phase)*Math.abs(i)*.45;
        const pulse=.35+.65*Math.sin(i*.17+j+frame*.024+phase)**2;
        ctx.fillStyle=`rgba(${j%3===0?'72,92,255':j%3===1?'151,160,255':'216,255,142'},${fade*pulse*.82})`;
        ctx.fillRect(x,y,(i+j)%4===0?4:2,Math.max(2,(5+Math.sin(i+frame*.03)*4)*scale));
      }
    };
    const draw=()=>{
      ctx.clearRect(0,0,width,height);
      if(mode==='hero'){
        ribbon(width*.08,height*.35,.78,0);ribbon(width*.36,height*.74,.68,1.8,true);ribbon(width*.89,height*.35,.78,3.3,true);ribbon(width*.82,height*.82,.55,5.1);
        for(let x=0;x<width;x+=17){const a=.12+.12*Math.sin(x*.04+frame*.02);ctx.fillStyle=`rgba(69,89,255,${a})`;ctx.fillRect(x,(Math.sin(x*.009+frame*.008)+1)*height*.18+height*.28,2,25+Math.sin(x)*22)}
      }
      if(mode==='metrics'){
        const cx=width/2;
        for(let x=0;x<width;x+=9)for(let y=18;y<height;y+=9){const curve=Math.abs(x-cx)<width*.28?Math.pow((x-cx)/(width*.28),2)*height*.72:height;const edge=Math.abs(y-curve)<54;const band=Math.sin(x*.025+frame*.012)*28+height*.45;if(edge||Math.abs(y-band)<18){const active=Math.sin(x*.1+y*.07+frame*.025)>.42;ctx.fillStyle=active?'rgba(77,96,255,.72)':'rgba(190,194,210,.15)';ctx.fillRect(x,y,2,2)}}
      }
      if(mode==='cta'){
        for(let x=0;x<width;x+=5){const n=Math.sin(x*.018+frame*.012)+Math.sin(x*.006-frame*.006);const ridge=height*.67-n*42-Math.sin(x*.052)*18;for(let y=ridge;y<height+10;y+=7){const active=Math.sin(x*.08+y*.04+frame*.018)>.1;ctx.fillStyle=active?'rgba(255,255,255,.72)':'rgba(191,202,255,.22)';ctx.fillRect(x,y,2,5)}}
        ribbon(width*.7,height*.58,.8,frame*.002,true);
      }
      frame++;raf=requestAnimationFrame(draw)
    };
    const ro=new ResizeObserver(resize);ro.observe(canvas);resize();draw();
    return()=>{ro.disconnect();cancelAnimationFrame(raf)};
  },[mode]);
  return <canvas ref={ref} className={`pixel-canvas pixel-${mode}`} aria-hidden="true"/>;
}

function CursorSmoke(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer: fine)').matches)return;
    type Puff={x:number;y:number;vx:number;vy:number;size:number;growth:number;life:number;decay:number;angle:number;spin:number;seed:number;alpha:number};
    type Spark={x:number;y:number;vx:number;vy:number;life:number;size:number};
    const puffs:Puff[]=[],sparks:Spark[]=[];
    let raf=0,width=0,height=0,dpr=1,lastTime=0,seed=9217,hasPointer=false,lastX=0,lastY=0;
    let rocketX=0,rocketY=0,rocketAngle=0,rocketVisible=false,rocketSpeed=0;
    const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    const sprite=document.createElement('canvas');sprite.width=sprite.height=128;
    const sctx=sprite.getContext('2d');
    if(sctx){
      sctx.filter='blur(5px)';
      for(let i=0;i<9;i++){
        const x=64+(random()-.5)*24,y=64+(random()-.5)*24,r=22+random()*27;
        const g=sctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0,`rgba(${215+Math.round(random()*35)},${220+Math.round(random()*30)},255,.16)`);
        g.addColorStop(.38,'rgba(210,218,255,.085)');g.addColorStop(1,'rgba(180,195,255,0)');
        sctx.fillStyle=g;sctx.beginPath();sctx.arc(x,y,r,0,Math.PI*2);sctx.fill();
      }
      sctx.filter='none';
    }
    const resize=()=>{dpr=Math.min(devicePixelRatio,1.5);width=innerWidth;height=innerHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
    const addPuff=(x:number,y:number,dx:number,dy:number,core=false)=>{
      const speed=Math.min(42,Math.hypot(dx,dy)),len=Math.max(1,speed),nx=-dy/len,ny=dx/len,side=(random()-.5)*(core?.35:1.5);
      puffs.push({x:x+(random()-.5)*4,y:y+(random()-.5)*4,vx:dx*.022+nx*side+(random()-.5)*.25,vy:dy*.022+ny*side-.035-random()*.12,size:(core?7:17)+random()*(core?9:24)+speed*.15,growth:(core?.13:.28)+random()*.32,life:1,decay:(core?.024:.010)+random()*(core?.012:.008),angle:random()*Math.PI*2,spin:(random()-.5)*.018,seed:random()*30,alpha:core?.18:.095+random()*.045});
      if(puffs.length>580)puffs.splice(0,puffs.length-580);
    };
    const move=(e:PointerEvent)=>{
      if(e.pointerType&&e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
      rocketX=e.clientX;rocketY=e.clientY;rocketVisible=true;
      if(!hasPointer){hasPointer=true;lastX=e.clientX;lastY=e.clientY;return}
      const dx=e.clientX-lastX,dy=e.clientY-lastY,dist=Math.hypot(dx,dy);if(dist<1)return;
      rocketSpeed=Math.min(42,dist);const target=Math.atan2(dy,dx),delta=Math.atan2(Math.sin(target-rocketAngle),Math.cos(target-rocketAngle));rocketAngle+=delta*.5;
      const ux=Math.cos(rocketAngle),uy=Math.sin(rocketAngle),steps=Math.min(16,Math.max(1,Math.ceil(dist/6)));
      for(let i=1;i<=steps;i++){
        const t=i/steps,x=lastX+dx*t-ux*9,y=lastY+dy*t-uy*9;
        addPuff(x,y,dx/steps-ux*.45,dy/steps-uy*.45);if(i%2===0)addPuff(x-ux*3,y-uy*3,dx/steps-ux,dy/steps-uy,true);
        if(dist>9&&i%4===0){const side=(random()-.5)*1.3;sparks.push({x,y,vx:-ux*(1+random()*2.2)-uy*side,vy:-uy*(1+random()*2.2)+ux*side,life:1,size:.6+random()*1.1})}
      }
      if(sparks.length>140)sparks.splice(0,sparks.length-140);lastX=e.clientX;lastY=e.clientY;
    };
    const down=(e:PointerEvent)=>{for(let i=0;i<12;i++)addPuff(e.clientX+(random()-.5)*8,e.clientY+(random()-.5)*8,(random()-.5)*12,(random()-.5)*12,i%3===0);for(let i=0;i<12;i++)sparks.push({x:e.clientX,y:e.clientY,vx:(random()-.5)*5,vy:(random()-.5)*5,life:1,size:.8+random()*1.3})};
    const leave=()=>{hasPointer=false;rocketVisible=false};
    const drawRocket=(now:number)=>{
      if(!rocketVisible)return;rocketSpeed*=.93;const pulse=.5+.5*Math.sin(now*.018);
      ctx.save();ctx.translate(rocketX,rocketY);ctx.rotate(rocketAngle);ctx.scale(.9,.9);
      const glow=ctx.createRadialGradient(-2,0,0,-2,0,20+pulse*4);glow.addColorStop(0,'rgba(255,255,255,.42)');glow.addColorStop(.26,'rgba(77,101,255,.23)');glow.addColorStop(1,'rgba(48,71,255,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(-2,0,23,0,Math.PI*2);ctx.fill();

      // Twin engines give this version a compact, futuristic shuttle silhouette.
      ctx.globalAlpha=.72+Math.min(.24,rocketSpeed*.01);
      for(const offset of [-2.25,2.25]){
        const flame=ctx.createLinearGradient(-18,offset,-6,offset);flame.addColorStop(0,'rgba(138,158,255,0)');flame.addColorStop(.46,'#6d80ff');flame.addColorStop(1,'#f8f9ff');
        ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(-6.5,offset-1.25);ctx.quadraticCurveTo(-12-pulse*3.5,offset-1.8,-18-pulse*3,offset);ctx.quadraticCurveTo(-12-pulse*3.5,offset+1.8,-6.5,offset+1.25);ctx.closePath();ctx.fill();
      }
      ctx.globalAlpha=1;

      ctx.fillStyle='#7786ff';ctx.strokeStyle='rgba(181,190,255,.9)';ctx.lineWidth=.7;
      ctx.beginPath();ctx.moveTo(2,-3.2);ctx.lineTo(-7.5,-10);ctx.lineTo(-8.4,-3);ctx.lineTo(-3,-.7);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(2,3.2);ctx.lineTo(-7.5,10);ctx.lineTo(-8.4,3);ctx.lineTo(-3,.7);ctx.closePath();ctx.fill();ctx.stroke();

      ctx.fillStyle='#f8f9ff';ctx.strokeStyle='rgba(195,202,255,.95)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(4.2,-4);ctx.quadraticCurveTo(-1.5,-4.6,-7.4,-3);ctx.lineTo(-8.4,0);ctx.lineTo(-7.4,3);ctx.quadraticCurveTo(-1.5,4.6,4.2,4);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#3047ff';ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(4.3,-3.9);ctx.lineTo(5.5,0);ctx.lineTo(4.3,3.9);ctx.closePath();ctx.fill();
      ctx.fillStyle='#cbd1ff';ctx.beginPath();ctx.roundRect(-7.3,-.7,13,1.4,.7);ctx.fill();

      ctx.fillStyle='#17206a';ctx.strokeStyle='#aeb8ff';ctx.lineWidth=.85;ctx.beginPath();ctx.arc(1.2,0,2.15,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.92)';ctx.beginPath();ctx.arc(1.8,-.7,.58,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e9ebff';ctx.strokeStyle='#7485ff';ctx.lineWidth=.65;
      for(const offset of [-2.25,2.25]){ctx.beginPath();ctx.arc(-7.2,offset,1.28,0,Math.PI*2);ctx.fill();ctx.stroke()}
      ctx.restore();
    };
    const draw=(now:number)=>{
      raf=requestAnimationFrame(draw);const dt=Math.min(2,(now-lastTime)/16.67||1);lastTime=now;ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='screen';
      for(let i=puffs.length-1;i>=0;i--){const p=puffs[i],curl=Math.sin(p.y*.012+now*.0007+p.seed)*.034+Math.cos(p.x*.009-now*.0005+p.seed)*.021;p.vx+=Math.cos(p.angle+now*.0004)*curl*dt;p.vy+=Math.sin(p.angle+now*.0004)*curl*dt;p.vx*=Math.pow(.982,dt);p.vy*=Math.pow(.982,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.size+=p.growth*dt;p.angle+=p.spin*dt;p.life-=p.decay*dt;if(p.life<=0){puffs.splice(i,1);continue}const born=Math.min(1,(1-p.life)/.09);ctx.save();ctx.globalAlpha=p.alpha*born*p.life*p.life;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.drawImage(sprite,-p.size,-p.size,p.size*2,p.size*2);ctx.restore()}
      for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.965;s.vy*=.965;s.life-=.04*dt;if(s.life<=0){sparks.splice(i,1);continue}ctx.globalAlpha=s.life*.7;ctx.strokeStyle=s.life>.45?'#f7f8ff':'#7180ff';ctx.lineWidth=s.size;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*2.1,s.y-s.vy*2.1);ctx.stroke()}
      drawRocket(now);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    };
    const ro=new ResizeObserver(resize);document.documentElement.classList.add('rocket-cursor');ro.observe(document.documentElement);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',down,{passive:true});document.documentElement.addEventListener('mouseleave',leave);resize();raf=requestAnimationFrame(draw);
    return()=>{document.documentElement.classList.remove('rocket-cursor');ro.disconnect();cancelAnimationFrame(raf);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);document.documentElement.removeEventListener('mouseleave',leave)};
  },[]);
  return <canvas ref={ref} className="cursor-smoke" aria-hidden="true"/>;
}

const landShapes:[number,number][][]=[
  [[72,-168],[78,-95],[83,-60],[76,-20],[67,-45],[58,-54],[46,-52],[37,-76],[30,-85],[25,-97],[16,-100],[12,-87],[16,-83],[20,-75],[15,-61],[10,-85],[15,-95],[14,-105],[32,-119],[49,-125],[58,-137],[60,-145],[62,-165],[65,-168]],
  [[12,-77],[5,-80],[-4,-81],[-10,-75],[-18,-70],[-30,-71],[-40,-72],[-55,-70],[-56,-67],[-50,-64],[-43,-55],[-37,-54],[-28,-48],[-22,-40],[-12,-37],[-5,-35],[0,-50],[4,-52],[10,-59],[12,-69]],
  [[71,30],[70,55],[65,60],[60,30],[55,20],[50,40],[45,28],[41,29],[37,15],[37,5],[43,3],[48,-5],[50,0],[54,5],[58,5],[60,-5],[62,0],[60,10],[62,20],[65,20]],
  [[37,-10],[32,35],[12,45],[0,42],[-25,35],[-34,20],[-30,15],[-28,10],[-15,12],[-12,0],[-5,-8],[0,-10],[12,-15],[20,-17],[30,-15]],
  [[65,60],[57,40],[50,40],[45,28],[40,27],[38,35],[30,35],[27,45],[30,60],[37,75],[32,85],[27,90],[23,95],[15,98],[12,105],[12,120],[22,125],[30,125],[35,135],[45,145],[50,145],[55,135],[60,125],[65,110],[70,90],[72,70]],
  [[38,35],[30,50],[30,60],[37,75],[32,85],[27,90],[23,95],[15,98],[8,80],[20,70],[27,45]],
  [[23,95],[15,98],[12,105],[0,105],[0,120],[12,120],[22,125]],
  [[12,98],[5,105],[0,105],[0,120],[-10,120],[-10,130],[0,140],[12,120]],
  [[-10,112],[-20,115],[-30,115],[-40,115],[-38,140],[-28,153],[-15,145],[-10,135]],
  [[-34,166],[-37,175],[-42,172],[-47,168],[-46,165],[-40,166]],
  [[-2,130],[-5,140],[-12,150],[-8,155],[-3,150],[0,140]],
  [[83,-60],[78,-20],[67,-45],[58,-54],[60,-40],[70,-30],[80,-35]],
  [[66,-24],[63,-25],[63,-13],[66,-15]],
  [[58,-8],[50,-6],[50,1],[54,2],[58,-1]],
  [[45,145],[35,135],[30,132],[33,140],[40,145]],
];

function insideLand(lon:number,lat:number){
  return landShapes.some(poly=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [yi,xi]=poly[i],[yj,xj]=poly[j];
    if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))inside=!inside;
  }return inside});
}

function DataGlobe(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    let width=0,height=0,dpr=1,raf=0,last=0,frame=0,seed=71639;
    let yaw=-2.03,pitch=.32,yawVelocity=.0018,pitchVelocity=0,dragging=false,lastX=0,lastY=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer={x:0,y:0,active:false};
    const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    type Dot={x:number,y:number,z:number,opacity:number,size:number,scatter:boolean};
    const dots:Dot[]=[];
    const locations=[{name:'NEW YORK',lat:40.7128,lon:-74.006},{name:'KOSOVO',lat:42.6629,lon:21.1655}];
    const addDot=(lat:number,lon:number,radius:number,opacity:number,size:number,scatter=false)=>{const la=lat*Math.PI/180,lo=lon*Math.PI/180,c=Math.cos(la);dots.push({x:c*Math.cos(lo)*radius,y:Math.sin(la)*radius,z:c*Math.sin(lo)*radius,opacity,size,scatter})};
    const mobile=canvas.clientWidth<560,landTarget=mobile?7800:15000,oceanTarget=mobile?2600:4800,scatterTarget=mobile?700:1500;
    let land=0,attempts=0;
    while(land<landTarget&&attempts++<landTarget*25){const lat=Math.asin(random()*2-1)*180/Math.PI,lon=random()*360-180;if(insideLand(lon,lat)){addDot(lat,lon,1.004,.72+random()*.28,.65+random()*.65);land++}}
    for(let i=0;i<oceanTarget;i++){const lat=Math.asin(random()*2-1)*180/Math.PI,lon=random()*360-180;if(!insideLand(lon,lat)||random()>.7)addDot(lat,lon,1,.09+random()*.12,.55+random()*.5)}
    for(let i=0;i<scatterTarget;i++){const lat=Math.asin(random()*2-1)*180/Math.PI,lon=random()*360-180;addDot(lat,lon,1.015+Math.pow(random(),2.3)*.30,.18+random()*.32,.55+random()*.65,true)}
    const offX=new Float32Array(dots.length),offY=new Float32Array(dots.length),offZ=new Float32Array(dots.length),velX=new Float32Array(dots.length),velY=new Float32Array(dots.length),velZ=new Float32Array(dots.length);
    const resize=()=>{const box=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio,2);width=box.width;height=box.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
    const rotate=(x:number,y:number,z:number)=>{const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);const x1=x*cy+z*sy,z1=-x*sy+z*cy;return [x1,y*cx-z1*sx,y*sx+z1*cx] as const};
    const inverseRotate=(x:number,y:number,z:number)=>{const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch),y1=y*cx+z*sx,z1=-y*sx+z*cx;return[x*cy-z1*sy,y1,x*sy+z1*cy] as const};
    const grid=(radius:number,cx:number,cy:number)=>{ctx.lineWidth=.55;ctx.strokeStyle='rgba(235,238,245,.10)';for(let lat=-60;lat<=60;lat+=20){ctx.beginPath();let started=false;for(let i=0;i<=96;i++){const lo=i/96*Math.PI*2,la=lat*Math.PI/180,c=Math.cos(la),p=rotate(c*Math.cos(lo),Math.sin(la),c*Math.sin(lo));const perspective=1/(1.12-p[2]*.12),x=cx+p[0]*radius*perspective,y=cy-p[1]*radius*perspective;if(p[2]>-.55){if(!started){ctx.moveTo(x,y);started=true}else ctx.lineTo(x,y)}else started=false}ctx.stroke()}for(let lon=0;lon<180;lon+=20){for(const sign of[-1,1]){ctx.beginPath();let started=false;for(let i=0;i<=72;i++){const la=-Math.PI/2+i/72*Math.PI,lo=lon*Math.PI/180*sign,c=Math.cos(la),p=rotate(c*Math.cos(lo),Math.sin(la),c*Math.sin(lo));const perspective=1/(1.12-p[2]*.12),x=cx+p[0]*radius*perspective,y=cy-p[1]*radius*perspective;if(p[2]>-.55){if(!started){ctx.moveTo(x,y);started=true}else ctx.lineTo(x,y)}else started=false}ctx.stroke()}}};
    const draw=(now:number)=>{raf=requestAnimationFrame(draw);const dt=Math.min(2,(now-last)/16.67||1);last=now;ctx.clearRect(0,0,width,height);const radius=Math.min(width*.345,height*.39),cx=width*.5,cy=height*.565;
      if(!dragging&&!reduced){yaw+=yawVelocity*dt;pitch+=pitchVelocity*dt;pitchVelocity*=.94;yawVelocity+=(.0018-yawVelocity)*.018}
      grid(radius,cx,cy);
      let hitLocal:readonly[number,number,number]|null=null;
      if(pointer.active){const sx=(pointer.x-cx)/radius,sy=-(pointer.y-cy)/radius,dist2=sx*sx+sy*sy;if(dist2<1.8225)hitLocal=inverseRotate(sx,sy,Math.sqrt(1.8225-dist2))}
      let burstLocal:readonly[number,number,number]|null=null;
      if(!reduced&&frame%45===0){const theta=random()*Math.PI*2,phi=Math.acos(2*random()-1);burstLocal=[Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta)]}
      for(let pass=0;pass<2;pass++)for(let i=0;i<dots.length;i++){const d=dots[i];let px=d.x+offX[i],py=d.y+offY[i],pz=d.z+offZ[i];const side=rotate(px,py,pz),front=side[2]>=0;if((pass===0&&front)||(pass===1&&!front))continue;
        if(hitLocal){const dx=px-hitLocal[0],dy=py-hitLocal[1],dz=pz-hitLocal[2],dist2=dx*dx+dy*dy+dz*dz;if(dist2<.3025&&dist2>.00001){const dist=Math.sqrt(dist2),force=.18*(1-dist/.55)*(1-dist/.55),rX=Math.sin(i*123.456)*.8,rY=Math.cos(i*789.123)*.8,rZ=Math.sin(i*456.789)*.8;velX[i]+=((dx/dist)*.4+rX)*force;velY[i]+=((dy/dist)*.4+rY)*force;velZ[i]+=((dz/dist)*.4+rZ)*force}}
        if(burstLocal){const dx=px-burstLocal[0],dy=py-burstLocal[1],dz=pz-burstLocal[2],dist2=dx*dx+dy*dy+dz*dz;if(dist2<.09&&dist2>.00001){const dist=Math.sqrt(dist2),force=.15*(1-dist/.3);velX[i]+=((dx/dist)+Math.sin(i*321)*.4)*force;velY[i]+=((dy/dist)+Math.cos(i*654)*.4)*force;velZ[i]+=((dz/dist)+Math.sin(i*987)*.4)*force}}
        velX[i]+=-offX[i]*.05;velY[i]+=-offY[i]*.05;velZ[i]+=-offZ[i]*.05;velX[i]*=.81;velY[i]*=.81;velZ[i]*=.81;offX[i]+=velX[i];offY[i]+=velY[i];offZ[i]+=velZ[i];px=d.x+offX[i];py=d.y+offY[i];pz=d.z+offZ[i];
        const p=rotate(px,py,pz),perspective=1/(1.12-p[2]*.12),x=cx+p[0]*radius*perspective,y=cy-p[1]*radius*perspective;
        const depth=front?.48+p[2]*.52:.11;ctx.globalAlpha=d.opacity*depth;ctx.fillStyle=d.scatter?'#cbd0dc':'#ffffff';const size=d.size*(front?1.08:.72)*Math.max(.75,perspective);ctx.fillRect(x-size/2,y-size/2,size,size)}
      ctx.globalAlpha=1;
      const markerPoints=locations.map(place=>{const la=place.lat*Math.PI/180,lo=place.lon*Math.PI/180,c=Math.cos(la),p=rotate(c*Math.cos(lo)*1.015,Math.sin(la)*1.015,c*Math.sin(lo)*1.015),perspective=1/(1.12-p[2]*.12);return{...place,x:cx+p[0]*radius*perspective,y:cy-p[1]*radius*perspective,z:p[2]}});
      if(markerPoints.every(p=>p.z>-.03)){ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle='#18e299';ctx.lineWidth=.7;ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(markerPoints[0].x,markerPoints[0].y);ctx.quadraticCurveTo(cx,cy-radius*.88,markerPoints[1].x,markerPoints[1].y);ctx.stroke();ctx.restore()}
      markerPoints.forEach((place,index)=>{if(place.z<-.08)return;const fade=Math.min(1,(place.z+.08)/.3),pulse=.5+.5*Math.sin(now*.005+index*Math.PI);ctx.save();ctx.globalAlpha=fade;const halo=ctx.createRadialGradient(place.x,place.y,0,place.x,place.y,18+pulse*6);halo.addColorStop(0,'rgba(24,226,153,.42)');halo.addColorStop(.28,'rgba(24,226,153,.14)');halo.addColorStop(1,'rgba(24,226,153,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(place.x,place.y,24,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(24,226,153,${.55+pulse*.35})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(place.x,place.y,7+pulse*5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#18e299';ctx.beginPath();ctx.arc(place.x,place.y,2.5,0,Math.PI*2);ctx.fill();const right=place.x>=cx,tx=place.x+(right?16:-16);ctx.strokeStyle='rgba(24,226,153,.75)';ctx.beginPath();ctx.moveTo(place.x+(right?7:-7),place.y);ctx.lineTo(place.x+(right?12:-12),place.y);ctx.stroke();ctx.font='8px BaseMono, monospace';ctx.letterSpacing='1px';ctx.textAlign=right?'left':'right';ctx.textBaseline='middle';ctx.fillStyle='#f7f8ff';ctx.fillText(place.name,tx,place.y+.5);ctx.restore()});
      const glow=ctx.createRadialGradient(cx,cy,radius*.68,cx,cy,radius*1.32);glow.addColorStop(0,'rgba(48,71,255,0)');glow.addColorStop(.72,'rgba(48,71,255,.018)');glow.addColorStop(1,'rgba(48,71,255,0)');ctx.fillStyle=glow;ctx.fillRect(cx-radius*1.35,cy-radius*1.35,radius*2.7,radius*2.7);frame++};
    const point=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
    const onMove=(e:PointerEvent)=>{const p=point(e);pointer.x=p.x;pointer.y=p.y;pointer.active=true;if(dragging){const dx=e.clientX-lastX,dy=e.clientY-lastY;yaw+=dx*.005;pitch=Math.max(-1.05,Math.min(1.05,pitch+dy*.005));yawVelocity=dx*.0008;pitchVelocity=dy*.00035;lastX=e.clientX;lastY=e.clientY}};
    const onDown=(e:PointerEvent)=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging')};
    const onUp=(e:PointerEvent)=>{dragging=false;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)};
    const onLeave=()=>{pointer.active=false};
    const onKey=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.09;if(e.key==='ArrowRight')yaw+=.09;if(e.key==='ArrowUp')pitch-=.09;if(e.key==='ArrowDown')pitch+=.09};
    const ro=new ResizeObserver(resize);ro.observe(canvas);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);canvas.addEventListener('pointerleave',onLeave);canvas.addEventListener('keydown',onKey);resize();raf=requestAnimationFrame(draw);
    return()=>{ro.disconnect();cancelAnimationFrame(raf);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);canvas.removeEventListener('pointerleave',onLeave);canvas.removeEventListener('keydown',onKey)};
  },[]);
  return <canvas ref={ref} className="data-globe" role="img" aria-label="Interactive rotating point-cloud globe highlighting Kosovo and New York. Drag to rotate or use arrow keys." tabIndex={0}/>;
}

function Counter({target,prefix='',suffix=''}:{target:number,prefix?:string,suffix?:string}){
  const ref=useRef<HTMLSpanElement>(null);
  useEffect(()=>{const el=ref.current;if(!el)return;let raf=0;const obs=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;const start=performance.now();const tick=(now:number)=>{const p=Math.min(1,(now-start)/1100);const value=Math.round(target*(1-Math.pow(1-p,3)));el.textContent=`${prefix}${value.toLocaleString()}${suffix}`;if(p<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);obs.disconnect()},{threshold:.5});obs.observe(el);return()=>{obs.disconnect();cancelAnimationFrame(raf)}},[target,prefix,suffix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

function AiEngineering(){
  const ref=useRef<HTMLElement>(null);
  const onMove=(e:ReactPointerEvent<HTMLElement>)=>{
    const box=e.currentTarget.getBoundingClientRect(),x=(e.clientX-box.left)/box.width,y=(e.clientY-box.top)/box.height;
    e.currentTarget.style.setProperty('--tilt-x',`${(x-.5)*5}deg`);e.currentTarget.style.setProperty('--tilt-y',`${(.5-y)*5}deg`);e.currentTarget.style.setProperty('--glow-x',`${x*100}%`);e.currentTarget.style.setProperty('--glow-y',`${y*100}%`);
  };
  const onLeave=()=>{ref.current?.style.setProperty('--tilt-x','0deg');ref.current?.style.setProperty('--tilt-y','0deg');ref.current?.style.setProperty('--glow-x','70%');ref.current?.style.setProperty('--glow-y','45%')};
  return <section ref={ref} className="ai-engineering" id="ai-engineering" data-reveal onPointerMove={onMove} onPointerLeave={onLeave}>
    <div className="ai-ambient" aria-hidden="true"/>
    <div className="content ai3-shell">
      <header className="ai3-head"><div><span className="ai-kicker"><i/>AI-NATIVE ENGINEERING</span><h2>We don&apos;t just write code.<br/><strong>We architect outcomes.</strong></h2></div><div className="ai3-intro"><p>Traditional agencies bill by the hour; we value the milestone. Advanced AI strips away repetitive testing, boilerplate, and basic refactoring.</p><p>Senior engineers stay focused on <b>system architecture, data security, and user experience.</b></p></div></header>
      <div className="ai3-field">
        <div className="ai3-field-glow"/><div className="ai3-grid"/>
        {['LOGIC','CONTEXT','SYNTAX','REASONING'].map((label,row)=><div className={`ai3-rail rail-${row+1}`} key={label}><div className="ai3-track">{Array.from({length:7},(_,i)=><span key={i}>{label}<i>{String(row+1).padStart(2,'0')}</i></span>)}</div></div>)}
        <div className="ai3-lens">
          <div className="ai3-lens-head"><span>KL // OUTCOME ENGINE</span><b><i/>LIVE</b></div>
          <div className="ai3-lens-core"><span>100%</span><b>SENIOR ENGINEERING FOCUS</b><i/></div>
          <div className="ai3-focus"><span>SYSTEM ARCHITECTURE</span><span>DATA SECURITY</span><span>USER EXPERIENCE</span></div>
          <div className="ai3-lens-foot"><span>NYC</span><b>AI / HUMAN</b><span>PRN</span></div>
        </div>
        <div className="ai3-field-meta"><span>42.6629° N</span><b>// MILESTONE-BASED DELIVERY //</b><span>74.0060° W</span></div>
      </div>
      <div className="ai3-proof">
        <article><span>01 / CONTEXT</span><h3>Semantic understanding</h3><p>Context-aware models read the entire codebase, keeping every new feature aligned with the existing architecture.</p></article>
        <article><span>02 / COMPLIANCE</span><h3>Zero-trust compliance</h3><p>Automated agents scan every commit for HIPAA and SOC 2 vulnerabilities before peer review.</p></article>
        <aside><span>MODEL INFRASTRUCTURE</span><div><b><i>O</i>OpenAI Codex</b><b><i>A</i>Anthropic Claude Code</b><b><i>G</i>Google Gemini</b></div></aside>
      </div>
    </div>
  </section>;
}

function Arrow(){return <span className="arrow" aria-hidden="true">›</span>}

function AuiButtonText({children}:{children:string}){
  const letters=Array.from(children);
  const row=(duplicate=false)=><span className={`aui-label-row${duplicate?' aui-label-row-copy':''}`} aria-hidden={duplicate||undefined}>{letters.map((letter,index)=>{const reverseDelay=(letters.length-1-index)*23;return <span className="aui-label-char" style={{'--char-delay':`${reverseDelay}ms`,'--char-follow-delay':`${reverseDelay+250}ms`} as CSSProperties} key={`${duplicate?'copy':'main'}-${index}`}>{letter}</span>})}</span>;
  return <span className="aui-label">{row()}{row(true)}</span>;
}

type Job={discipline:string;location:string;title:string;description:string};

const jobs:Job[]=[
  {discipline:'Engineering',location:'Prishtina',title:'Backend Engineer — Golang & LLM Integration',description:'Build secure Go services and production-grade AI orchestration for healthcare workflows that cannot afford to fail.'},
  {discipline:'Product',location:'Prishtina',title:'Product Manager — Healthcare',description:'Turn complex pharmacy operations into clear product direction, from discovery and validation through launch.'},
  {discipline:'Engineering',location:'Prishtina',title:'Frontend Engineer — Flutter',description:'Create fast, accessible cross-platform experiences used every day by healthcare operators and their teams.'},
];

type TeamMember={initials:string;name:string;role:string;image?:string};

const teamMembers:TeamMember[]=[
  {initials:'ZR',name:'Zee R.',role:'CEO',image:'/team-zee.png'},
  {initials:'AS',name:'Altin S.',role:'Frontend'},
  {initials:'SB',name:'Shpend B.',role:'Backend',image:'/team-shpend.png'},
  {initials:'AG',name:'Adnan G.',role:'Design',image:'/team-adnan.png'},
  {initials:'WS',name:'Will S.',role:'Sales Lead'},
  {initials:'BR',name:'Blinera R.',role:'Customer Service Rep'},
  {initials:'SC',name:'Shayne C.',role:'Customer Service Rep'},
  {initials:'CK',name:'Chirag K.',role:'Flutter Developer'},
  {initials:'EO',name:'Edrin O.',role:'Team',image:'/team-edrin.png'},
];

function TeamCard({member,index}:{member:TeamMember;index:number}){
  const trackGlow=(event:ReactPointerEvent<HTMLElement>)=>{const rect=event.currentTarget.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width;const y=(event.clientY-rect.top)/rect.height;event.currentTarget.style.setProperty('--team-x',`${x*100}%`);event.currentTarget.style.setProperty('--team-y',`${y*100}%`);event.currentTarget.style.setProperty('--team-tilt-x',`${(0.5-y)*8}deg`);event.currentTarget.style.setProperty('--team-tilt-y',`${(x-0.5)*10}deg`);event.currentTarget.style.setProperty('--team-shift-x',`${(x-0.5)*8}px`);event.currentTarget.style.setProperty('--team-shift-y',`${(y-0.5)*5}px`)};
  const resetTilt=(event:ReactPointerEvent<HTMLElement>)=>{event.currentTarget.style.setProperty('--team-tilt-x','0deg');event.currentTarget.style.setProperty('--team-tilt-y','0deg');event.currentTarget.style.setProperty('--team-shift-x','0px');event.currentTarget.style.setProperty('--team-shift-y','0px')};
  const spritePosition=['0%','50%','100%'];
  return <article className="team-card" onPointerMove={trackGlow} onPointerLeave={resetTilt} data-reveal>
    <span className="team-card-glow" aria-hidden="true"/><span className="team-card-wash" aria-hidden="true"/><span className="team-card-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
    {member.image?<img className="team-portrait team-portrait-custom" src={member.image} alt=""/>:<span className="team-portrait" style={{'--portrait-x':spritePosition[index%3],'--portrait-y':spritePosition[Math.floor(index/3)]} as CSSProperties} aria-hidden="true"/>}
    <div><h3>{member.name}</h3><p>{member.role}</p></div>
  </article>;
}

function JobCard({job,index}:{job:Job;index:number}){
  const trackGlow=(event:ReactPointerEvent<HTMLAnchorElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--job-x',`${((event.clientX-rect.left)/rect.width)*100}%`);event.currentTarget.style.setProperty('--job-y',`${((event.clientY-rect.top)/rect.height)*100}%`)};
  return <a className="job-card" href={`mailto:hiring@kosovalabs.com?subject=${encodeURIComponent(job.title)}`} onPointerMove={trackGlow} data-reveal>
    <span className="job-card-glow" aria-hidden="true"/><span className="job-card-wash" aria-hidden="true"/>
    <div className="job-card-head"><div className="job-tags"><span>{job.discipline}</span><span>Full-time</span><span>{job.location}</span></div><i className="job-arrow" aria-hidden="true"><b/></i></div>
    <div className="job-card-copy"><span>0{index+1} / OPEN ROLE</span><h3>{job.title}</h3><p>{job.description}</p></div>
  </a>;
}

function MetricCard({index,label,children}:{index:number;label:string;children:ReactNode}){
  const trackGlow=(event:ReactPointerEvent<HTMLElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--hover-x',`${((event.clientX-rect.left)/rect.width)*100}%`);event.currentTarget.style.setProperty('--hover-y',`${((event.clientY-rect.top)/rect.height)*100}%`)};
  return <article className="metric-card" onPointerMove={trackGlow}>
    <span className="metric-card-glow" aria-hidden="true"/><span className="metric-card-wash" aria-hidden="true"/>
    <em aria-hidden="true">0{index}</em><strong>{children}</strong><span className="metric-card-label">{label}</span>
  </article>;
}

type SolutionItem={title:ReactNode;icon:'sliders'|'hand'|'bot'|'nodes';href:string};
const solutions:SolutionItem[]=[
  {title:<>Product<br/>Engineering</>,icon:'sliders',href:'#products'},
  {title:<>Platform<br/>Systems</>,icon:'hand',href:'#platform'},
  {title:<>AI<br/>Operations</>,icon:'bot',href:'#ai-engineering'},
  {title:<>Data &amp;<br/>Integrations</>,icon:'nodes',href:'mailto:hello@kosovalabs.com'},
];

function SolutionCard({item}:{item:SolutionItem}){
  const trackGlow=(event:ReactPointerEvent<HTMLAnchorElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--hover-x',`${((event.clientX-rect.left)/rect.width)*100}%`);event.currentTarget.style.setProperty('--hover-y',`${((event.clientY-rect.top)/rect.height)*100}%`)};
  return <a href={item.href} onPointerMove={trackGlow} data-reveal><span className="solution-card-glow" aria-hidden="true"/><span className="solution-card-wash" aria-hidden="true"/><div className={`line-icon ${item.icon}`} aria-hidden="true"><i/><i/><i/></div><span>{item.title}</span></a>;
}

const partners=['AWS','PostgreSQL','OpenAI','Go','Flutter','HIPAA','SOC 2','LegitScript','ScriptLinkRX','BatchRX'];

type Release={kind:string;title:string;copy:string;statA:string;labelA:string;statB:string;labelB:string;href:string};

const releases:Release[]=[
  {kind:'grid',title:'ScriptLinkRX',copy:'Your compounding partner for exceptional care.',statA:'LIVE',labelA:'Product status',statB:'RX',labelB:'Healthcare network',href:'https://scriptlinkrx.com'},
  {kind:'rings',title:'BatchRX',copy:'Where pharmacies turn for trusted audit support.',statA:'LIVE',labelA:'Product status',statB:'AUDIT',labelB:'Workflow focus',href:'https://batchrx.com'},
];
function ProjectVisual({release}:{release:Release}){
  if(release.kind==='grid')return <img className="project-preview-image" src="/scriptlink-showcase.png" alt="ScriptLinkRX healthcare platform, patient workflow, network metrics, and medicine catalogue"/>;
  if(release.kind==='rings')return <img className="project-preview-batch-ui" src="/batchrx-release.png" alt="BatchRX pharmacy inventory report and audit workflow"/>;
  if(release.kind==='chart')return <div className="project-preview-system" aria-hidden="true"><span/><span/><span/><span/><b>AI / PRODUCT VELOCITY</b></div>;
  return <div className="project-preview-route" aria-hidden="true"><span>NEW YORK</span><i>↔</i><span>PRISHTINA</span><small>ONE CONNECTED PRODUCT TEAM</small></div>;
}

function ProjectsShowcase(){
  return <div className="project-duo" data-reveal>
    {releases.map(project=><a className={`project-poster project-poster-${project.kind}`} href={project.href} key={project.title}>
      <div className="project-poster-visual"><ProjectVisual release={project}/></div>
      <div className="project-poster-copy">
        <div className="project-poster-title"><span>{project.title}</span><i className="project-poster-arrow" aria-hidden="true"><b/></i></div>
        <h3>{project.copy}</h3>
        <div className="project-poster-stats"><span><b>{project.statA}</b><small>{project.labelA}</small></span><span><b>{project.statB}</b><small>{project.labelB}</small></span></div>
      </div>
    </a>)}
  </div>;
}

type PlatformCapability={kicker:string;title:string;copy:string};
const platformCapabilities:PlatformCapability[]=[
  {kicker:'Product engineering',title:'Build healthcare products that move.',copy:'Senior product teams turn complex healthcare operations into calm, intuitive software people trust.'},
  {kicker:'Platform systems',title:'Scale from one workflow to a national network.',copy:'Observable, resilient infrastructure stays fast and reliable as products, teams, and traffic grow.'},
  {kicker:'Secure & trusted',title:'Trust and compliance in every release.',copy:'Healthcare context, zero-trust thinking, and rigorous controls are designed into the platform from day one.'},
  {kicker:'Connected delivery',title:'Move from domain context to production faster.',copy:'New York healthcare expertise and Prishtina engineering operate as one focused product organization.'},
];

function PlatformCapabilityCard({item,index}:{item:PlatformCapability;index:number}){
  const trackGlow=(event:ReactPointerEvent<HTMLElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--cap-x',`${((event.clientX-rect.left)/rect.width)*100}%`);event.currentTarget.style.setProperty('--cap-y',`${((event.clientY-rect.top)/rect.height)*100}%`)};
  return <article className={`platform-capability-card capability-${index+1}`} onPointerMove={trackGlow} data-reveal>
    <span className="platform-capability-glow" aria-hidden="true"/>
    <span className="platform-capability-wash" aria-hidden="true"/>
    <header><span><i/>{item.kicker}</span><b>0{index+1}</b></header>
    <h3>{item.title}</h3><p>{item.copy}</p>
    <div className={`platform-capability-art platform-capability-art-${index+1}`} aria-hidden="true"/>
  </article>;
}

type UpdateItem={category:string;date:string;dateTime:string;title:string;copy:string;image:string;href:string;visualLabel?:string;visualTitle?:string;visualMode?:'score'};
const updates:UpdateItem[]=[
  {category:'Product network',date:'Sep 2, 2026',dateTime:'2026-09-02',title:'Inside the nationwide care network behind ScriptLinkRX',copy:'How one connected platform helps pharmacy teams move from order to patient with clarity.',image:'/update-scriptlinkrx.png',href:'https://scriptlinkrx.com'},
  {category:'Coverage',date:'Aug 28, 2026',dateTime:'2026-08-28',title:'How ScriptLinkRX covered 50+ states',copy:'The connected infrastructure behind a nationwide compounding network built for exceptional patient care.',image:'/update-scriptlinkrx-coverage.png',href:'https://scriptlinkrx.com',visualLabel:'SCRIPTLINKRX',visualTitle:'How we covered 50+ states.'},
  {category:'Operations',date:'Aug 21, 2026',dateTime:'2026-08-21',title:'BatchRX brings clarity to modern pharmacy audit workflows',copy:'A closer look at the systems making inventory intelligence easier to trust and act on.',image:'/update-batchrx.png',href:'https://batchrx.com',visualMode:'score'},
];

function BatchScoreArt(){
  return <div className="update-score-art" aria-hidden="true"><div className="score-brand"><span>BATCHRX</span><b>OPERATIONS SIGNAL</b></div><strong className="score-title">Audit signals,<br/>in real time.</strong><div className="score-rows"><div className="score-green"><strong>98.7</strong><i/><span><b/></span></div><div className="score-yellow"><strong>24/7</strong><i/><span><b/></span></div><div className="score-orange"><strong>LIVE</strong><i/><span><b/></span></div></div><i className="score-pointer"/></div>;
}

function UpdateCard({item,index}:{item:UpdateItem;index:number}){
  const trackGlow=(event:ReactPointerEvent<HTMLAnchorElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--update-x',`${((event.clientX-rect.left)/rect.width)*100}%`);event.currentTarget.style.setProperty('--update-y',`${((event.clientY-rect.top)/rect.height)*100}%`)};
  return <a className={`update-card${item.visualTitle?' update-card-map':''}${item.visualMode==='score'?' update-card-score':''}`} href={item.href} onPointerMove={trackGlow} data-reveal>
    <div className="update-visual">{item.visualMode==='score'?<BatchScoreArt/>:<img src={item.image} alt=""/>}<span className="update-visual-glow" aria-hidden="true"/>{item.visualTitle&&<><div className="coverage-points" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="update-featured-copy"><span>{item.visualLabel}</span><strong>{item.visualTitle}</strong></div></>}<span className="update-index" aria-hidden="true">0{index+1}</span><i className="update-arrow" aria-hidden="true"><b/></i></div>
    <div className="update-meta"><span>{item.category}</span><time dateTime={item.dateTime}>{item.date}</time></div>
    <h3>{item.title}</h3><p>{item.copy}</p>
  </a>;
}

export default function Home(){
  const [banner,setBanner]=useState(true);
  const [mobile,setMobile]=useState(false);
  useEffect(()=>{
    const items=[...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target)}}),{threshold:.14,rootMargin:'0px 0px -4%'});items.forEach(i=>obs.observe(i));return()=>obs.disconnect();
  },[]);
  const trackCtaGlow=(event:ReactPointerEvent<HTMLDivElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--cta-x',`${((event.clientX-rect.left)/rect.width)*100}%`);event.currentTarget.style.setProperty('--cta-y',`${((event.clientY-rect.top)/rect.height)*100}%`)};
  return <main><CursorSmoke/>
    <svg width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="platform-white-to-green" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .333 .333 .334 0 0" result="luminanceMask"/>
        <feComponentTransfer in="luminanceMask" result="brightWhites">
          <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 1"/>
        </feComponentTransfer>
        <feComposite in="brightWhites" in2="SourceAlpha" operator="in" result="whiteMask"/>
        <feFlood floodColor="#18e299" result="greenFill"/>
        <feComposite in="greenFill" in2="whiteMask" operator="in" result="greenWhites"/>
        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="greenWhites"/></feMerge>
      </filter>
    </svg>
    {banner&&<div className="announcement"><span>Kosova Labs Studio is accepting new healthcare platform builds.</span><a href="mailto:hello@kosovalabs.com">Start a conversation <Arrow/></a><button onClick={()=>setBanner(false)} aria-label="Dismiss banner">×</button></div>}
    <header className="nav-shell"><div className="content nav-row"><a className="base-mark" href="#top" aria-label="Kosova Labs home"><img src="/kosova-labs-mark.png" alt=""/><span className="brand-reveal" aria-hidden="true"><AuiButtonText>Kosova Labs</AuiButtonText></span></a><nav className="nav-links" aria-label="Main navigation">
      <div className="nav-item"><button>Solutions <span>⌄</span></button><div className="mega"><b>What we build</b><a href="#solutions">Product engineering <Arrow/></a><a href="#solutions">Platform systems <Arrow/></a><a href="#solutions">AI operations <Arrow/></a></div></div>
      <div className="nav-item"><button>Products <span>⌄</span></button><div className="mega"><b>Our products</b><a href="#products">ScriptLinkRX <Arrow/></a><a href="#products">BatchRX <Arrow/></a></div></div>
      <div className="nav-item"><button>Company <span>⌄</span></button><div className="mega"><b>Kosova Labs</b><a href="#platform">Approach <Arrow/></a><a href="#team">Team <Arrow/></a><a href="#footer">New York ↔ Prishtina <Arrow/></a></div></div>
      <div className="nav-item"><button>Resources <span>⌄</span></button><div className="mega"><b>Explore</b><a href="#releases">Latest work <Arrow/></a><a href="#careers">Careers <Arrow/></a></div></div>
    </nav><a className="blue-button nav-cta" href="mailto:hello@kosovalabs.com"><AuiButtonText>Get Started</AuiButtonText></a><button className={`mobile-toggle${mobile?' open':''}`} onClick={()=>setMobile(!mobile)} aria-label="Toggle navigation"><i/><i/></button></div>
      <nav className={`mobile-panel${mobile?' open':''}`}><a href="#solutions" onClick={()=>setMobile(false)}>Solutions</a><a href="#products" onClick={()=>setMobile(false)}>Products</a><a href="#platform" onClick={()=>setMobile(false)}>Company</a><a href="mailto:hello@kosovalabs.com">Get Started</a></nav>
    </header>

    <section className="base-hero globe-hero" id="top"><div className="globe-orbit" aria-hidden="true"/><DataGlobe/><div className="globe-crosshair" aria-hidden="true"/><div className="hero-center" data-reveal><span className="hero-kicker">THE HEALTHCARE PRODUCT GRID</span><h1>The product company<br/>for modern healthcare.</h1><p>Built by operators, trusted by healthcare teams, and engineered for scale.</p><div className="hero-buttons"><a className="white-button" href="#products"><AuiButtonText>Explore products</AuiButtonText></a><a className="ghost-button" href="mailto:hello@kosovalabs.com"><AuiButtonText>Work with us</AuiButtonText></a></div></div><div className="globe-hud" aria-hidden="true"><span>40.7128° N&nbsp;&nbsp;74.0060° W</span><b>// LIVE PRODUCT NETWORK //</b><span>42.6629° N&nbsp;&nbsp;21.1655° E</span></div></section>

    <section className="trust trust-hidden"><p>Technology and platforms trusted across healthcare.</p><div className="trust-track"><div>{[...partners,...partners].map((p,i)=><span key={i}>{p}</span>)}</div></div></section>

    <section className="metric-field"><PixelCanvas mode="metrics"/><div className="metric-copy content" data-reveal><div className="metric-intro"><div><span className="metric-eyebrow">// NETWORK METRICS — LIVE</span><h2>Where healthcare gets built.</h2></div><p>One team across New York and Prishtina, focused on the metrics that matter.</p></div><div className="metric-grid"><MetricCard index={1} label="Organizations served"><Counter target={1200} suffix="+"/></MetricCard><MetricCard index={2} label="States reached"><Counter target={50}/></MetricCard><MetricCard index={3} label="Years in healthcare"><Counter target={15} suffix="+"/></MetricCard><MetricCard index={4} label="Platforms online">24/7</MetricCard></div></div></section>

    <section className="releases" id="products" hidden><div className="content careers-intro projects-intro" id="releases" data-reveal><div><span>// PRODUCT NETWORK — 02 LIVE</span><h2>Our products.</h2></div><p>Two focused platforms moving healthcare operations forward.</p></div><ProjectsShowcase/></section>

    <section className="platform platform-suite" id="platform"><div className="content platform-suite-shell">
      <div className="platform-heading platform-suite-heading" data-reveal><div><span>// PLATFORM NETWORK — 04 CORE</span><h2><b>Kosova Labs</b> is the platform for<br/>healthcare products at scale.</h2></div><a className="ghost-button" href="mailto:hello@kosovalabs.com"><AuiButtonText>Start building</AuiButtonText></a></div>
      <div className="platform-capability-grid">{platformCapabilities.map((item,index)=><PlatformCapabilityCard item={item} index={index} key={item.kicker}/>)}</div>
      <div className="solution-links" id="solutions" hidden>{solutions.map(item=><SolutionCard item={item} key={item.icon}/>)}</div>
    </div></section>

    <section className="updates" id="updates"><div className="content updates-shell">
      <div className="updates-head" data-reveal><i aria-hidden="true"/><div><span>// FIELD NOTES — 03 LATEST</span><h2>Latest updates</h2></div><a className="white-button" href="#releases"><AuiButtonText>All updates</AuiButtonText></a></div>
      <div className="updates-grid">{updates.map((item,index)=><UpdateCard item={item} index={index} key={item.title}/>)}</div>
    </div></section>

    <section className="team" id="team"><div className="content team-shell">
      <header className="team-head" data-reveal><div><span>// PEOPLE NETWORK — 09 CONNECTED</span><h2>The team.</h2><p>Real people, deep expertise. New York ambition and Prishtina engineering excellence, working as one.</p></div><div className="team-locations"><span><i/>Prishtina Hub</span><span><i/>NYC HQ</span></div></header>
      <div className="team-grid">{teamMembers.map((member,index)=><TeamCard member={member} index={index} key={`${member.name}-${member.role}`}/>)}</div>
    </div></section>

    <section className="careers" id="careers"><div className="content careers-shell">
      <div className="careers-intro" data-reveal><div><span>// CAREERS NETWORK — 03 OPEN</span><h2>Put your expertise to work.</h2></div><p>Healthcare needs capable, reliable products—and the people who know how to build them.</p></div>
      <div className="careers-grid">{jobs.map((job,index)=><JobCard job={job} index={index} key={job.title}/>)}</div>
    </div></section>

    <section className="closing-cta"><div className="content closing-cta-frame" onPointerMove={trackCtaGlow}><b className="closing-cta-glow" aria-hidden="true"/><b className="closing-cta-wash" aria-hidden="true"/><i className="frame-cross cross-a" aria-hidden="true"/><i className="frame-cross cross-b" aria-hidden="true"/><div className="closing-cta-inner" data-reveal><h2>Healthcare products,<br/>built to move.</h2><div className="closing-cta-actions"><a className="white-button" href="mailto:hello@kosovalabs.com"><AuiButtonText>Start a project</AuiButtonText></a><a className="ghost-button" href="#careers"><AuiButtonText>Join our team</AuiButtonText></a></div></div></div></section>

    <footer className="site-footer" id="footer">
      <div className="content footer-main">
        <div className="footer-brand-column"><a className="footer-wordmark" href="#top"><img src="/kosova-labs-mark.png" alt=""/>Kosova Labs</a><p>Technology that moves healthcare forward—from New York to Prishtina.</p></div>
        <nav className="footer-links" aria-label="Footer navigation">
          <div><b>Explore</b><a href="#solutions">Solutions</a><a href="#products">Products</a><a href="#ai-engineering">AI engineering</a><a href="#releases">Latest work</a></div>
          <div><b>Capabilities</b><a href="#solutions">Product engineering</a><a href="#solutions">Platform systems</a><a href="#solutions">AI operations</a><a href="#solutions">Data &amp; integrations</a></div>
          <div><b>Products</b><a href="https://scriptlinkrx.com">ScriptLinkRX</a><a href="https://batchrx.com">BatchRX</a><a href="mailto:hello@kosovalabs.com">Partner with us</a></div>
          <div><b>Company</b><a href="#platform">Our approach</a><a href="#team">Team</a><a href="#careers">Careers</a><a href="mailto:hello@kosovalabs.com">Contact</a><a href="#footer">New York · Prishtina</a></div>
        </nav>
      </div>
      <div className="content footer-bottom"><div><a href="#" aria-label="Kosova Labs on X">𝕏</a><a href="#" aria-label="Kosova Labs on LinkedIn">in</a></div><span>© 2026 Kosova Labs</span><div><a href="#footer">Privacy</a><a href="#footer">Terms</a></div></div>
    </footer>
  </main>
}
