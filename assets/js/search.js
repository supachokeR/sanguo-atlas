// ค้นหาข้ามทั้งแอป: ตอน / เหตุการณ์ / ตัวละคร
window.Search = (function () {
  var esc = U.esc, root, timer = 0;

  function mark(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function snippet(text, q) {
    var i = text.toLowerCase().indexOf(q), a = Math.max(0, i - 45), b = Math.min(text.length, i + q.length + 80);
    return (a > 0 ? '…' : '') + mark(text.slice(a, b), q) + (b < text.length ? '…' : '');
  }
  function has(q) { return function (s) { return String(s || '').toLowerCase().indexOf(q) >= 0; }; }

  function run(raw) {
    var out = root.querySelector('#results'), q = raw.trim().toLowerCase();
    try { history.replaceState(null, '', '#find' + (q ? '/' + encodeURIComponent(raw.trim()) : '')); } catch (e) {}
    if (q.length < 2) { out.innerHTML = '<p class="muted">พิมพ์อย่างน้อย 2 ตัวอักษร เช่น ขงเบ้ง, 赤壁, เซ็กเพ็ก, ลมตะวันออก</p>'; return; }
    var hit = has(q);
    var chars = CHARACTERS.filter(function (c) { return [c.name, c.zh, c.role, c.trait].some(hit); });
    var evs = EVENTS.filter(function (e) { return [e.title, e.place, e.zh, e.modern, e.who, e.what].some(hit); });
    var chaps = [];
    (window.CHAPTERS || []).forEach(function (c) {
      var n = 0, first = -1;
      c.paragraphs.forEach(function (p, i) { if (hit(p)) { n++; if (first < 0) first = i; } });
      var inTitle = hit(c.title) || hit(c.zh);
      if (n || inTitle) chaps.push({ c: c, n: n, first: first, inTitle: inTitle });
    });
    chaps.sort(function (a, b) { return (b.inTitle - a.inTitle) || (b.n - a.n) || (a.c.no - b.c.no); });
    var total = chars.length + evs.length + chaps.length;
    var h = '<p class="muted" role="status">พบ ' + total + ' รายการ — ตัวละคร ' + chars.length + ' · เหตุการณ์ ' + evs.length + ' · ตอน ' + chaps.length + '</p>';
    if (chars.length) h += '<section class="card glass sres"><h2 class="sec-t">ตัวละคร</h2><ul>' + chars.map(function (c) {
      return '<li data-f="' + c.faction + '"><a href="#char/' + c.id + '"><b>' + mark(c.name, q) + '</b> <span class="zh" lang="zh-Hant">' + mark(c.zh, q) + '</span> <span class="muted">— ' + mark(c.role, q) + '</span></a></li>';
    }).join('') + '</ul></section>';
    if (evs.length) h += '<section class="card glass sres"><h2 class="sec-t">เหตุการณ์</h2><ul>' + evs.map(function (e) {
      return '<li data-f="' + e.faction + '"><a href="#map/' + e.id + '"><b>' + e.year + ' · ' + mark(e.title, q) + '</b> <span class="muted">— ' + mark(e.place, q) + ' <span class="zh" lang="zh-Hant">' + mark(e.zh, q) + '</span></span><br><span class="muted">' + mark(e.what, q) + '</span></a></li>';
    }).join('') + '</ul></section>';
    if (chaps.length) h += '<section class="card glass sres"><h2 class="sec-t">ตอน</h2><ul>' + chaps.slice(0, 60).map(function (x) {
      var c = x.c;
      return '<li data-f="' + (c.factions[0] || 'han') + '"><a href="' + U.chapHref(c.no) + (x.first >= 0 ? '@' + x.first : '') + '"><b>ตอนที่ ' + c.no + ' · ' + mark(c.title, q) + '</b>' +
        (x.n ? ' <span class="tag">' + x.n + ' ย่อหน้า</span><br><span class="muted">' + snippet(c.paragraphs[x.first], q) + '</span>' : '') + '</a></li>';
    }).join('') + '</ul>' + (chaps.length > 60 ? '<p class="faint">แสดง 60 จาก ' + chaps.length + ' ตอน ลองพิมพ์คำให้เจาะจงขึ้น</p>' : '') + '</section>';
    if (!total) h += '<p>ไม่พบ “' + esc(raw.trim()) + '” ลองสะกดแบบอื่น หรือค้นด้วยอักษรจีน</p>';
    out.innerHTML = h;
  }

  function render(el, arg) {
    root = el;
    var q = '';
    try { q = decodeURIComponent(arg || ''); } catch (e) { q = arg || ''; }
    root.innerHTML = '<div class="hero"><h1>ค้นหา</h1><p class="muted">ค้นในเนื้อหาทุกตอน เหตุการณ์บนแผนที่ และตัวละคร</p></div>' +
      '<div class="sbox"><label class="sr" for="q">คำค้น</label><input id="q" type="search" placeholder="พิมพ์ชื่อคน สถานที่ หรือคำในเนื้อเรื่อง" autocomplete="off" value="' + esc(q) + '"></div><div id="results"></div>';
    var input = root.querySelector('#q');
    root.oninput = function (e) {
      if (e.target !== input) return;
      clearTimeout(timer);
      timer = setTimeout(function () { run(input.value); }, 180);
    };
    run(q);
    input.focus({ preventScroll: true });
  }
  return { render: render };
})();
