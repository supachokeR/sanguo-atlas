// แบบทดสอบ: สุ่ม 10 ข้อจากเหตุการณ์ (ที่ไหน/เมื่อใด/ใคร) และทดสอบท้ายเล่มจาก w5 ของแต่ละตอน
window.Quiz = (function () {
  var esc = U.esc, root, qs, at, score, wrong, label;

  function shuffle(a) {
    a = a.slice();
    for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = a[k]; a[k] = a[j]; a[j] = t; }
    return a;
  }
  function uniq(a) { return a.filter(function (v, k) { return a.indexOf(v) === k; }); }
  // ตัวเลือก 4 ข้อ ไม่ซ้ำกัน: คำตอบถูก + ตัวลวง 3 ข้อจาก pool
  function options(correct, pool) {
    return shuffle(shuffle(uniq(pool).filter(function (v) { return v !== correct; })).slice(0, 3).concat([correct]));
  }

  function eventQuestion(e) {
    var types = ['where', 'when'];
    if (e.quizWho && e.keyChar) types.push('who');
    var type = types[Math.floor(Math.random() * types.length)];
    var base = { explain: e.title + ' — ค.ศ. ' + e.year + ' ที่' + e.place + ' ' + e.zh + ': ' + e.what, link: '#map/' + e.id, linkLabel: 'ทบทวนบนแผนที่' };
    if (type === 'where') {
      base.q = 'เหตุการณ์ “' + e.title + '” เกิดขึ้นที่ใด?';
      base.answer = e.place + ' ' + e.zh;
      base.options = options(base.answer, EVENTS.filter(function (x) { return x.place !== e.place; }).map(function (x) { return x.place + ' ' + x.zh; }));
    } else if (type === 'when') {
      base.q = 'เหตุการณ์ “' + e.title + '” เกิดขึ้นในปีใด?';
      var years = [e.year];
      shuffle(EVENTS).forEach(function (x) { // ตัวเลือกปีห่างกันอย่างน้อย 2 ปี
        if (years.length < 4 && years.every(function (y) { return Math.abs(y - x.year) >= 2; })) years.push(x.year);
      });
      base.answer = 'ค.ศ. ' + e.year;
      base.options = shuffle(years).map(function (y) { return 'ค.ศ. ' + y; });
    } else {
      var who = CHARACTERS.find(function (c) { return c.id === e.keyChar; });
      base.q = e.quizWho;
      base.answer = who.name + ' ' + who.zh;
      base.options = options(base.answer, CHARACTERS.map(function (c) { return c.name + ' ' + c.zh; }));
    }
    return base;
  }

  function chapterQuestion(c, pool) {
    var byTitle = Math.random() < 0.5;
    var q = { explain: 'ตอนที่ ' + c.no + ' “' + c.title + '” — ' + c.w5.what + ' (' + c.w5.when + ')', link: U.chapHref(c.no), linkLabel: 'ทบทวนตอนที่ ' + c.no };
    if (byTitle) {
      q.q = 'เหตุการณ์ต่อไปนี้อยู่ในตอนใด?\n“' + c.w5.what + '”';
      q.answer = c.title;
      q.options = options(c.title, pool.map(function (x) { return x.title; }));
    } else {
      q.q = 'ตอนที่ ' + c.no + ' “' + c.title + '” เกิดขึ้นเพราะเหตุใด?';
      q.answer = c.w5.why;
      q.options = options(c.w5.why, pool.map(function (x) { return x.w5.why; }));
    }
    return q;
  }

  function volChapters(v) { return (window.CHAPTERS || []).filter(function (c) { return c.vol === v; }); }

  function start(mode) {
    if (mode === 'ev') {
      qs = shuffle(EVENTS).slice(0, 10).map(eventQuestion);
      label = 'เหตุการณ์สำคัญ';
    } else {
      var pool = volChapters(+mode);
      qs = shuffle(pool).slice(0, 10).map(function (c) { return chapterQuestion(c, pool); });
      label = 'ทดสอบท้ายเล่ม ' + U.th(mode);
    }
    at = 0; score = 0; wrong = [];
    question();
  }

  function home() {
    root.innerHTML = '<div class="quiz"><div class="hero"><h1>แบบทดสอบ</h1><p class="muted">สุ่มคำถามใหม่ทุกครั้ง · เฉลยพร้อมคำอธิบายทันทีหลังตอบ</p></div>' +
      '<div class="grid qmodes"><button class="btn pri" data-start="ev"><b>เหตุการณ์สำคัญ</b><span>10 ข้อ · ใคร / ที่ไหน / เมื่อใด</span></button>' +
      VOLUMES.map(function (v) {
        var n = volChapters(v.vol).length;
        return '<button class="btn" data-start="' + v.vol + '"' + (n < 4 ? ' disabled' : '') + '><b>ทดสอบท้ายเล่ม ' + U.th(v.vol) + '</b><span>' +
          (n < 4 ? 'ต้องมีเนื้อหาอย่างน้อย 4 ตอน (มี ' + n + ')' : Math.min(10, n) + ' ข้อ จาก ' + n + ' ตอน') + '</span></button>';
      }).join('') + '</div></div>';
  }

  function question() {
    var q = qs[at];
    root.innerHTML = '<div class="quiz"><div class="crumb"><a class="btn" href="#quiz" data-home>← เลือกแบบทดสอบ</a><span class="muted">' + esc(label) + ' · ข้อ ' + (at + 1) + '/' + qs.length + ' · ได้ ' + score + ' คะแนน</span></div>' +
      '<div class="card glass"><span class="bar" role="img" aria-label="ความคืบหน้า"><i style="width:' + (at / qs.length * 100) + '%"></i></span>' +
      '<h2 class="qq" id="qq" tabindex="-1">' + esc(q.q) + '</h2><div class="qopts" role="group" aria-labelledby="qq">' +
      q.options.map(function (o, i) { return '<button data-o="' + i + '">' + esc(o) + '</button>'; }).join('') +
      '</div><div id="qfb" aria-live="polite"></div></div></div>';
    root.querySelector('#qq').focus({ preventScroll: true });
  }

  function answer(i) {
    var q = qs[at], right = q.options[i] === q.answer;
    if (right) score++; else wrong.push({ q: q, chosen: q.options[i] });
    root.querySelectorAll('.qopts button').forEach(function (b, k) {
      b.disabled = true;
      if (q.options[k] === q.answer) b.classList.add('ok');
      else if (k === i) b.classList.add('bad');
    });
    var last = at === qs.length - 1;
    root.querySelector('#qfb').innerHTML = '<div class="qfb"><b>' + (right ? '✓ ถูกต้อง' : '✗ ยังไม่ถูก — คำตอบคือ ' + esc(q.answer)) + '</b><p style="margin-top:4px">' + esc(q.explain) + '</p>' +
      '<div class="pctl" style="margin-bottom:0"><button class="btn pri" data-next>' + (last ? 'ดูผลคะแนน' : 'ข้อถัดไป →') + '</button><a class="chip" style="align-self:center" href="' + q.link + '">' + esc(q.linkLabel) + '</a></div></div>';
    root.querySelector('[data-next]').focus();
  }

  function summary() {
    var pct = Math.round(score / qs.length * 100);
    var level = pct >= 90 ? 'ระดับกุนซือ' : pct >= 60 ? 'ระดับแม่ทัพ' : 'ทหารใหม่ ลองทบทวนอีกรอบ';
    root.innerHTML = '<div class="quiz"><div class="card glass" style="text-align:center"><p class="muted">' + esc(label) + '</p><div class="score">' + score + ' / ' + qs.length + '</div>' +
      '<h2>' + level + '</h2><p class="muted">' + pct + '%</p><div class="pctl" style="justify-content:center"><button class="btn pri" data-again>ทำอีกรอบ (สุ่มใหม่)</button><a class="btn" href="#quiz" data-home>เลือกแบบทดสอบอื่น</a></div></div>' +
      (wrong.length ? '<div class="card glass" style="margin-top:14px"><h2 class="sec-t">ข้อที่ตอบผิด</h2><ol class="wrongs">' + wrong.map(function (w) {
        return '<li><b style="white-space:pre-line">' + esc(w.q.q) + '</b><div class="muted">คุณตอบ: ' + esc(w.chosen) + '</div><div>คำตอบ: ' + esc(w.q.answer) + '</div><a class="chip" style="margin-top:6px" href="' + w.q.link + '">ทบทวน → ' + esc(w.q.linkLabel) + '</a></li>';
      }).join('') + '</ol></div>' : '<p class="muted" style="text-align:center;margin-top:14px">ตอบถูกทุกข้อ ไม่มีข้อที่ต้องทบทวน</p>') + '</div>';
  }

  var mode = 'ev';
  function render(el) {
    root = el;
    home();
    root.onclick = function (e) {
      var b = e.target.closest('button, [data-home]'); if (!b) return;
      if (b.dataset.start) { mode = b.dataset.start; start(mode); }
      else if (b.dataset.o != null) answer(+b.dataset.o);
      else if (b.hasAttribute('data-next')) { at++; if (at < qs.length) question(); else summary(); }
      else if (b.hasAttribute('data-again')) start(mode);
      else if (b.hasAttribute('data-home')) { e.preventDefault(); home(); }
    };
  }
  return { render: render };
})();
