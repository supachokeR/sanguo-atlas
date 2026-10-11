// ตัวละคร: grid การ์ด → หน้ารายละเอียด + ไทม์ไลน์ + เส้นทางชีวิตบนแผนที่
window.Characters = (function () {
  var esc = U.esc;

  function eventsOf(c) {
    return c.events.map(function (id) { return EVENTS.find(function (e) { return e.id === id; }); }).filter(Boolean)
      .sort(function (a, b) { return a.year - b.year || EVENTS.indexOf(a) - EVENTS.indexOf(b); });
  }
  // ตอนแรกในช่วงที่ตัวละครปรากฏ ซึ่งมีเนื้อหาแล้ว
  function firstChapter(c) {
    var m = /(\d+)\D+(\d+)/.exec(c.chapters || '');
    if (!m) return null;
    for (var n = +m[1]; n <= +m[2]; n++) if (U.chap(n)) return n;
    return null;
  }

  // ลักษณะนิสัย: จุดแข็ง จุดอ่อน พฤติกรรมที่เห็นนิสัย และบทเรียน
  function profile(c) {
    var p = (typeof PROFILES !== 'undefined') && PROFILES[c.id];
    if (!p) return '';
    function traits(list) {
      return '<ul class="traits">' + list.map(function (t) { return '<li><b>' + esc(t[0]) + '</b> — ' + esc(t[1]) + '</li>'; }).join('') + '</ul>';
    }
    return '<h2 class="sec-t" style="margin-top:22px">ลักษณะนิสัย</h2><p>' + esc(p.nature) + '</p>' +
      '<div class="grid tgrid"><section class="tbox good"><h3>จุดแข็ง</h3>' + traits(p.strengths) + '</section>' +
      '<section class="tbox weak"><h3>จุดอ่อน</h3>' + traits(p.flaws) + '</section></div>' +
      '<h3 class="sub-t">พฤติกรรมที่เห็นนิสัย</h3><ul class="moments">' + p.moments.map(function (m) {
        var has = U.chap(m[0]);
        return '<li>' + (has ? '<a class="chip" href="' + U.chapHref(m[0]) + '">ตอนที่ ' + m[0] + '</a>' : '<span class="chip off">ตอนที่ ' + m[0] + '</span>') + ' <span>' + esc(m[1]) + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="note glass" style="margin-top:14px"><b>เรียนรู้จากคนแบบนี้:</b> ' + esc(p.lesson) + '</div>' +
      (p.hist ? '<p class="muted" style="font-size:.92rem;margin-top:8px"><b>นิยายกับประวัติศาสตร์:</b> ' + esc(p.hist) + '</p>' : '');
  }

  function grid(root) {
    root.innerHTML = '<div class="hero"><h1>ตัวละคร</h1><p class="muted">' + CHARACTERS.length + ' ตัวละครหลัก · กดการ์ดเพื่อดูรายละเอียดและเส้นทางชีวิตบนแผนที่</p></div><div class="grid chars">' +
      CHARACTERS.map(function (c) {
        return '<a class="char glass" data-f="' + c.faction + '" href="#char/' + c.id + '"><h2>' + esc(c.name) + ' <span class="zh muted" lang="zh-Hant">' + esc(c.zh) + '</span></h2>' +
          '<div class="muted">' + esc(c.role) + '</div><p style="margin-top:6px;font-size:.95rem">' + esc(c.trait) + '</p><div class="faint" style="font-size:.88rem;margin-top:4px">' + esc(c.years) + ' · ' + esc(FACTIONS[c.faction].name) + ' · ' + eventsOf(c).length + ' เหตุการณ์</div></a>';
      }).join('') + '</div>';
  }

  function detail(root, c) {
    var evs = eventsOf(c), ch = firstChapter(c);
    root.innerHTML = '<div class="crumb"><a class="btn" href="#char">← ตัวละครทั้งหมด</a></div>' +
      '<article class="cdetail glass" data-f="' + c.faction + '"><div class="tags"><span class="tag fac">' + esc(FACTIONS[c.faction].name) + '</span><span class="tag">' + esc(c.years) + '</span></div>' +
      '<h1 style="margin-top:8px">' + esc(c.name) + ' <span class="zh muted" lang="zh-Hant">' + esc(c.zh) + '</span></h1>' +
      '<p class="muted">' + esc(c.role) + '</p><p style="margin-top:10px">' + esc(c.trait) + '</p>' +
      '<div class="pctl">' + (evs.length ? '<a class="btn pri" href="#map/char:' + c.id + '">🗺 ดูเส้นทางชีวิตบนแผนที่</a>' : '') +
      (ch ? '<a class="btn" href="' + U.chapHref(ch) + '">📖 อ่านตอนที่ปรากฏ (เริ่มตอนที่ ' + ch + ')</a>' : '<span class="tag" style="align-self:center">ตอนที่ปรากฏยังไม่ได้เขียน</span>') + '</div>' +
      '<p class="faint" style="font-size:.88rem">ปรากฏในนิยายช่วงตอนที่ ' + esc(c.chapters) + '</p>' +
      '<h2 class="sec-t" style="margin-top:16px">ไทม์ไลน์เหตุการณ์</h2><ol class="tl">' +
      evs.map(function (e, i) {
        return '<li data-f="' + e.faction + '"><a href="#map/' + e.id + '"><b>' + (i + 1) + '. ค.ศ. ' + e.year + '</b> · ' + esc(e.title) + ' <span class="muted">— ' + esc(e.place) + ' <span class="zh" lang="zh-Hant">' + esc(e.zh) + '</span></span></a></li>';
      }).join('') + '</ol>' + profile(c) + '</article>';
  }

  function render(root, arg) {
    var c = CHARACTERS.find(function (x) { return x.id === arg; });
    if (c) detail(root, c); else grid(root);
  }
  return { render: render };
})();
