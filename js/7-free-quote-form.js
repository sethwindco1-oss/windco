// WindCO website: Free Quote form (main website): checks every box and sends the request
// Quote form: checks every field, sends the request, then shows the thank-you page
(function(){
  const f = document.getElementById('quote-form');
  const $ = id => document.getElementById(id);
  let text = '';
  windcoPhone($('q-phone'));
  windcoMap($('q-address'), $('q-map'));
  const src = windcoSource('q-source', 'q-code-wrap', 'q-code');
  const boxes = [['q-out','Outside glass'],['q-in','Inside glass'],['q-screens','Screen cleaning'],['q-repair','Screen repair'],['q-tracks','Tracks'],['q-gutters','Gutters'],['q-solar','Solar panels']];
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('q-name').value.trim(), phone = $('q-phone').value.trim(), addr = $('q-address').value.trim(), email = $('q-email').value.trim();
    const emailOk = windcoEmailOk(email);
    const items = boxes.filter(([id]) => $(id).checked).map(([,l]) => l);
    const fs = f.querySelector('fieldset');
    fs.classList.toggle('invalid', items.length === 0);
    const bad = windcoCheck([[$('q-name'), !!name], [$('q-phone'), windcoPhoneOk(phone)], [$('q-email'), emailOk], [$('q-address'), addr.length >= 5], [$('q-date-btn'), !!$('q-date').value], [$('q-time'), !!$('q-time').value], [$('q-source'), !!$('q-source').value], [$('q-code'), src.codeOk()]]);
    if(bad || !items.length){
      $('q-error').textContent = bad && bad.id === 'q-code' ? (src.code() ? 'That code doesn\u2019t match. Check the code printed on your door hanger.' : 'Enter the code from your door hanger.') : !windcoPhoneOk(phone) && phone ? 'Please enter a 10-digit phone number.' : !emailOk && email ? 'Please enter a valid email address, like name@email.com.' : (!items.length && !bad ? 'Pick at least one thing for us to clean.' : 'Please fill out every field so we can give you an accurate quote.');
      (bad || fs.querySelector('input')).focus();
      return;
    }
    $('q-error').textContent = '';
    $('q-result').classList.remove('show'); $('q-sent').classList.remove('show');
    const fields = {
      'Name': name, 'Phone': phone, 'Email': email, 'Address': addr, 'Google Maps': windcoMapUrl(addr),
      'Property': $('q-type').value + ', ' + $('q-stories').value, 'Windows': $('q-count').value,
      'Clean': items.join(', '), 'How often': $('q-freq').value,
      'Preferred date for free quote': windcoDateLabel($('q-date').value), 'Preferred time': windcoTime($('q-time').value),
      'Notes': $('q-notes').value.trim() || 'None',
      'How they heard about us': $('q-source').value
    };
    if(src.isHanger()) fields['Door hanger code'] = src.code();
    text = 'Quote request for WindCO Window Cleaning\n' + Object.entries(fields).map(([k, v]) => k + ': ' + v).join('\n');
    const btn = $('q-send'); btn.disabled = true; btn.textContent = 'Sending…';
    const ok = await windcoSend('Quote request: ' + name, fields, email);
    btn.disabled = false; btn.textContent = 'Send my quote request';
    if(ok){
      f.querySelectorAll('input[type=text], input[type=tel], input[type=email], input[type=date], textarea').forEach(el => { el.value = ''; }); $('q-time').value = ''; $('q-source').value = ''; src.sync(); windcoDateSet('q-date', '');
      $('q-map').hidden = true;
      windcoThanks(name, phone);
    } else {
      $('q-text').textContent = text;
      $('q-mail').href = 'mailto:sethwindco1@gmail.com?subject=' + encodeURIComponent('Quote request: ' + name) + '&body=' + encodeURIComponent(text);
      $('q-result').classList.add('show');
      $('q-copied').textContent = '';
    }
  });
  $('q-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text); $('q-copied').textContent = 'Copied.'; }
    catch(err){ $('q-copied').textContent = 'Copy blocked here. Select the text above and copy it.'; }
  });
})();
