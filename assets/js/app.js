// router แบบ hash: #read, #read/1, #read/1-1, #read/1-1@5 (ย่อหน้า), #map/chibi, #map/char:zhuge, #char/zhuge, #time, #quiz, #find/คำค้น
(function () {
  var view = document.getElementById('view');
  var mods = { read: Reader, map: Atlas, char: Characters, time: Timeline, quiz: Quiz, find: Search };

  function route() {
    var parts = location.hash.replace(/^#/, '').split('/');
    var name = mods[parts[0]] ? parts[0] : 'read';
    TTS.halt();
    document.body.dataset.view = name;
    document.body.classList.remove('has-player');
    view.onclick = null; view.onchange = null; view.oninput = null;
    document.querySelectorAll('.tabs a').forEach(function (a) {
      if (a.dataset.tab === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    mods[name].render(view, parts.slice(1).join('/'));
  }
  window.addEventListener('hashchange', route);

  document.getElementById('theme').addEventListener('click', function () {
    var root = document.documentElement, cur = root.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    Store.set('sg_theme', next);
  });

  route();

  // PWA: ลงทะเบียน service worker เฉพาะเมื่อเปิดผ่าน http(s)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
