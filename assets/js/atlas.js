// แผนที่ SVG + pan/zoom + slider เวลา + แผง 5W1H
window.Atlas = (function () {
  var W = 880, H = 700, esc = U.esc;
  var vb, year, sel, root, svg, dyn, timer = null, raf = 0, path = null, pathChar = null;

  function X(lon) { return (lon - 100) * 40; }
  function Y(lat) { return (41 - lat) * 40; }
  function pts(a) { return a.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' '); }
  function ev(id) { return EVENTS.find(function (e) { return e.id === id; }); }
  function era(y) { return ERAS.find(function (r) { return y >= r.from && y <= r.to; }); }

  // หมุดที่พิกัดซ้ำกัน กระจายเป็นวงรัศมี 11 หน่วย (คูณ s ให้คงขนาดบนจอ)
  function positions(s) {
    var groups = {}, out = {};
    EVENTS.forEach(function (e) { var k = e.lon + ',' + e.lat; (groups[k] = groups[k] || []).push(e); });
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.forEach(function (e, i) {
        var x = X(e.lon), y = Y(e.lat);
        if (g.length > 1) { var a = -Math.PI / 2 + i * 2 * Math.PI / g.length; x += Math.cos(a) * 11 * s; y += Math.sin(a) * 11 * s; }
        out[e.id] = [x, y];
      });
    });
    return out;
  }

  function base() {
    var g = '';
    for (var lon = 102; lon <= 122; lon += 2) g += '<line class="gridl" x1="' + X(lon) + '" y1="0" x2="' + X(lon) + '" y2="' + H + '"/>';
    for (var lat = 24; lat <= 40; lat += 2) g += '<line class="gridl" x1="0" y1="' + Y(lat) + '" x2="' + W + '" y2="' + Y(lat) + '"/>';
    var T = { wei: ['วุย', 113, 37.6], shu: ['จ๊ก', 104.2, 28.6], wu: ['ง่อ', 115.5, 27.6] };
    var terr = Object.keys(TERRITORIES).map(function (k) {
      return '<g data-f="' + k + '"><polygon points="' + pts(TERRITORIES[k]) + '"/><text x="' + X(T[k][1]) + '" y="' + Y(T[k][2]) + '">' + T[k][0] + '</text></g>';
    }).join('');
    var sea = COAST.concat([[122, 21], [124, 21], [124, 41.5], [121.6, 41.5]]);
    var rivers = Object.keys(RIVERS).map(function (k) {
      return '<polyline class="river' + (k === 'he' || k === 'jiang' ? ' big' : '') + '" points="' + pts(RIVERS[k]) + '"/>';
    }).join('');
    return '<rect class="land" width="' + W + '" height="' + H + '"/>' + g +
      '<g class="terr" id="terr">' + terr + '</g><polygon class="sea" points="' + pts(sea) + '"/>' + rivers + '<g id="dyn"></g>';
  }

  function pin(e, p, s, on) {
    var n = path ? path.indexOf(e.id) + 1 : 0, r = (on ? 9 : n ? 8 : 6) * s;
    return '<g class="pin' + (path && !n ? ' dim' : '') + '" data-id="' + e.id + '" data-f="' + e.faction + '"><circle class="hit" cx="' + p[0] + '" cy="' + p[1] + '" r="' + 13 * s + '"/>' +
      '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" stroke-width="' + 1.6 * s + '"><title>' + esc(e.title) + ' (' + e.year + ')</title></circle>' +
      (n ? '<text class="pnum" x="' + p[0] + '" y="' + (p[1] + 3.4 * s) + '" font-size="' + 9.5 * s + '">' + n + '</text>' : '') + '</g>';
  }

  function draw() {
    raf = 0;
    if (!svg) return;
    var s = vb.w / W, P = positions(s), h = '';
    svg.setAttribute('viewBox', [vb.x, vb.y, vb.w, vb.h].map(function (n) { return n.toFixed(2); }).join(' '));
    CITIES.forEach(function (c) {
      var x = X(c[2]), y = Y(c[3]);
      h += '<rect class="city" x="' + (x - 2.5 * s) + '" y="' + (y - 2.5 * s) + '" width="' + 5 * s + '" height="' + 5 * s + '"/>' +
        '<text class="cityt" x="' + (x + 6 * s) + '" y="' + (y + 3.5 * s) + '" font-size="' + 10 * s + '">' + c[0] + '</text>';
    });
    if (path) {
      // เส้นทางชีวิตตัวละคร: เส้นประสีก๊ก เชื่อมหมุดตามลำดับปี
      var line = path.filter(function (id) { return ev(id).year <= year; }).map(function (id) { return P[id][0].toFixed(1) + ',' + P[id][1].toFixed(1); }).join(' ');
      h += '<polyline class="route" data-f="' + pathChar.faction + '" points="' + line + '"/>';
    }
    EVENTS.forEach(function (e) { if (e.year <= year && e.id !== sel && !(path && path.indexOf(e.id) >= 0)) h += pin(e, P[e.id], s, false); });
    if (path) path.forEach(function (id) { var e = ev(id); if (e.year <= year && id !== sel) h += pin(e, P[id], s, false); });
    var se = ev(sel);
    if (se && se.year <= year) {
      var p = P[sel];
      h += '<circle class="pulse" data-f="' + se.faction + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + 9 * s + '" stroke-width="' + 2 * s + '"/>' + pin(se, p, s, true) +
        '<text class="plabel" x="' + p[0] + '" y="' + (p[1] - 15 * s) + '" font-size="' + 13 * s + '" stroke-width="' + 4 * s + '">' + esc(se.title) + '</text>';
    }
    dyn.innerHTML = h;
    var show = year >= 220;
    root.querySelector('#terr').style.display = show ? '' : 'none';
    root.querySelector('.approx').hidden = !show;
  }
  function redraw() { if (!raf) raf = requestAnimationFrame(draw); }

  function setVB(x, y, w) {
    w = Math.max(110, Math.min(W, w));
    var h = w * H / W;
    vb = { x: Math.max(0, Math.min(W - w, x)), y: Math.max(0, Math.min(H - h, y)), w: w, h: h };
    redraw();
  }
  function zoomAt(cx, cy, f) {
    var r = svg.getBoundingClientRect();
    var px = vb.x + (cx - r.left) / r.width * vb.w, py = vb.y + (cy - r.top) / r.height * vb.h;
    var nw = Math.max(110, Math.min(W, vb.w * f)), k = nw / vb.w;
    setVB(px - (px - vb.x) * k, py - (py - vb.y) * k, nw);
  }
  function zoomBtn(f) { var r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }

  function setYear(y) {
    year = Math.max(184, Math.min(280, y));
    var range = root.querySelector('#year'), cur = era(year);
    range.value = year;
    range.setAttribute('aria-valuetext', 'ค.ศ. ' + year);
    root.querySelector('#yout').textContent = 'ค.ศ. ' + year + ' · พ.ศ. ' + (year + 543);
    root.querySelectorAll('.eras .btn').forEach(function (b) { b.setAttribute('aria-pressed', String(!!cur && +b.dataset.to === cur.to)); });
    root.querySelectorAll('.evs button').forEach(function (b) { b.classList.toggle('future', ev(b.dataset.id).year > year); });
    redraw();
  }

  function select(id) {
    var e = ev(id); if (!e) return;
    sel = id;
    if (e.year > year) setYear(e.year);
    var s = vb.w / W, x = X(e.lon), y = Y(e.lat);
    if (x < vb.x + 20 * s || x > vb.x + vb.w - 20 * s || y < vb.y + 30 * s || y > vb.y + vb.h - 20 * s) setVB(x - vb.w / 2, y - vb.h / 2, vb.w);
    redraw(); panel();
    root.querySelectorAll('.evs button').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.id === id)); });
    if (!path) { try { history.replaceState(null, '', '#map/' + id); } catch (err) {} }
  }

  function panel() {
    var e = ev(sel), box = root.querySelector('#w5'), i = EVENTS.indexOf(e), r = era(e.year);
    function d(label, val, wide) { return val ? '<div' + (wide ? ' class="wide"' : '') + '><dt>' + label + '</dt><dd>' + val + '</dd></div>' : ''; }
    var chips = e.chapters.map(function (n) {
      return U.chap(n) ? '<a class="chip" href="' + U.chapHref(n) + '">ตอนที่ ' + n + '</a>' : '<span class="chip off" title="ยังไม่ได้เขียน">ตอนที่ ' + n + '</span>';
    }).join(' ');
    box.innerHTML = '<div class="tags"><span class="tag fac" data-f="' + e.faction + '">' + esc(FACTIONS[e.faction].name) + '</span>' +
      (r ? '<span class="tag">' + esc(r.name) + '</span>' : '') + '<span class="tag">' + esc(SOURCE_LABEL[e.source]) + '</span></div>' +
      '<h2>' + esc(e.title) + '</h2><dl class="w5">' +
      d('ใคร', esc(e.who), true) + d('เมื่อใด', 'ค.ศ. ' + e.year + ' · พ.ศ. ' + (e.year + 543)) +
      d('ที่ไหน', esc(e.place) + ' <span class="zh" lang="zh-Hant">' + esc(e.zh) + '</span><br><span class="muted">ปัจจุบัน: ' + esc(e.modern) + '</span>') +
      d('ทำอะไร', esc(e.what), true) + d('ทำไม', esc(e.why), true) + d('อย่างไร', esc(e.how), true) + d('ผลลัพธ์', esc(e.result), true) +
      d('ประวัติศาสตร์กับนิยาย', e.note ? esc(e.note) : '', true) + '</dl>' +
      '<div class="pctl"><button class="btn pri" data-act="read" id="pread">▶ อ่าน</button>' +
      '<button class="btn" data-act="prate" id="prate" aria-label="เร่งความเร็ว">⏩ ' + TTS.rate() + '×</button>' +
      '<button class="btn" data-act="pprev"' + (i <= 0 ? ' disabled' : '') + '>← ก่อนหน้า</button>' +
      '<button class="btn" data-act="pnext"' + (i >= EVENTS.length - 1 ? ' disabled' : '') + '>ถัดไป →</button></div>' +
      '<div><span class="muted" style="font-size:.9rem">อ่านตอนที่เกี่ยวข้อง:</span> ' + chips + '</div>';
    var say = ['เหตุการณ์ ' + e.title, 'ใคร ' + e.who, 'เมื่อใด คริสต์ศักราช ' + e.year + ' ตรงกับพุทธศักราช ' + (e.year + 543),
      'ทำอะไร ' + e.what, 'ที่ไหน ' + e.place + ' ปัจจุบันคือ ' + e.modern, 'ทำไม ' + e.why, 'อย่างไร ' + e.how, 'ผลลัพธ์ ' + e.result];
    if (e.note) say.push('ประวัติศาสตร์กับนิยาย ' + e.note);
    var units = []; say.forEach(function (t) { units = units.concat(TTS.split(t)); });
    TTS.load(units, { onState: function (s) {
      var b = root.querySelector('#pread'); if (b) b.textContent = s === 'playing' ? '❚❚ พัก' : s === 'paused' ? '▶ อ่านต่อ' : '▶ อ่าน';
    } }, 0);
  }

  function playBtn() { var b = root.querySelector('#tplay'); if (b) { b.textContent = timer ? '❚❚' : '▶'; b.setAttribute('aria-label', timer ? 'หยุดเล่นเวลา' : 'เล่นเวลาอัตโนมัติ'); } }
  function stopPlay() { if (timer) { clearInterval(timer); timer = null; } playBtn(); }
  function togglePlay() {
    if (timer) return stopPlay();
    if (year >= 280) setYear(184);
    timer = setInterval(function () {
      if (!svg || !document.body.contains(svg) || year >= 280) return stopPlay();
      setYear(year + 1);
      var es = EVENTS.filter(function (e) { return e.year === year; });
      if (es.length) select(es[es.length - 1].id);
    }, 260);
    playBtn();
  }

  function render(el, arg) {
    root = el; stopPlay();
    vb = { x: 0, y: 0, w: W, h: H };
    var cm = /^char:(.+)$/.exec(arg || '');
    pathChar = cm ? CHARACTERS.find(function (c) { return c.id === cm[1]; }) : null;
    path = pathChar ? pathChar.events.filter(ev).sort(function (a, b) { return ev(a).year - ev(b).year || EVENTS.indexOf(ev(a)) - EVENTS.indexOf(ev(b)); }) : null;
    if (path && !path.length) { path = null; pathChar = null; }
    sel = path ? path[0] : ev(arg) ? arg : 'chibi';
    year = 280;
    root.innerHTML = '<div class="hero"><h1>แผนที่เหตุการณ์</h1><p class="muted">' + EVENTS.length + ' เหตุการณ์สำคัญ ค.ศ. 184–280 · ลากเพื่อเลื่อน หมุนล้อเมาส์หรือถ่างนิ้วเพื่อซูม · กดหมุดเพื่อดู 5W1H</p></div>' +
      '<div class="grid atlas"><section class="glass mapcard" aria-label="แผนที่"><div class="eras">' +
      ERAS.map(function (r) { return '<button class="btn" data-act="era" data-to="' + r.to + '">' + esc(r.name) + ' <span class="faint">' + r.from + '–' + r.to + '</span></button>'; }).join('') +
      '</div>' + (path ? '<div class="pathbar" data-f="' + pathChar.faction + '"><span>เส้นทางชีวิต <b>' + esc(pathChar.name) + '</b> <span class="zh" lang="zh-Hant">' + esc(pathChar.zh) + '</span> · ' + path.length + ' เหตุการณ์ตามลำดับปี</span><span><a class="btn" href="#char/' + pathChar.id + '">← ตัวละคร</a> <button class="btn" data-act="pathoff">ปิดเส้นทาง</button></span></div>' : '') + '<div class="mapwrap"><svg id="map" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="แผนที่จีนสมัยสามก๊ก พร้อมหมุดเหตุการณ์ (ใช้รายการเหตุการณ์ด้านล่างสำหรับคีย์บอร์ด)">' + base() + '</svg>' +
      '<div class="zoom"><button class="btn icon" data-act="zin" aria-label="ซูมเข้า">+</button><button class="btn icon" data-act="zout" aria-label="ซูมออก">−</button><button class="btn icon" data-act="zreset" aria-label="รีเซ็ตมุมมอง">⟲</button></div>' +
      '<span class="approx">ขอบเขตสามก๊กโดยประมาณ (ราว ค.ศ. 230)</span></div>' +
      '<div class="slider"><button class="btn icon" data-act="tplay" id="tplay" aria-label="เล่นเวลาอัตโนมัติ">▶</button>' +
      '<input type="range" id="year" min="184" max="280" step="1" value="280" aria-label="ปี ค.ศ."><output id="yout" for="year"></output></div>' +
      '<div class="legend">' + Object.keys(FACTIONS).map(function (k) { return '<span data-f="' + k + '"><i></i>' + esc(FACTIONS[k].name) + '</span>'; }).join('') + '</div></section>' +
      '<aside class="glass panel" id="w5" aria-live="polite"></aside>' +
      '<section class="glass evlist"><h2 class="sec-t">เหตุการณ์ทั้งหมด</h2><ol class="evs">' +
      EVENTS.map(function (e) { return '<li><button data-act="ev" data-id="' + e.id + '" data-f="' + e.faction + '"><i></i><span class="y">' + e.year + '</span><span>' + esc(e.title) + '</span></button></li>'; }).join('') +
      '</ol></section></div>';
    svg = root.querySelector('#map'); dyn = root.querySelector('#dyn');

    // pan / pinch / click หมุด
    var ptrs = new Map(), drag = null, downId = null, moved = false, pinch = 0;
    svg.addEventListener('pointerdown', function (e) {
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      var g = e.target.closest ? e.target.closest('.pin') : null;
      downId = g ? g.dataset.id : null; moved = false; pinch = 0;
      drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y };
    });
    svg.addEventListener('pointermove', function (e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) {
        var a = Array.from(ptrs.values()), dist = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
        if (pinch && dist) zoomAt((a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2, pinch / dist);
        pinch = dist; moved = true; return;
      }
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      var r = svg.getBoundingClientRect();
      setVB(drag.vx - dx / r.width * vb.w, drag.vy - dy / r.height * vb.h, vb.w);
    });
    function up(e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId); pinch = 0;
      if (!moved && downId && e.type === 'pointerup') select(downId);
      if (ptrs.size === 1) { var p = ptrs.values().next().value; drag = { x: p[0], y: p[1], vx: vb.x, vy: vb.y }; }
    }
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.18 : 0.85); }, { passive: false });

    root.oninput = function (e) { if (e.target.id === 'year') { stopPlay(); setYear(+e.target.value); } };
    root.onclick = function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var a = b.dataset.act, i = EVENTS.indexOf(ev(sel));
      if (a === 'ev') select(b.dataset.id);
      else if (a === 'era') { stopPlay(); setYear(+b.dataset.to); }
      else if (a === 'zin') zoomBtn(0.7);
      else if (a === 'zout') zoomBtn(1 / 0.7);
      else if (a === 'zreset') setVB(0, 0, W);
      else if (a === 'tplay') togglePlay();
      else if (a === 'read') TTS.toggle();
      else if (a === 'pathoff') { path = null; pathChar = null; b.closest('.pathbar').remove(); select(sel); }
      else if (a === 'prate') b.textContent = '⏩ ' + TTS.cycle(1) + '×';
      else if (a === 'pprev' && i > 0) select(EVENTS[i - 1].id);
      else if (a === 'pnext' && i < EVENTS.length - 1) select(EVENTS[i + 1].id);
    };

    setYear(year);
    select(sel);
  }

  return { render: render };
})();
