// WindCO website: Shared form tools: sending to Web3Forms (your access keys are here), thank-you page, phone dashes, Google Maps links, pop-up calendar, red highlights for missing boxes
// Sends a form to WindCO's inbox through Web3Forms (this access key is meant to be public)
const WINDCO_FORM = 'https://api.web3forms.com/submit';
const WINDCO_KEY = 'b38318da-f836-40eb-b17c-9f884ef52500';         // main Free Quote form
const WINDCO_HOLIDAY_KEY = '8caabbf9-af7d-4c61-a52c-7aff5cb2e4ea'; // holiday booking form
async function windcoSend(subject, fields, replyTo, key){
  const data = Object.assign({access_key: key || WINDCO_KEY, subject: subject, from_name: 'WindCO Website'}, fields);
  if(replyTo) data.replyto = replyTo;
  const send = fetch(WINDCO_FORM, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(data)})
    .then(async res => {
      if(!res.ok) return false;
      const out = await res.json().catch(() => ({}));
      return out.success === true || out.success === 'true';
    })
    .catch(() => false);
  // If the form service is slow to answer the page, don't leave people waiting.
  // After 5 seconds, stop waiting (the request keeps going in the background).
  const slow = new Promise(resolve => setTimeout(() => resolve('slow'), 5000));
  return Promise.race([send, slow]);
}
// Show the green thank-you page
function windcoThanks(name, phone){
  const msg = document.getElementById('thanks-msg');
  if(msg) msg.textContent = 'Thanks, ' + name + '! We got your request and we\u2019ll call or text you at ' + phone + ' soon to set up your free quote.';
  location.hash = '#thanks';
}
// Phone numbers: digits only, dashes added as you type (720-555-0123)
function windcoPhone(el){
  el.addEventListener('input', () => {
    let d = el.value.replace(/\D/g, '');
    if(d.length > 10 && d[0] === '1') d = d.slice(1);
    d = d.slice(0, 10);
    el.value = d.length > 6 ? d.slice(0,3) + '-' + d.slice(3,6) + '-' + d.slice(6) : d.length > 3 ? d.slice(0,3) + '-' + d.slice(3) : d;
  });
}
function windcoPhoneOk(v){ return v.replace(/\D/g, '').length === 10; }
// Address: keep a Google Maps link up to date under the box
function windcoMapUrl(a){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a); }
function windcoMap(input, link){
  const upd = () => { const a = input.value.trim(); link.hidden = a.length < 5; link.href = windcoMapUrl(a); };
  input.addEventListener('input', upd); upd();
}
// 14:30 -> 2:30 PM
function windcoTime(t){ if(!t) return ''; const [h, m] = t.split(':').map(Number); return ((h % 12) || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); }
// Email must look like name@domain.com
function windcoEmailOk(e){ return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(e); }
// Our own pop-up calendar (works the same on every phone and browser)
const WINDCO_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function windcoDateLabel(v){ if(!v) return ''; const [y, m, d] = v.split('-').map(Number); return new Date(y, m-1, d).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}); }
function windcoDateSet(id, v){
  const input = document.getElementById(id), btn = document.getElementById(id + '-btn');
  if(!input || !btn) return;
  input.value = v;
  btn.querySelector('.date-text').textContent = v ? windcoDateLabel(v) : 'Pick a date';
  btn.classList.toggle('has-date', !!v);
  if(v) btn.classList.remove('invalid');
  input.dispatchEvent(new Event('change', {bubbles: true}));
}
function windcoCalendar(id){
  const input = document.getElementById(id), btn = document.getElementById(id + '-btn'), cal = document.getElementById(id + '-cal');
  if(!input || !btn || !cal) return;
  const today = new Date(); today.setHours(0,0,0,0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const pad = n => String(n).padStart(2, '0');
  const key = d => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  function draw(){
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m+1, 0).getDate();
    const atStart = y === today.getFullYear() && m === today.getMonth();
    let html = '<div class="cal-head"><button type="button" class="cal-nav" data-step="-1" aria-label="Previous month"' + (atStart ? ' disabled' : '') + '>‹</button><span class="cal-title">' + WINDCO_MONTHS[m] + ' ' + y + '</span><button type="button" class="cal-nav" data-step="1" aria-label="Next month">›</button></div>';
    html += '<div class="cal-grid">' + ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => '<span class="cal-dow">' + d + '</span>').join('');
    for(let i = 0; i < first; i++) html += '<span></span>';
    for(let d = 1; d <= days; d++){
      const date = new Date(y, m, d), k = key(date), past = date < today;
      const cls = 'cal-day' + (k === input.value ? ' sel' : '') + (k === key(today) ? ' today' : '');
      html += '<button type="button" class="' + cls + '" data-date="' + k + '"' + (past ? ' disabled' : '') + ' aria-label="' + windcoDateLabel(k) + '">' + d + '</button>';
    }
    cal.innerHTML = html + '</div>';
  }
  function open(){ if(input.value){ const [yy, mm] = input.value.split('-').map(Number); view = new Date(yy, mm-1, 1); } draw(); cal.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
  function close(){ cal.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', e => { e.stopPropagation(); cal.hidden ? open() : close(); });
  cal.addEventListener('click', e => {
    e.stopPropagation();
    const nav = e.target.closest('.cal-nav'), day = e.target.closest('.cal-day');
    if(nav && !nav.disabled){ view = new Date(view.getFullYear(), view.getMonth() + Number(nav.dataset.step), 1); draw(); }
    if(day && !day.disabled){ windcoDateSet(id, day.dataset.date); close(); btn.focus(); }
  });
  document.addEventListener('click', e => { if(!cal.hidden && !cal.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !cal.hidden){ close(); btn.focus(); } });
}
windcoCalendar('q-date');
windcoCalendar('lp-date');
// Mark missing fields red and return the first one
function windcoCheck(list){
  let first = null;
  list.forEach(([el, ok]) => { el.classList.toggle('invalid', !ok); if(!ok && !first) first = el; if(!el.dataset.watch){ el.dataset.watch = 1; el.addEventListener('input', () => el.classList.remove('invalid')); el.addEventListener('change', () => el.classList.remove('invalid')); } });
  return first;
}
// "How did you hear about us?": the code box only shows (and is only required) when they pick Door hanger
const WINDCO_CODES = ['CAROL15', 'DECK15', 'DASH15'];
function windcoSource(selId, wrapId, codeId){
  const sel = document.getElementById(selId), wrap = document.getElementById(wrapId), code = document.getElementById(codeId);
  const sync = () => { const hanger = sel.value === 'Door hanger'; wrap.hidden = !hanger; if(!hanger){ code.value = ''; code.classList.remove('invalid'); } };
  sel.addEventListener('change', sync);
  code.addEventListener('input', () => { code.value = code.value.toUpperCase().replace(/\s+/g, ''); });
  sync();
  return {
    sync,
    isHanger: () => sel.value === 'Door hanger',
    code: () => code.value.trim().toUpperCase(),
    codeOk: () => sel.value !== 'Door hanger' || WINDCO_CODES.includes(code.value.trim().toUpperCase())
  };
}
