// TTS engine กลาง ใช้ร่วมกันทั้งห้องอ่านและแผง 5W1H
window.TTS = (function () {
  var synth = window.speechSynthesis || null;
  var RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
  var MAX = 130; // ตัวอักษรต่อ utterance (สเปก ≤ 220; ใช้ค่าต่ำกว่าเพื่อเลี่ยง Chrome ตัดเสียง ~15 วินาที)
  var rate = Store.get('sg_rate', 1);
  if (RATES.indexOf(rate) < 0) rate = 1;
  var voiceName = Store.get('sg_voice', '');
  var units = [], idx = 0, state = 'idle', cb = {}, token = 0, keep = null;

  function clean(t) {
    return String(t).replace(/[㐀-鿿]+/g, ' ').replace(/[(（]\s*[)）]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // แบ่งข้อความเป็นหน่วยประโยค ตัดที่ช่องว่าง โดยเลือกตัดหลังเครื่องหมายจบเมื่อยาวพอ
  function split(text, max) {
    max = max || MAX;
    var out = [], buf = '';
    String(text).split(/\s+/).forEach(function (tok) {
      while (tok.length > max) {
        if (buf) { out.push(buf); buf = ''; }
        out.push(tok.slice(0, max)); tok = tok.slice(max);
      }
      if (!tok) return;
      var cand = buf ? buf + ' ' + tok : tok;
      if (cand.length > max) { out.push(buf); buf = tok; return; }
      buf = cand;
      if (buf.length >= 60 && /[.!?…”"ฯ]$/.test(tok)) { out.push(buf); buf = ''; }
    });
    if (buf) out.push(buf);
    return out;
  }

  function thaiVoices() {
    if (!synth) return [];
    return synth.getVoices().filter(function (v) { return /^th([-_]|$)/i.test(v.lang); });
  }
  function pick() {
    var vs = thaiVoices();
    for (var i = 0; i < vs.length; i++) if (vs[i].name === voiceName) return vs[i];
    return vs[0] || null;
  }
  function set(s) { state = s; if (cb.onState) cb.onState(s); }

  function speak() {
    if (!synth || !units.length) return;
    if (idx >= units.length) { finish(); return; }
    var my = ++token;
    var busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();
    set('playing');
    if (cb.onUnit) cb.onUnit(idx);
    var text = clean(units[idx]);
    if (!text) { idx++; speak(); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH'; u.rate = rate;
    var v = pick(); if (v) u.voice = v;
    u.onend = function () { if (my === token) { idx++; speak(); } };
    u.onerror = function (e) {
      if (my !== token || e.error === 'interrupted' || e.error === 'canceled') return;
      if (e.error === 'not-allowed') { set('paused'); return; }
      idx++; speak();
    };
    keep = u; // กัน Chrome เก็บกวาด utterance ก่อนจบ
    if (busy) setTimeout(function () { if (my === token) synth.speak(u); }, 80);
    else synth.speak(u);
  }
  function finish() {
    token++; idx = 0; set('idle');
    if (cb.onEnd) cb.onEnd();
  }
  function silence() { token++; if (synth) synth.cancel(); }

  if (synth && synth.addEventListener) {
    synth.addEventListener('voiceschanged', function () { if (api.onVoices) api.onVoices(); });
  }
  window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });

  var api = {
    RATES: RATES,
    supported: !!synth,
    split: split, clean: clean, thaiVoices: thaiVoices,
    onVoices: null,
    load: function (u, callbacks, start) {
      silence();
      if (state !== 'idle') set('idle');
      units = u || []; cb = callbacks || {};
      idx = Math.max(0, Math.min(start || 0, units.length - 1));
      state = 'idle';
    },
    halt: function () { silence(); if (state !== 'idle') set('idle'); units = []; cb = {}; },
    toggle: function () { if (state === 'playing') api.pause(); else speak(); },
    play: function (i) { idx = Math.max(0, Math.min(i, units.length - 1)); speak(); },
    pause: function () { silence(); set('paused'); },
    stop: function (i) { silence(); idx = i || 0; set('idle'); if (cb.onUnit) cb.onUnit(idx); },
    seek: function (i) {
      idx = Math.max(0, Math.min(i, units.length - 1));
      if (state === 'playing') speak(); else if (cb.onUnit) cb.onUnit(idx);
    },
    index: function () { return idx; },
    state: function () { return state; },
    rate: function () { return rate; },
    cycle: function (dir) {
      var i = RATES.indexOf(rate) + (dir < 0 ? -1 : 1);
      if (dir < 0) i = Math.max(0, i); else if (i >= RATES.length) i = 0;
      rate = RATES[i]; Store.set('sg_rate', rate);
      if (state === 'playing') speak(); // เริ่มประโยคเดิมใหม่ด้วย rate ใหม่
      return rate;
    },
    voiceName: function () { var v = pick(); return v ? v.name : ''; },
    setVoice: function (n) { voiceName = n; Store.set('sg_voice', n); if (state === 'playing') speak(); }
  };
  return api;
})();
