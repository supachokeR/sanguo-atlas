// localStorage wrapper — ทุกครั้ง try/catch; ถ้าใช้ไม่ได้จะเก็บในหน่วยความจำแทน
window.Store = (function () {
  var mem = {};
  function get(k, d) {
    try {
      var v = localStorage.getItem(k);
      if (v != null) return JSON.parse(v);
    } catch (e) {}
    return k in mem ? mem[k] : d;
  }
  function set(k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  return { get: get, set: set };
})();

// helper กลาง
window.U = {
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  },
  th: function (n) { return String(n).replace(/\d/g, function (d) { return '๐๑๒๓๔๕๖๗๘๙'[d]; }); },
  calm: function () { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); },
  chap: function (no) { return (window.CHAPTERS || []).find(function (c) { return c.no === no; }); },
  chapHref: function (no) { return '#read/' + Math.ceil(no / 30) + '-' + no; }
};
