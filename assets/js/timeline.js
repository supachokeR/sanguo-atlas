// ไทม์ไลน์ 5 ยุค ค.ศ. 184–280
window.Timeline = (function () {
  var esc = U.esc;
  function render(root) {
    root.innerHTML = '<div class="hero"><h1>ไทม์ไลน์</h1><p class="muted">5 ยุค ค.ศ. 184–280 · กดเหตุการณ์เพื่อเปิดบนแผนที่</p></div>' +
      ERAS.map(function (r) {
        var evs = EVENTS.filter(function (e) { return e.year >= r.from && e.year <= r.to; });
        return '<section class="era glass"><h2>' + esc(r.name) + ' <span class="muted" style="font-size:.9rem">ค.ศ. ' + r.from + '–' + r.to + '</span></h2><ol class="tl">' +
          evs.map(function (e) {
            return '<li data-f="' + e.faction + '"><a href="#map/' + e.id + '"><b>' + e.year + '</b> · ' + esc(e.title) + ' <span class="muted">— ' + esc(e.place) + '</span></a></li>';
          }).join('') + '</ol></section>';
      }).join('');
  }
  return { render: render };
})();
