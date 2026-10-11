// ห้องอ่าน: สารบัญเล่ม → รายการตอน → หน้าอ่านตอน + แถบควบคุมเสียง
window.Reader = (function () {
  var cur = null;       // สถานะของตอนที่เปิดอยู่
  var autoNext = false; // ตั้งเมื่ออ่านจบตอนแล้วต้องอ่านตอนถัดไปต่อทันที
  var W5 = [['who', 'ใคร'], ['what', 'ทำอะไร'], ['where', 'ที่ไหน'], ['when', 'เมื่อใด'], ['why', 'ทำไม'], ['how', 'อย่างไร']];
  var esc = U.esc;

  function has(key, no) { return Store.get(key, []).indexOf(no) >= 0; }
  function flip(key, no, force) {
    var a = Store.get(key, []), i = a.indexOf(no);
    if (i < 0) a.push(no); else if (!force) a.splice(i, 1);
    Store.set(key, a);
    return a.indexOf(no) >= 0;
  }

  function render(root, arg) {
    cur = null;
    var m;
    if ((m = /^(\d+)-(\d+)(?:@(\d+))?$/.exec(arg)) && U.chap(+m[2])) return chapter(root, U.chap(+m[2]), m[3] == null ? null : +m[3]);
    if ((m = /^(\d+)$/.exec(arg)) && VOLUMES[+m[1] - 1]) return volume(root, VOLUMES[+m[1] - 1]);
    toc(root);
  }

  function toc(root) {
    var pos = Store.get('sg_pos', null), done = Store.get('sg_done', []);
    var h = '<div class="hero"><h1>ห้องอ่าน</h1><p class="muted">สามก๊ก <span class="zh">三國演義</span> ของหลอกวนจง <span class="zh">羅貫中</span> · 120 ตอน 4 เล่ม · ค.ศ. 184–280</p></div>';
    if (pos && U.chap(pos.no)) {
      h += '<p style="margin-bottom:16px"><a class="btn pri" href="' + U.chapHref(pos.no) + '">▶ อ่านต่อจากครั้งก่อน — ตอนที่ ' + pos.no + ' ย่อหน้าที่ ' + ((pos.p || 0) + 1) + '</a></p>';
    }
    var marks = Store.get('sg_marks', []).filter(U.chap).sort(function (a, b) { return a - b; });
    if (marks.length) {
      h += '<p class="links" style="margin-bottom:16px;align-items:center"><span class="muted">🔖 ที่คั่นหน้า:</span> ' + marks.map(function (n) {
        return '<a class="chip" href="' + U.chapHref(n) + '">ตอนที่ ' + n + ' ' + esc(U.chap(n).title) + '</a>';
      }).join('') + '</p>';
    }
    var allDone = done.filter(U.chap).length, allWritten = (window.CHAPTERS || []).length;
    h += '<p class="muted" style="margin-bottom:10px">อ่านจบแล้ว ' + allDone + ' จาก 120 ตอน · มีเนื้อหาในแอป ' + allWritten + ' ตอน</p>';
    h += '<div class="grid vols">';
    VOLUMES.forEach(function (v) {
      var n = 0, written = 0;
      for (var i = v.chapters[0]; i <= v.chapters[1]; i++) { if (done.indexOf(i) >= 0) n++; if (U.chap(i)) written++; }
      var pct = Math.round(n / 30 * 100);
      h += '<a class="vol glass" href="#read/' + v.vol + '"><span class="n">เล่ม ' + U.th(v.vol) + '</span><h2>' + esc(v.title) + '</h2>' +
        '<span class="muted">ตอนที่ ' + v.chapters[0] + '–' + v.chapters[1] + ' · ค.ศ. ' + v.years + '</span>' +
        '<span class="faint" style="font-size:.85rem">อ่านแล้ว ' + pct + '% · มีเนื้อหา ' + written + '/30 ตอน</span>' +
        '<span class="bar" role="img" aria-label="อ่านแล้ว ' + pct + ' เปอร์เซ็นต์"><i style="width:' + pct + '%"></i></span></a>';
    });
    root.innerHTML = h + '</div>';
  }

  function volume(root, v) {
    var h = '<div class="crumb"><a class="btn" href="#read">← สารบัญเล่ม</a></div>' +
      '<div class="hero"><h1>เล่ม ' + U.th(v.vol) + ' — ' + esc(v.title) + '</h1><p class="muted">ตอนที่ ' + v.chapters[0] + '–' + v.chapters[1] + ' · ค.ศ. ' + v.years + '</p></div><ol class="chlist glass">';
    for (var no = v.chapters[0]; no <= v.chapters[1]; no++) {
      var ch = U.chap(no), t = esc(ch ? ch.title : CHAPTER_TITLES[no - 1]);
      var flags = (has('sg_done', no) ? ' <span title="อ่านจบแล้ว">✓</span>' : '') + (has('sg_marks', no) ? ' <span title="คั่นหน้าไว้">🔖</span>' : '');
      h += ch
        ? '<li><a href="' + U.chapHref(no) + '"><span class="no">' + no + '</span><span class="t">' + t + '</span><span>' + flags + '</span></a></li>'
        : '<li><div class="row"><span class="no">' + no + '</span><span class="t">' + t + '</span><span class="tag">รอเขียน</span></div></li>';
    }
    root.innerHTML = h + '</ol>';
  }

  function chapter(root, ch, jump) {
    var units = [], pOf = [], first = [], body = '';
    ch.paragraphs.forEach(function (p, pi) {
      first.push(units.length);
      body += '<p data-p="' + pi + '">' + TTS.split(p).map(function (s) {
        var i = units.length; units.push(s); pOf.push(pi);
        return '<span class="u" data-u="' + i + '">' + esc(s) + '</span>';
      }).join(' ') + '</p>';
    });
    var prev = U.chap(ch.no - 1), next = U.chap(ch.no + 1);
    var h = '<article class="book"><div class="crumb"><a class="btn" href="#read/' + ch.vol + '">← เล่ม ' + U.th(ch.vol) + '</a></div>' +
      '<header class="ch-head glass" data-f="' + esc(ch.factions[0] || 'han') + '"><span class="strip">' +
      ch.factions.map(function (f) { return '<i data-f="' + esc(f) + '"></i>'; }).join('') + '</span>' +
      '<div class="k">เล่ม ' + U.th(ch.vol) + ' · ตอนที่ ' + U.th(ch.no) + '</div><h1>' + esc(ch.title) + '</h1>' +
      '<div class="zh" lang="zh-Hant">' + esc(ch.zh) + '</div><div class="muted">ค.ศ. ' + esc(ch.years) + '</div></header>' +
      '<div class="tools"><button class="btn" data-act="fs-" aria-label="ลดขนาดตัวอักษร">A−</button><button class="btn" data-act="fs+" aria-label="เพิ่มขนาดตัวอักษร">A+</button>' +
      '<button class="btn" data-act="mark" id="mark" aria-pressed="' + has('sg_marks', ch.no) + '">🔖 คั่นหน้า</button>' +
      '<button class="btn" data-act="night">◐ โหมดกลางคืน</button></div>' +
      '<div class="note glass" id="novoice" hidden></div>' +
      '<div class="page" id="page">' + body + '</div>' +
      '<section class="box glass"><h2 class="sec-t">สรุป 5W1H ของตอนนี้</h2><dl class="w5">' +
      W5.map(function (k) { return '<div><dt>' + k[1] + '</dt><dd>' + esc(ch.w5[k[0]]) + '</dd></div>'; }).join('') + '</dl></section>';
    if (ch.histNote) h += '<section class="box glass"><h2 class="sec-t">ประวัติศาสตร์กับนิยาย</h2><p>' + esc(ch.histNote) + '</p></section>';
    if (ch.lesson) h += '<section class="box glass"><h2 class="sec-t">ข้อคิด</h2><p>' + esc(ch.lesson) + '</p></section>';
    var evs = (ch.eventIds || []).map(function (id) { return EVENTS.find(function (e) { return e.id === id; }); }).filter(Boolean);
    if (evs.length) {
      h += '<section class="box glass"><h2 class="sec-t">ดูบนแผนที่</h2><div class="links">' + evs.map(function (e) {
        return '<a class="chip" href="#map/' + e.id + '">📍 ' + esc(e.title) + ' (' + e.year + ')</a>';
      }).join('') + '</div></section>';
    }
    h += '<nav class="chnav" aria-label="เลื่อนตอน">' +
      (prev ? '<a class="btn" href="' + U.chapHref(prev.no) + '">← ตอนก่อนหน้า</a>' : '<span></span>') +
      '<button class="btn" data-act="done" id="done" aria-pressed="' + has('sg_done', ch.no) + '">✓ ทำเครื่องหมายว่าอ่านจบ</button>' +
      (next ? '<a class="btn pri" href="' + U.chapHref(next.no) + '">ตอนถัดไป →</a>' : '<span class="tag" style="align-self:center">ตอนถัดไปยังไม่ได้เขียน</span>') +
      '</nav><p class="faint" style="text-align:center;margin-top:14px;font-size:.85rem">คีย์ลัด: <kbd>Space</kbd> อ่าน/พัก · <kbd>]</kbd> เร็วขึ้น · <kbd>[</kbd> ช้าลง · <kbd>←</kbd> <kbd>→</kbd> ย่อหน้าก่อน/ถัดไป · กดที่ย่อหน้าเพื่อเริ่มอ่านจากตรงนั้น</p></article>' +
      '<div class="player glass" role="group" aria-label="ควบคุมเสียงอ่าน">' +
      '<button class="btn icon" data-act="prev" aria-label="ย่อหน้าก่อนหน้า" title="ย่อหน้าก่อนหน้า">⏮</button>' +
      '<button class="btn pri" data-act="play" id="play">▶ อ่าน</button>' +
      '<button class="btn icon" data-act="stop" aria-label="หยุด" title="หยุด">■</button>' +
      '<button class="btn icon" data-act="next" aria-label="ย่อหน้าถัดไป" title="ย่อหน้าถัดไป">⏭</button>' +
      '<button class="btn" data-act="rate" id="rate" aria-label="เร่งความเร็ว" title="เร่งความเร็ว"></button>' +
      '<select id="voice" aria-label="เลือกเสียงอ่าน"></select>' +
      '<label><input type="checkbox" id="auto"' + (Store.get('sg_auto', false) ? ' checked' : '') + '> อ่านตอนถัดไปอัตโนมัติ</label></div>';
    root.innerHTML = h;
    document.body.classList.add('has-player');

    var page = root.querySelector('#page'), playB = root.querySelector('#play'), rateB = root.querySelector('#rate');
    var fs = Store.get('sg_font', 19);
    function setFs(v) { fs = Math.max(15, Math.min(27, v)); page.style.setProperty('--fs', fs + 'px'); Store.set('sg_font', fs); }
    setFs(fs);
    function rateLbl() { rateB.textContent = '⏩ ' + TTS.rate() + '×'; }
    rateLbl();

    function hl(i) {
      var o = page.querySelector('.u.on'); if (o) o.classList.remove('on');
      var s = page.querySelector('.u[data-u="' + i + '"]'); if (!s) return;
      s.classList.add('on');
      s.scrollIntoView({ block: 'center', behavior: U.calm() ? 'auto' : 'smooth' });
      Store.set('sg_pos', { no: ch.no, u: i, p: pOf[i] });
    }
    function st(s) { playB.textContent = s === 'playing' ? '❚❚ พัก' : s === 'paused' ? '▶ อ่านต่อ' : '▶ อ่าน'; }
    function end() {
      flip('sg_done', ch.no, true);
      root.querySelector('#done').setAttribute('aria-pressed', 'true');
      if (root.querySelector('#auto').checked && next) { autoNext = true; location.hash = U.chapHref(next.no); }
    }

    var pos = Store.get('sg_pos', null);
    var start = pos && pos.no === ch.no && pos.u < units.length ? pos.u : 0;
    if (jump != null && jump < first.length) start = first[jump]; // มาจากผลค้นหา: ไปย่อหน้าที่ระบุ
    TTS.load(units, { onUnit: hl, onState: st, onEnd: end }, start);
    if (start > 0) hl(start); else Store.set('sg_pos', { no: ch.no, u: 0, p: 0 });

    function para(d) {
      var p = Math.max(0, Math.min(first.length - 1, pOf[TTS.index()] + d));
      TTS.seek(first[p]);
    }
    cur = {
      play: function () { TTS.toggle(); },
      rate: function (d) { TTS.cycle(d); rateLbl(); },
      para: para
    };

    function fillVoices(showHint) {
      var sel = root.querySelector('#voice'), hint = root.querySelector('#novoice');
      if (!sel) return;
      var vs = TTS.thaiVoices(), now = TTS.voiceName();
      sel.disabled = !vs.length;
      sel.innerHTML = vs.length ? vs.map(function (v) {
        return '<option value="' + esc(v.name) + '"' + (v.name === now ? ' selected' : '') + '>' + esc(v.name) + '</option>';
      }).join('') : '<option>ไม่พบเสียงภาษาไทย</option>';
      if (vs.length) hint.hidden = true;
      else if (showHint) {
        hint.hidden = false;
        hint.textContent = TTS.supported
          ? 'ไม่พบเสียงอ่านภาษาไทยในเบราว์เซอร์นี้ — Windows: Settings → Time & Language → Language → เพิ่ม "ไทย" พร้อม Speech pack · macOS: System Settings → Accessibility → Spoken Content → เพิ่มเสียง Thai (Kanya) · Android/iOS มีเสียงไทยมาให้แล้ว (ลองเปิดด้วย Chrome หรือ Safari)'
          : 'เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง (speechSynthesis) ลองใช้ Chrome, Edge หรือ Safari รุ่นใหม่';
      }
    }
    fillVoices(!TTS.supported);
    TTS.onVoices = function () { fillVoices(true); };
    setTimeout(function () { fillVoices(true); }, 1500);

    root.onchange = function (e) {
      if (e.target.id === 'voice') TTS.setVoice(e.target.value);
      if (e.target.id === 'auto') Store.set('sg_auto', e.target.checked);
    };
    root.onclick = function (e) {
      var b = e.target.closest('[data-act]');
      if (b) {
        var a = b.dataset.act;
        if (a === 'play') cur.play();
        else if (a === 'stop') TTS.stop(first[pOf[TTS.index()]]);
        else if (a === 'prev') para(-1);
        else if (a === 'next') para(1);
        else if (a === 'rate') cur.rate(1);
        else if (a === 'fs-') setFs(fs - 1);
        else if (a === 'fs+') setFs(fs + 1);
        else if (a === 'night') document.getElementById('theme').click();
        else if (a === 'mark') b.setAttribute('aria-pressed', flip('sg_marks', ch.no));
        else if (a === 'done') b.setAttribute('aria-pressed', flip('sg_done', ch.no));
        return;
      }
      var p = e.target.closest('#page p');
      if (p && !String(window.getSelection && getSelection())) TTS.play(first[+p.dataset.p]);
    };

    if (autoNext) { autoNext = false; TTS.play(0); }
  }

  document.addEventListener('keydown', function (e) {
    if (!cur || document.body.dataset.view !== 'read' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA') return;
    if (e.key === ' ') { if (t === 'BUTTON' || t === 'A') return; e.preventDefault(); cur.play(); }
    else if (e.key === ']') cur.rate(1);
    else if (e.key === '[') cur.rate(-1);
    else if (e.key === 'ArrowLeft') cur.para(-1);
    else if (e.key === 'ArrowRight') cur.para(1);
  });

  return { render: render };
})();
