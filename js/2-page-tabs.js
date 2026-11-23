// WindCO website: Switches between the pages and tabs (holiday page, Home, About us, Services, Plans, Free quote, Privacy, Thank you)
// Pages: the holiday landing page opens first; the five tabs are the main website.
(function(){
  const pages = ['holiday','family-gift','home','about','services','plans','quote','privacy','thanks'];
  const landing = ['holiday','family-gift'];
  const titles = {holiday:'WindCO Window Cleaning | Colorado Window, Screen & Gutter Cleaning', 'family-gift':'WindCO Family Gift: 25% Off', home:'WindCO Window Cleaning', about:'About us · WindCO Window Cleaning', services:'Services · WindCO Window Cleaning', plans:'Plans · WindCO Window Cleaning', quote:'Free quote · WindCO Window Cleaning', privacy:'Privacy policy · WindCO Window Cleaning', thanks:'Thank you · WindCO Window Cleaning'};
  const tabs = [...document.querySelectorAll('.tab')];
  function show(){
    const hash = location.hash.slice(1);
    let id = 'holiday', anchor = null;
    if(pages.includes(hash)) id = hash;
    else if(hash){
      const el = document.getElementById(hash);
      const pg = el && el.closest('[data-page]');
      if(pg){ id = pg.dataset.page.split(' ')[0]; anchor = el; }
    }
    document.querySelectorAll('[data-page]').forEach(el => el.classList.toggle('on', el.dataset.page.split(' ').includes(id)));
    document.body.classList.toggle('lp-mode', landing.includes(id));
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab === id ? 'true' : 'false'));
    document.title = titles[id];
    const go = () => anchor ? anchor.scrollIntoView() : window.scrollTo(0, 0);
    go(); requestAnimationFrame(go);
    window.dispatchEvent(new Event('resize')); // lets the window game size itself once Home is visible
  }
  // on Home the reviews are right below, so just scroll down to them
  document.getElementById('hero-rating').addEventListener('click', e => { e.preventDefault(); document.getElementById('reviews').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
  window.addEventListener('hashchange', show);
  window.addEventListener('load', () => { if(!location.hash || pages.includes(location.hash.slice(1))) window.scrollTo(0, 0); });
  show();
})();
