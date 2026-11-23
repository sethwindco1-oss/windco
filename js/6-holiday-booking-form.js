// WindCO website: Holiday booking form (Christmas landing page): checks every box and sends the request
// Holiday booking form: shows the family gift box for dates before December 18 and sends the request
(function(){
  const $ = id => document.getElementById(id);
  const ids = ['lp-name','lp-phone','lp-email','lp-address','lp-type','lp-pkg','lp-date','lp-time','lp-notes','lp-family'];
  const val = () => Object.fromEntries(ids.map(i => [i, $(i).value.trim()]));
  const isEarly = () => new Date() < new Date(2026, 11, 18); // the deal depends on when they book, not the quote date
  function update(){ const early = isEarly(val()); $('lp-early').hidden = !early; $('lp-late').hidden = early; }
  ids.forEach(i => { $(i).addEventListener('input', update); $(i).addEventListener('change', update); });
  update();
  windcoPhone($('lp-phone'));
  windcoMap($('lp-address'), $('lp-map'));
  const src = windcoSource('lp-source', 'lp-code-wrap', 'lp-code');
  $('lp-form').addEventListener('submit', async e => {
    e.preventDefault();
    const v = val(), st = $('lp-status'), btn = $('lp-send');
    st.className = 'lp-span2';
    const emailOk = windcoEmailOk(v['lp-email']);
    const bad = windcoCheck([[$('lp-name'), !!v['lp-name']], [$('lp-phone'), windcoPhoneOk(v['lp-phone'])], [$('lp-email'), emailOk], [$('lp-address'), v['lp-address'].length >= 5], [$('lp-date-btn'), !!v['lp-date']], [$('lp-time'), !!v['lp-time']], [$('lp-source'), !!$('lp-source').value], [$('lp-code'), src.codeOk()]]);
    if(bad){
      st.className = 'lp-span2 err';
      st.textContent = bad.id === 'lp-phone' && v['lp-phone'] ? 'Please enter a 10-digit phone number.' : bad.id === 'lp-email' && v['lp-email'] ? 'Please enter a valid email address, like name@email.com.' : bad.id === 'lp-code' ? (src.code() ? 'That code doesn\u2019t match. Check the code printed on your door hanger.' : 'Enter the code from your door hanger.') : 'Please fill out every field so we can set up your free quote.';
      bad.focus();
      return;
    }
    const fields = {
      'Name': v['lp-name'], 'Phone': v['lp-phone'], 'Email': v['lp-email'], 'Address': v['lp-address'], 'Google Maps': windcoMapUrl(v['lp-address']),
      'Type of clean': v['lp-type'], 'Package': v['lp-pkg'], 'Preferred date for free quote': windcoDateLabel(v['lp-date']), 'Preferred time': windcoTime(v['lp-time']), 'Notes': v['lp-notes'] || 'None',
      'How they heard about us': $('lp-source').value
    };
    if(src.isHanger()) fields['Door hanger code'] = src.code();
    if(isEarly(v)){ fields['Early booking (15% off their clean)'] = 'Yes'; fields['Friend/family for 10% off'] = v['lp-family'] || 'Not given'; }
    btn.disabled = true; btn.textContent = 'Sending…';
    const ok = await windcoSend('Holiday clean request: ' + v['lp-name'], fields, v['lp-email'], WINDCO_HOLIDAY_KEY);
    btn.disabled = false; btn.textContent = 'Request my holiday clean';
    if(ok){
      $('lp-form').querySelectorAll('input, textarea').forEach(el => { el.value = ''; }); $('lp-time').value = ''; $('lp-source').value = ''; src.sync(); windcoDateSet('lp-date', ''); update(); $('lp-map').hidden = true;
      st.className = 'lp-span2'; st.textContent = 'Your request comes straight to us. You can also call or text (720) 691-9193.';
      windcoThanks(v['lp-name'], v['lp-phone']);
    } else {
      const body = Object.entries(fields).map(([k, x]) => k + ': ' + x).join('\n');
      st.className = 'lp-span2 err';
      st.innerHTML = 'We couldn\u2019t send that automatically. Please call or text <a href="tel:+17206919193">(720) 691-9193</a>, or <a href="mailto:sethwindco1@gmail.com?subject=' + encodeURIComponent('Holiday clean request: ' + v['lp-name']) + '&body=' + encodeURIComponent(body) + '">email it to us</a>.';
    }
  });
})();
