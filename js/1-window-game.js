// WindCO website: Home page window game: scrub with soap, then squeegee
(function(){
  const pane = document.getElementById('pane');
  const view = document.getElementById('view'), grime = document.getElementById('grime'), soap = document.getElementById('soap'), tool = document.getElementById('tool');
  const hint = document.getElementById('hint'), done = document.getElementById('done');
  const pctEl = document.getElementById('pct'), barEl = document.getElementById('bar');
  const toolBtns = [...document.querySelectorAll('.tool-btn')];
  let W = 0, H = 0, dpr = 1;
  let gctx, sctx, tctx;
  // offscreen layers: where the glass is soapy, the soap texture, and a scratch layer
  const wet = document.createElement('canvas'), foam = document.createElement('canvas'), tmp = document.createElement('canvas');
  const probe = document.createElement('canvas'); probe.width = 80; probe.height = 64;
  let wctx, fctx, xctx, pctx = probe.getContext('2d', {willReadFrequently:true});
  let current = 'scrub', baseline = 1, soapedOnce = false, shownDone = false;

  function rand(seed){ let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  function drawView(){
    const c = view.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0);
    const sky = c.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#5FA8D3'); sky.addColorStop(0.55,'#BFE0F0'); sky.addColorStop(1,'#F1E6CF');
    c.fillStyle = sky; c.fillRect(0,0,W,H);
    const sg = c.createRadialGradient(W*0.78,H*0.26,0,W*0.78,H*0.26,H*0.32);
    sg.addColorStop(0,'rgba(255,248,225,0.95)'); sg.addColorStop(0.25,'rgba(255,240,200,0.5)'); sg.addColorStop(1,'rgba(255,240,200,0)');
    c.fillStyle = sg; c.fillRect(0,0,W,H);
    const layers = [
      {base:0.62, amp:0.20, col:'#8FB1C6', seed:3, snow:true},
      {base:0.70, amp:0.15, col:'#5E8299', seed:7},
      {base:0.80, amp:0.10, col:'#2F4D5E', seed:11}
    ];
    layers.forEach(L => {
      const r = rand(L.seed*997);
      c.beginPath(); c.moveTo(0,H);
      for(let x=0; x<=W+20; x+=W/26){ c.lineTo(x, H*L.base - r()*H*L.amp); }
      c.lineTo(W,H); c.closePath(); c.fillStyle = L.col; c.fill();
      if(L.snow){ c.save(); c.clip(); c.fillStyle='rgba(255,255,255,0.85)'; c.fillRect(0,0,W,H*(L.base-L.amp*0.55)); c.restore(); }
    });
    const r3 = rand(42);
    c.fillStyle = '#1C3340';
    for(let i=0;i<22;i++){
      const x = r3()*W, h = H*(0.08 + r3()*0.1), b = H*(0.9 + r3()*0.1);
      c.beginPath(); c.moveTo(x, b-h); c.lineTo(x-h*0.28, b); c.lineTo(x+h*0.28, b); c.closePath(); c.fill();
    }
    c.fillRect(0, H*0.97, W, H*0.03);
  }

  function drawGrime(){
    gctx.globalCompositeOperation = 'source-over';
    gctx.clearRect(0,0,W,H);
    gctx.fillStyle = 'rgba(176,170,152,0.8)'; gctx.fillRect(0,0,W,H);
    const r = rand(1234);
    for(let i=0;i<260;i++){
      const x=r()*W, y=r()*H, rad=6+r()*40;
      const g = gctx.createRadialGradient(x,y,0,x,y,rad);
      const a = 0.05 + r()*0.12;
      g.addColorStop(0, r()<0.5 ? `rgba(120,110,90,${a})` : `rgba(225,222,210,${a})`); g.addColorStop(1,'rgba(0,0,0,0)');
      gctx.fillStyle = g; gctx.fillRect(x-rad,y-rad,rad*2,rad*2);
    }
    for(let i=0;i<420;i++){
      const x=r()*W, y=r()*H, rad=0.8+r()*3.2;
      gctx.beginPath(); gctx.arc(x,y,rad,0,Math.PI*2);
      gctx.strokeStyle = `rgba(245,245,235,${0.25+r()*0.35})`; gctx.lineWidth = 0.8; gctx.stroke();
    }
    for(let i=0;i<40;i++){
      const x=r()*W, y=r()*H*0.6, len=30+r()*90;
      gctx.beginPath(); gctx.moveTo(x,y); gctx.bezierCurveTo(x+3,y+len*0.3,x-3,y+len*0.7,x+1,y+len);
      gctx.strokeStyle = `rgba(110,100,82,${0.08+r()*0.12})`; gctx.lineWidth = 1+r()*2.2; gctx.stroke();
    }
  }

  function drawFoam(){
    // soapy water texture: milky film plus bubbles
    fctx.clearRect(0,0,W,H);
    fctx.fillStyle = 'rgba(244,249,252,0.72)'; fctx.fillRect(0,0,W,H);
    const r = rand(77);
    for(let i=0;i<Math.round(W*H/90);i++){
      const x=r()*W, y=r()*H, rad=1+r()*r()*7;
      fctx.beginPath(); fctx.arc(x,y,rad,0,Math.PI*2);
      fctx.fillStyle = `rgba(255,255,255,${0.35+r()*0.5})`; fctx.fill();
      fctx.strokeStyle = 'rgba(150,180,200,0.55)'; fctx.lineWidth = 0.7; fctx.stroke();
      if(rad > 3){ fctx.beginPath(); fctx.arc(x-rad*0.35,y-rad*0.35,rad*0.25,0,Math.PI*2); fctx.fillStyle='rgba(255,255,255,0.95)'; fctx.fill(); }
    }
  }

  let soapDirty = false;
  function renderSoap(){
    soapDirty = false;
    sctx.globalCompositeOperation = 'source-over';
    sctx.clearRect(0,0,W,H);
    sctx.drawImage(foam,0,0,W,H);
    sctx.globalCompositeOperation = 'destination-in';
    sctx.drawImage(wet,0,0,W,H);
    sctx.globalCompositeOperation = 'source-over';
  }
  function queueSoap(){ if(!soapDirty){ soapDirty = true; requestAnimationFrame(renderSoap); } }

  const BLADE = () => Math.max(52, W*0.18);

  // the blade is a segment centred on the pointer, kept square to the direction of travel.
  // turning while you move pivots the blade, which is what fanning is.
  let blade = null; // {x,y,ang}
  function ends(b, f){
    const half = BLADE()*(f||1)/2, nx = Math.cos(b.ang + Math.PI/2), ny = Math.sin(b.ang + Math.PI/2);
    return [{x:b.x + nx*half, y:b.y + ny*half}, {x:b.x - nx*half, y:b.y - ny*half}];
  }
  function sweepPath(ctx, a, b, f){
    const [a1,a2] = ends(a, f), [b1,b2] = ends(b, f);
    ctx.beginPath();
    [[a1,a2,b2],[a1,b2,b1],[a1,a2,b1],[a2,b1,b2]].forEach(t => { ctx.moveTo(t[0].x,t[0].y); ctx.lineTo(t[1].x,t[1].y); ctx.lineTo(t[2].x,t[2].y); ctx.closePath(); });
  }
  function angleLerp(a, b, t){ let d = b - a; while(d > Math.PI) d -= 2*Math.PI; while(d < -Math.PI) d += 2*Math.PI; return a + d*t; }

  function moveTo(x, y, painting){
    if(!blade){ blade = {x, y, ang: blade0Ang}; if(painting) stamp(blade, blade); return; }
    const dx = x - blade.x, dy = y - blade.y, dist = Math.hypot(dx, dy);
    if(dist < 1.2) return;
    const steps = Math.ceil(dist / 6);
    const target = Math.atan2(dy, dx);
    for(let i=1;i<=steps;i++){
      const nb = {x: blade.x + dx/steps, y: blade.y + dy/steps, ang: angleLerp(blade.ang, target, 0.22)};
      if(painting) stamp(blade, nb);
      blade = nb;
    }
    blade0Ang = blade.ang;
  }
  let blade0Ang = 0;

  function stamp(a, b){
    if(current === 'scrub'){
      wctx.globalCompositeOperation = 'source-over';
      wctx.fillStyle = wctx.strokeStyle = '#000'; wctx.lineWidth = 4; wctx.lineJoin = 'round'; sweepPath(wctx, a, b, 1.35); wctx.fill(); wctx.stroke();
      soapedOnce = true; queueSoap(); queueProgress();
    } else {
      // squeegee: whatever the blade passes over comes off completely, dirt and soap
      [gctx, wctx].forEach(c => {
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = c.strokeStyle = '#000'; c.lineWidth = 4; c.lineJoin = 'round';
        sweepPath(c, a, b, 1.04); c.fill(); c.stroke();
      });
      queueSoap(); queueProgress();
    }
  }

  function drawTool(){
    tctx.setTransform(dpr,0,0,dpr,0,0); tctx.clearRect(0,0,W,H);
    if(!blade || !showTool) return;
    const b = BLADE();
    tctx.save(); tctx.translate(blade.x, blade.y); tctx.rotate(blade.ang);
    tctx.shadowColor = 'rgba(0,0,0,0.25)'; tctx.shadowBlur = 8; tctx.shadowOffsetY = 3;
    if(current === 'squeegee'){
      tctx.rotate(Math.PI); // handle points the way you're pulling, rubber trails behind
      tctx.fillStyle = '#9AA4AA'; tctx.fillRect(2, -b/2, 4, b);          // rubber
      tctx.fillStyle = '#2A2F33'; tctx.fillRect(-6, -b/2 - 2, 8, b + 4); // channel
      tctx.fillStyle = '#EDB01C';
      tctx.beginPath(); tctx.moveTo(-6,-11); tctx.lineTo(-30,-6); tctx.lineTo(-66,-7); tctx.quadraticCurveTo(-72,0,-66,7); tctx.lineTo(-30,6); tctx.lineTo(-6,11); tctx.closePath(); tctx.fill();
      tctx.shadowColor = 'transparent';
      tctx.fillStyle = 'rgba(0,0,0,0.16)'; tctx.fillRect(-64, 2, 34, 4);
    } else {
      // strip washer: fluffy sleeve on a T-bar
      tctx.fillStyle = '#6E7B83'; tctx.fillRect(-16, -5, -50, 10);
      tctx.fillStyle = '#4A90B8';
      tctx.beginPath(); tctx.roundRect(-14, -b/2 - 4, 22, b + 8, 9); tctx.fill();
      tctx.shadowColor = 'transparent';
      tctx.fillStyle = 'rgba(255,255,255,0.35)';
      for(let y = -b/2; y < b/2; y += 6){ tctx.fillRect(-12, y, 18, 2); }
      tctx.fillStyle = 'rgba(255,255,255,0.9)';
      for(let i=0;i<7;i++){ tctx.beginPath(); tctx.arc(10 + (i%2)*3, -b/2 + 6 + i*(b-12)/6, 3, 0, Math.PI*2); tctx.fill(); }
    }
    tctx.restore();
  }

  // progress: how much of the original grime is gone
  let progQueued = false;
  function grimeLeft(){
    pctx.clearRect(0,0,80,64); pctx.drawImage(grime,0,0,80,64);
    const d = pctx.getImageData(0,0,80,64).data; let s = 0;
    for(let i=3;i<d.length;i+=4) s += d[i];
    return s;
  }
  function queueProgress(){ if(progQueued) return; progQueued = true; setTimeout(updateProgress, 250); }
  function updateProgress(){
    progQueued = false;
    const clean = Math.max(0, Math.min(1, 1 - grimeLeft()/baseline));
    const pct = Math.round(clean*100);
    pctEl.textContent = pct + '% clean';
    barEl.style.width = pct + '%';
    if(current === 'scrub' && !unlocked){
      const sc = soapCoverage();
      if(sc >= 0.99){
        // the whole window is soapy: fill any last specks, then wait for them to pick the squeegee
        wctx.globalCompositeOperation = 'source-over'; wctx.fillStyle = '#000'; wctx.fillRect(0, 0, W, H); queueSoap();
        unlocked = true; lockSqueegee(false);
        setHint('The whole window is soapy! Click “Squeegee” to start squeegeeing.', true);
      }
      else setHint('Step 1: scrub soap over the entire window · ' + Math.floor(sc*100) + '% soaped');
    } else if(current === 'scrub' && unlocked){
      setHint('The whole window is soapy! Click “Squeegee” to start squeegeeing.', true);
    } else if(current === 'squeegee' && clean < 0.995) setHint('Step 2: squeegee all of the glass clean · ' + Math.min(99, Math.floor(clean*100)) + '%');
    if(clean >= 0.995){ pctEl.textContent = '100% clean'; barEl.style.width = '100%'; hint.hidden = true; if(!shownDone){ shownDone = true; done.hidden = false; } }
  }
  function soapCoverage(){
    pctx.clearRect(0,0,80,64); pctx.drawImage(wet,0,0,80,64);
    const d = pctx.getImageData(0,0,80,64).data; let s = 0;
    for(let i=3;i<d.length;i+=4) s += d[i] > 100 ? 1 : 0;
    return s / (80*64);
  }

  function setHint(text, nudge){
    hint.textContent = text; hint.hidden = false;
    toolBtns.forEach(b => b.classList.toggle('nudge', !!nudge && b.dataset.tool === 'squeegee' && current === 'scrub'));
  }

  let unlocked = false;
  function lockSqueegee(on){
    toolBtns.forEach(b => { if(b.dataset.tool === 'squeegee'){ b.setAttribute('aria-disabled', on); b.style.opacity = on ? 0.45 : ''; b.title = on ? 'Scrub the entire window first' : ''; } });
  }
  function selectTool(name){
    if(name === 'squeegee' && !unlocked){ setHint('Scrub soap over the entire window first · ' + Math.floor(soapCoverage()*100) + '% soaped'); return; }
    current = name;
    toolBtns.forEach(b => { const on = b.dataset.tool === name; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); b.classList.remove('nudge'); });
    if(name === 'scrub') setHint(unlocked ? 'The whole window is soapy! Click “Squeegee” to start squeegeeing.' : 'Step 1: drag to scrub soap over the entire window.', unlocked);
    else setHint('Step 2: squeegee all of the glass clean. Turn as you go to fan it.');
  }
  toolBtns.forEach(b => b.addEventListener('click', () => selectTool(b.dataset.tool)));

  function setup(){
    const r = pane.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    if(W < 20 || H < 20) return; // window is on a hidden tab; set up when it's shown
    [view, grime, soap, tool, wet, foam, tmp].forEach(cv => { cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr); });
    gctx = grime.getContext('2d'); sctx = soap.getContext('2d'); tctx = tool.getContext('2d');
    wctx = wet.getContext('2d'); fctx = foam.getContext('2d'); xctx = tmp.getContext('2d');
    [gctx, sctx, tctx, wctx, fctx, xctx].forEach(c => c.setTransform(dpr,0,0,dpr,0,0));
    drawView(); drawGrime(); drawFoam(); renderSoap();
    baseline = grimeLeft() || 1;
    soapedOnce = false; shownDone = false; done.hidden = true; blade = null; unlocked = false; lockSqueegee(true);
    pctEl.textContent = '0% clean'; barEl.style.width = '0%';
    selectTool('scrub');
  }
  setup();
  document.getElementById('reset').addEventListener('click', setup);
  document.getElementById('again').addEventListener('click', setup);
  document.getElementById('done-close').addEventListener('click', () => { done.hidden = true; });
  done.addEventListener('pointerdown', e => e.stopPropagation());
  done.addEventListener('pointermove', e => e.stopPropagation());

  let lastW = W, resizeT; // W stays 0 until Home is visible
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { const w = pane.getBoundingClientRect().width; if(Math.abs(w - lastW) < 2) return; lastW = w; setup(); }, 200); });

  // pointer handling
  let down = false, showTool = false;
  function pos(e){ const r = pane.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; }
  pane.addEventListener('pointerdown', e => {
    down = true; pane.setPointerCapture(e.pointerId);
    const p = pos(e); showTool = true;
    if(!blade || e.pointerType !== 'mouse'){ blade = null; }
    moveTo(p.x, p.y, true); drawTool();
  });
  pane.addEventListener('pointermove', e => {
    if(e.pointerType !== 'mouse' && !down) return;
    const p = pos(e); showTool = true;
    moveTo(p.x, p.y, down); drawTool();
  });
  const end = e => { down = false; if(e.pointerType !== 'mouse'){ showTool = false; blade = null; } drawTool(); };
  pane.addEventListener('pointerup', end); pane.addEventListener('pointercancel', end);
  pane.addEventListener('pointerleave', () => { if(!down){ showTool = false; blade = null; drawTool(); } });
})();
