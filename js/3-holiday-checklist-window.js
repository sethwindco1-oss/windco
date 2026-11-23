// WindCO website: Holiday page window: squeegee the frosty Christmas checklist off the glass
// Holiday window: squeegee the frosty checklist off the glass
(function(){
  const pane = document.getElementById('xm-pane');
  if(!pane) return;
  const scene = document.getElementById('xm-scene'), frost = document.getElementById('xm-frost'), tool = document.getElementById('xm-tool');
  const hint = document.getElementById('xm-hint'), done = document.getElementById('xm-done');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bg = document.createElement('canvas');
  const probe = document.createElement('canvas'); probe.width = 60; probe.height = 64;
  const pctx = probe.getContext('2d', {willReadFrequently:true});
  let W = 0, H = 0, dpr = 1, sctx, fctx, tctx, bctx, baseline = 1, shown = false, flakes = [];

  function rand(seed){ let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  // the view outside: a snowy night with lit-up pines
  function drawBackground(){
    const c = bctx; c.setTransform(dpr,0,0,dpr,0,0);
    const sky = c.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0F2236'); sky.addColorStop(0.6,'#24496B'); sky.addColorStop(1,'#3F6F92');
    c.fillStyle = sky; c.fillRect(0,0,W,H);
    const r = rand(9);
    for(let i=0;i<60;i++){ c.fillStyle = `rgba(255,255,255,${0.3+r()*0.6})`; c.fillRect(r()*W, r()*H*0.55, 1.4, 1.4); }
    // moon
    const mx = W*0.76, my = H*0.2, mr = W*0.075;
    const glow = c.createRadialGradient(mx,my,0,mx,my,mr*4); glow.addColorStop(0,'rgba(255,248,220,0.35)'); glow.addColorStop(1,'rgba(255,248,220,0)');
    c.fillStyle = glow; c.fillRect(0,0,W,H);
    c.fillStyle = '#FFF6DA'; c.beginPath(); c.arc(mx,my,mr,0,Math.PI*2); c.fill();
    // snowy hills
    c.fillStyle = '#C9DCEA';
    c.beginPath(); c.moveTo(0,H*0.68); c.quadraticCurveTo(W*0.3,H*0.58,W*0.6,H*0.68); c.quadraticCurveTo(W*0.85,H*0.75,W,H*0.66); c.lineTo(W,H); c.lineTo(0,H); c.fill();
    c.fillStyle = '#EAF2F8';
    c.beginPath(); c.moveTo(0,H*0.82); c.quadraticCurveTo(W*0.45,H*0.72,W,H*0.84); c.lineTo(W,H); c.lineTo(0,H); c.fill();
    // pines with lights
    const trees = [[0.18,0.86,0.36],[0.42,0.8,0.26],[0.82,0.88,0.4],[0.64,0.76,0.18]];
    const bulbs = ['#E8574F','#D9A441','#F6F1E7','#6FC3A0'];
    trees.forEach(([tx,ty,th],k) => {
      const x = W*tx, base = H*ty, h = H*th, w = h*0.55;
      c.fillStyle = '#4A3426'; c.fillRect(x - w*0.06, base, w*0.12, h*0.08);
      for(let t=0;t<3;t++){
        const top = base - h + t*h*0.28, bot = base - h*0.18*(2-t);
        const ww = w*(0.55 + t*0.22);
        c.fillStyle = t%2 ? '#1F5B43' : '#24684D';
        c.beginPath(); c.moveTo(x, top); c.lineTo(x-ww/2, bot); c.lineTo(x+ww/2, bot); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.beginPath(); c.moveTo(x, top); c.lineTo(x-ww*0.16, top+h*0.1); c.lineTo(x+ww*0.16, top+h*0.1); c.closePath(); c.fill();
      }
      const rr = rand(31+k);
      for(let i=0;i<14;i++){
        const yy = base - h*0.85 + rr()*h*0.8, half = (yy - (base - h)) / h * w * 0.5;
        const xx = x + (rr()*2-1)*half*0.85;
        const col = bulbs[i%4];
        const g = c.createRadialGradient(xx,yy,0,xx,yy,6); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(xx-6,yy-6,12,12);
        c.fillStyle = col; c.beginPath(); c.arc(xx,yy,1.8,0,Math.PI*2); c.fill();
      }
      // star on top
      c.fillStyle = '#F5D36B'; c.beginPath();
      for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, rad = i%2 ? h*0.025 : h*0.06; c.lineTo(x+Math.cos(a)*rad, base-h-h*0.02+Math.sin(a)*rad); }
      c.closePath(); c.fill();
    });
  }

  function drawScene(){
    sctx.setTransform(1,0,0,1,0,0);
    sctx.drawImage(bg, 0, 0);
    sctx.setTransform(dpr,0,0,dpr,0,0);
    sctx.fillStyle = 'rgba(255,255,255,0.9)';
    flakes.forEach(f => { sctx.beginPath(); sctx.arc(f.x, f.y, f.r, 0, Math.PI*2); sctx.fill(); });
  }
  function tick(){
    if(W && pane.offsetParent !== null && !document.hidden){
      flakes.forEach(f => { f.y += f.v; f.x += Math.sin((f.y + f.p) / 30) * 0.3; if(f.y > H + 4){ f.y = -4; f.x = Math.random()*W; } });
      drawScene();
    }
    requestAnimationFrame(tick);
  }

  // frost and the checklist written on it
  function drawFrost(){
    const c = fctx; c.setTransform(dpr,0,0,dpr,0,0);
    c.globalCompositeOperation = 'source-over'; c.clearRect(0,0,W,H);
    c.fillStyle = 'rgba(228,238,244,0.9)'; c.fillRect(0,0,W,H);
    const edge = c.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.75);
    edge.addColorStop(0,'rgba(255,255,255,0)'); edge.addColorStop(1,'rgba(255,255,255,0.55)');
    c.fillStyle = edge; c.fillRect(0,0,W,H);
    const r = rand(321);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1;
    for(let i=0;i<70;i++){ // frost ferns
      let x = r()*W, y = r()*H, a = r()*Math.PI*2; c.beginPath(); c.moveTo(x,y);
      for(let k=0;k<6;k++){ a += (r()-0.5)*0.9; const len = 6 + r()*12; x += Math.cos(a)*len; y += Math.sin(a)*len; c.lineTo(x,y);
        const b = a + (r()<0.5?1:-1)*0.8; c.moveTo(x,y); c.lineTo(x+Math.cos(b)*len*0.5, y+Math.sin(b)*len*0.5); c.moveTo(x,y); }
      c.stroke();
    }
    for(let i=0;i<220;i++){ c.fillStyle = `rgba(255,255,255,${0.3+r()*0.5})`; c.beginPath(); c.arc(r()*W, r()*H, 0.6+r()*1.6, 0, Math.PI*2); c.fill(); }

    // the checklist, in marker
    const fs = Math.max(18, W*0.085), x0 = W*0.14, lh = fs*1.32;
    let y = H*0.23;
    c.textBaseline = 'middle';
    c.fillStyle = '#A3202A'; c.font = `700 ${fs*1.12}px Caveat, 'Segoe Print', 'Bradley Hand', cursive`;
    c.fillText('Holiday checklist', x0, y);
    c.strokeStyle = '#A3202A'; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y + fs*0.55); c.quadraticCurveTo(x0 + W*0.35, y + fs*0.7, x0 + W*0.66, y + fs*0.5); c.stroke();
    const items = [['Hang the lights',1],['Wrap the gifts',1],['Bake cookies',1],['Clean the windows',0]];
    y += lh*1.25;
    c.font = `600 ${fs}px Caveat, 'Segoe Print', 'Bradley Hand', cursive`;
    items.forEach(([t, chk]) => {
      const bx = x0, bs = fs*0.62, by = y - bs/2;
      c.strokeStyle = '#12382B'; c.lineWidth = 2.4; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(bx, by); c.lineTo(bx+bs, by+1); c.lineTo(bx+bs-1, by+bs); c.lineTo(bx+1, by+bs-1); c.closePath(); c.stroke();
      if(chk){ c.strokeStyle = '#2F7A55'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(bx+bs*0.15, by+bs*0.5); c.lineTo(bx+bs*0.42, by+bs*0.85); c.lineTo(bx+bs*1.05, by-bs*0.15); c.stroke(); }
      c.fillStyle = chk ? '#12382B' : '#A3202A';
      c.fillText(t, bx + bs + fs*0.4, y + 1);
      if(chk){ const w = c.measureText(t).width; c.strokeStyle = 'rgba(18,56,43,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx+bs+fs*0.35, y+2); c.lineTo(bx+bs+fs*0.45+w, y); c.stroke(); }
      y += lh;
    });
    // little doodles
    c.fillStyle = '#2F7A55'; c.font = `700 ${fs*0.9}px Caveat, cursive`;
    c.fillText('★', W*0.78, H*0.86);
    c.fillStyle = '#A3202A'; c.fillText('♥', W*0.16, H*0.88);
  }

  // squeegee: the blade stays square to the direction of travel, so you can fan it
  const BLADE = () => Math.max(46, W*0.2);
  let blade = null, lastAng = 0, down = false, showTool = false;
  function ends(b){ const half = BLADE()*0.52, nx = Math.cos(b.ang + Math.PI/2), ny = Math.sin(b.ang + Math.PI/2); return [{x:b.x+nx*half,y:b.y+ny*half},{x:b.x-nx*half,y:b.y-ny*half}]; }
  function sweep(a, b){
    const [a1,a2] = ends(a), [b1,b2] = ends(b);
    fctx.beginPath();
    [[a1,a2,b2],[a1,b2,b1],[a1,a2,b1],[a2,b1,b2]].forEach(t => { fctx.moveTo(t[0].x,t[0].y); fctx.lineTo(t[1].x,t[1].y); fctx.lineTo(t[2].x,t[2].y); fctx.closePath(); });
    fctx.globalCompositeOperation = 'destination-out';
    fctx.fillStyle = fctx.strokeStyle = '#000'; fctx.lineWidth = 4; fctx.lineJoin = 'round';
    fctx.fill(); fctx.stroke();
    fctx.globalCompositeOperation = 'source-over';
  }
  function lerpAng(a, b, t){ let d = b - a; while(d > Math.PI) d -= 2*Math.PI; while(d < -Math.PI) d += 2*Math.PI; return a + d*t; }
  function moveTo(x, y, wipe){
    if(!blade){ blade = {x, y, ang:lastAng}; if(wipe) sweep(blade, blade); return; }
    const dx = x - blade.x, dy = y - blade.y, dist = Math.hypot(dx, dy);
    if(dist < 1.2) return;
    const steps = Math.ceil(dist/6), target = Math.atan2(dy, dx);
    for(let i=1;i<=steps;i++){
      const nb = {x: blade.x + dx/steps, y: blade.y + dy/steps, ang: lerpAng(blade.ang, target, 0.22)};
      if(wipe) sweep(blade, nb);
      blade = nb;
    }
    lastAng = blade.ang;
    if(wipe) queueCheck();
  }
  function drawTool(){
    tctx.setTransform(dpr,0,0,dpr,0,0); tctx.clearRect(0,0,W,H);
    if(!blade || !showTool) return;
    const b = BLADE();
    tctx.save(); tctx.translate(blade.x, blade.y); tctx.rotate(blade.ang + Math.PI); // handle leads, rubber trails
    tctx.shadowColor = 'rgba(0,0,0,0.3)'; tctx.shadowBlur = 8; tctx.shadowOffsetY = 3;
    tctx.fillStyle = '#9AA4AA'; tctx.fillRect(2, -b/2, 4, b);
    tctx.fillStyle = '#2A2F33'; tctx.fillRect(-6, -b/2 - 2, 8, b + 4);
    tctx.fillStyle = '#A3202A';
    tctx.beginPath(); tctx.moveTo(-6,-11); tctx.lineTo(-30,-6); tctx.lineTo(-66,-7); tctx.quadraticCurveTo(-72,0,-66,7); tctx.lineTo(-30,6); tctx.lineTo(-6,11); tctx.closePath(); tctx.fill();
    tctx.shadowColor = 'transparent';
    tctx.fillStyle = '#F6F1E7'; for(let i=0;i<4;i++) tctx.fillRect(-60 + i*9, -6.5, 4, 13); // candy-cane stripes
    tctx.restore();
  }

  function frostLeft(){
    pctx.clearRect(0,0,60,64); pctx.drawImage(frost,0,0,60,64);
    const d = pctx.getImageData(0,0,60,64).data; let s = 0;
    for(let i=3;i<d.length;i+=4) s += d[i];
    return s;
  }
  let checkQueued = false;
  function queueCheck(){ if(checkQueued) return; checkQueued = true; setTimeout(() => {
    checkQueued = false;
    const clean = 1 - frostLeft()/baseline;
    if(clean >= 0.9 && !shown){ shown = true; hint.hidden = true; done.hidden = false; }
  }, 250); }

  function setup(){
    const r = pane.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    if(W < 20 || H < 20){ W = 0; return; }
    [scene, frost, tool, bg].forEach(cv => { cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); });
    sctx = scene.getContext('2d'); fctx = frost.getContext('2d'); tctx = tool.getContext('2d'); bctx = bg.getContext('2d');
    drawBackground();
    const r2 = rand(5); flakes = Array.from({length: 46}, () => ({x:r2()*W, y:r2()*H, r:0.8+r2()*1.8, v:0.25+r2()*0.6, p:r2()*100}));
    drawScene(); drawFrost();
    baseline = frostLeft() || 1;
    shown = false; done.hidden = true; hint.hidden = false; blade = null;
  }
  let lastW = -1, rt;
  function maybeSetup(){ const w = pane.getBoundingClientRect().width; if(Math.abs(w - lastW) < 2) return; lastW = w; setup(); }
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(maybeSetup, 120); });
  maybeSetup();
  // redraw the writing once the handwriting font arrives
  if(document.fonts && document.fonts.load){ document.fonts.load('700 30px Caveat').then(() => { if(W && !shown && frostLeft() >= baseline*0.99){ drawFrost(); baseline = frostLeft() || 1; } }).catch(() => {}); }
  if(!reduce) requestAnimationFrame(tick);
  document.getElementById('xm-again').addEventListener('click', () => { lastW = -1; maybeSetup(); });

  function pos(e){ const r = pane.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; }
  pane.addEventListener('pointerdown', e => {
    if(e.target.closest('.xm-done') || !W) return;
    down = true; pane.setPointerCapture(e.pointerId); showTool = true; hint.style.opacity = 0;
    if(e.pointerType !== 'mouse') blade = null;
    const p = pos(e); moveTo(p.x, p.y, true); drawTool();
  });
  pane.addEventListener('pointermove', e => {
    if(!W || (e.pointerType !== 'mouse' && !down) || e.target.closest('.xm-done')) return;
    const p = pos(e); showTool = true; moveTo(p.x, p.y, down); drawTool();
  });
  const end = e => { down = false; if(e.pointerType !== 'mouse'){ showTool = false; blade = null; } drawTool(); };
  pane.addEventListener('pointerup', end); pane.addEventListener('pointercancel', end);
  pane.addEventListener('pointerleave', () => { if(!down){ showTool = false; blade = null; drawTool(); } });
})();
