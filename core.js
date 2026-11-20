/* LockPlan core: วันที่, ตัวแยกภาษาไทย, streak, วาดวอลเปเปอร์ (ไม่มี DOM — เทสต์ด้วย Node ได้) */
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.Core = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const MONTHS_S = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const DOW_S = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  const DOW_L = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const QS = {
    1: { name: 'สำคัญและเร่งด่วน', icon: 'flame', color: '#d0533f', bg: '#fbefec', wp: '#ff8f78' },
    2: { name: 'สำคัญ', icon: 'star', color: '#3d5a98', bg: '#edf1f8', wp: '#93b2ff' },
    3: { name: 'เร่งด่วน', icon: 'bolt', color: '#c08a2b', bg: '#faf3e4', wp: '#f0c46a' },
    4: { name: 'สักวันหนึ่ง', icon: 'moon', color: '#7d838d', bg: '#f1f2f4', wp: '#bcc1ca' }
  };
  const quadrantOf = (u, i) => (u && i ? 1 : i ? 2 : u ? 3 : 4);
  const yearLabel = (y, be) => (be ? y + 543 : y);
  const fmtShort = s => { const d = parseYmd(s); return `${d.getDate()} ${MONTHS_S[d.getMonth()]}`; };

  /* ---------- ตัวแยกข้อความไทย ---------- */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const MONTH_RE = new RegExp('(\\d{1,2})\\s?(' + MONTHS.join('|') + '|' + MONTHS_S.map(a => esc(a).replace(/\\\./g, '\\.?')).join('|') + ')\\s?(\\d{2,4})?');
  const monthIndex = tok => {
    let i = MONTHS.indexOf(tok); if (i >= 0) return i;
    const t = tok.replace(/\./g, '');
    return MONTHS_S.findIndex(a => a.replace(/\./g, '') === t);
  };
  const WD = { 'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'พฤหัส': 4, 'ศุกร์': 5, 'เสาร์': 6 };
  const resolveYear = y => { if (!y) return null; y = +y; if (y < 100) y += 2500; if (y > 2400) y -= 543; return y; };

  function parseQuick(text, now = new Date(), defaultQ = null) {
    const original = String(text || '').trim();
    let s = ' ' + original + ' ';
    const today = startOfDay(now);
    let date = null, time = null;
    const cut = (re, fn) => {
      const m = s.match(re); if (!m) return false;
      const r = fn(m); if (r === false) return false;
      s = s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length); return true;
    };
    const setD = d => { date = ymd(d); };
    const future = d => (d < today ? null : d);

    // ---- วันที่ (ใช้ตัวแรกที่เจอ) ----
    const dateRules = [
      [/มะรืนนี้|มะรืน/, () => setD(addDays(today, 2))],
      [/พรุ่งนี้/, () => setD(addDays(today, 1))],
      [/วันนี้|คืนนี้/, () => setD(today)],
      [/วัน(จันทร์|อังคาร|พุธ|พฤหัสบดี|พฤหัส|ศุกร์|เสาร์|อาทิตย์)\s?(หน้า)?/, m => setD(nextDow(WD[m[1]], !!m[2]))],
      [/สัปดาห์หน้า|อาทิตย์หน้า/, () => setD(addDays(today, 7))],
      [/(จันทร์|อังคาร|พุธ|พฤหัสบดี|พฤหัส|ศุกร์|เสาร์)\s?(หน้า)?/, m => setD(nextDow(WD[m[1]], !!m[2]))],
      [MONTH_RE, m => mkDate(+m[1], monthIndex(m[2]), resolveYear(m[3]))],
      [/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, m => mkDate(+m[1], +m[2] - 1, resolveYear(m[3]))],
      [/(?:วัน)?ที่\s?(\d{1,2})(?![\d/:.])/, m => {
        const d = +m[1]; if (d < 1 || d > 31) return false;
        let c = new Date(today.getFullYear(), today.getMonth(), d);
        if (c < today) c = new Date(today.getFullYear(), today.getMonth() + 1, d);
        setD(c);
      }]
    ];
    function nextDow(dow, next) {
      let diff = (dow - today.getDay() + 7) % 7;
      if (next) diff = diff === 0 ? 7 : diff + 7;
      return addDays(today, diff);
    }
    function mkDate(d, mi, y) {
      if (mi < 0 || mi > 11 || d < 1 || d > 31) return false;
      let c = new Date(y || today.getFullYear(), mi, d);
      if (c.getMonth() !== mi) return false;
      if (!y && c < today) c = new Date(today.getFullYear() + 1, mi, d);
      setD(c);
    }
    for (const [re, fn] of dateRules) if (cut(re, fn)) break;

    // ---- เวลา ----
    const T = (h, m) => { if (h > 23 || m > 59) return false; time = `${pad(h)}:${pad(m)}`; };
    const half = x => (x ? 30 : 0);
    const timeRules = [
      [/เที่ยงคืน/, () => T(0, 0)],
      [/(\d{1,2})[:.](\d{2})\s?(?:น\.?)?/, m => T(+m[1], +m[2])],
      [/บ่าย\s?(\d{1,2})?\s?(?:โมง)?\s?(ครึ่ง)?/, m => T(12 + (m[1] ? +m[1] : 1), half(m[2]))],
      [/(\d{1,2})\s?ทุ่ม\s?(ครึ่ง)?/, m => (+m[1] >= 1 && +m[1] <= 5 ? T(18 + +m[1], half(m[2])) : false)],
      [/ตี\s?(\d{1,2})\s?(ครึ่ง)?/, m => (+m[1] <= 5 ? T(+m[1], half(m[2])) : false)],
      [/เที่ยง(?:วัน)?\s?(ครึ่ง)?/, m => T(12, half(m[1]))],
      [/(\d{1,2})\s?โมง(เช้า|เย็น)?\s?(ครึ่ง)?/, m => {
        let h = +m[1];
        if (m[2] === 'เย็น' && h < 12) h += 12;
        else if (!m[2] && h >= 1 && h <= 6) h += 12;
        return T(h, half(m[3]));
      }]
    ];
    for (const [re, fn] of timeRules) if (cut(re, fn)) break;

    // ---- แท็กความสำคัญ (เป็นคำแยกด้วยเว้นวรรคเท่านั้น เพื่อไม่ไปตัด "อีเมลสำคัญ") ----
    let urgent = false, important = false;
    const rest = s.split(/\s+/).filter(Boolean).filter(tok => {
      if (tok === '!!') { urgent = important = true; return false; }
      if (tok === '!') { urgent = true; return false; }
      if (/^#?ด่วน(มาก)?!*$/.test(tok)) { urgent = true; return false; }
      if (/^#?สำคัญ(มาก)?!*$/.test(tok)) { important = true; return false; }
      return true;
    });
    const title = rest.join(' ').trim() || original;
    const flagged = urgent || important;
    const q = flagged ? quadrantOf(urgent, important) : (defaultQ || 2);
    return { title, date, time, q, urgent, important };
  }

  /* ---------- streak / รายการ ---------- */
  function streak(tasks, now = new Date()) {
    const days = new Set(tasks.filter(t => t.done && t.doneAt).map(t => ymd(new Date(t.doneAt))));
    let d = startOfDay(now);
    if (!days.has(ymd(d))) d = addDays(d, -1);
    let n = 0;
    while (days.has(ymd(d))) { n++; d = addDays(d, -1); }
    return n;
  }
  const sortTasks = arr => arr.slice().sort((a, b) =>
    (a.done - b.done) || (a.q - b.q) || ((a.date || '9') < (b.date || '9') ? -1 : (a.date || '9') > (b.date || '9') ? 1 : 0) ||
    ((a.time || '99') < (b.time || '99') ? -1 : (a.time || '99') > (b.time || '99') ? 1 : 0) || (a.createdAt - b.createdAt));
  function tasksForDay(tasks, day, today, includeDone = true) {
    return sortTasks(tasks.filter(t =>
      (t.date === day && (includeDone || !t.done)) ||
      (day === today && !t.done && t.date && t.date < today)));
  }
  function yearProgress(now = new Date()) {
    const y = now.getFullYear(), a = new Date(y, 0, 1), b = new Date(y + 1, 0, 1);
    return { year: y, pct: Math.floor((now - a) / (b - a) * 100), left: Math.round((b - startOfDay(now)) / 864e5) };
  }
  function monthGrid(y, m, weekStart) {
    const first = new Date(y, m, 1), off = (first.getDay() - weekStart + 7) % 7;
    const days = new Date(y, m + 1, 0).getDate(), rows = Math.ceil((off + days) / 7);
    return Array.from({ length: rows * 7 }, (_, i) => new Date(y, m, 1 - off + i));
  }

  /* ---------- วาดวอลเปเปอร์ ---------- */
  const BGS = {
    night: ['#060a1c', '#131d45', '#2a3a6e'], dusk: ['#1d1430', '#5a2d56', '#c46a5a'],
    ocean: ['#03141c', '#0c3a4d', '#1f6f7a'], forest: ['#0a1810', '#1c3a28', '#3e6a48'],
    graphite: ['#0c0c0e', '#1a1a1e', '#2b2b31']
  };
  const BG_NAMES = { night: 'ราตรี', dusk: 'สนธยา', ocean: 'มหาสมุทร', forest: 'ป่า', graphite: 'กราไฟต์' };
  let segmenter = null;
  try { segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' }); } catch (e) {}
  const graphemes = t => (segmenter ? Array.from(segmenter.segment(t), x => x.segment) : Array.from(t));
  function fit(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    const g = graphemes(text);
    while (g.length > 1 && ctx.measureText(g.join('') + '…').width > maxW) g.pop();
    return g.join('') + '…';
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawWallpaper(ctx, W, H, o) {
    const s = W / 1179, F = o.font || '-apple-system, "SF Pro Text", "Noto Sans Thai", sans-serif';
    const font = (w, px) => `${w} ${Math.round(px * s)}px ${F}`;
    const now = o.now || new Date(), today = ymd(now), tasks = o.tasks || [];
    const be = o.be !== false, ws = o.weekStart || 0;
    // พื้นหลัง
    if (o.photo) {
      const iw = o.photo.width, ih = o.photo.height, k = Math.max(W / iw, H / ih);
      ctx.drawImage(o.photo, (W - iw * k) / 2, (H - ih * k) / 2, iw * k, ih * k);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
    } else {
      const c = BGS[o.bg] || BGS.night, g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, c[0]); g.addColorStop(0.55, c[1]); g.addColorStop(1, c[2]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const panel = (x, y, w, h) => { rr(ctx, x, y, w, h, 40 * s); ctx.fillStyle = 'rgba(10,12,20,.48)'; ctx.fill(); };
    const txt = (t, x, y, f, c, al = 'left') => { ctx.font = f; ctx.fillStyle = c; ctx.textAlign = al; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y); };
    const circle = (x, y, r, color, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.lineWidth = 4 * s; ctx.strokeStyle = color; ctx.stroke(); } };
    const WHITE = '#fff', DIM = 'rgba(255,255,255,.6)';
    const P = 56 * s, X = P, Wd = W - 2 * P;
    let y = Math.round(H * 0.365);

    // แถบความคืบหน้าของปี
    const yp = yearProgress(now), ph = 150 * s;
    panel(X, y, Wd, ph);
    txt(String(yearLabel(yp.year, be)), X + 36 * s, y + 58 * s, font(700, 40), WHITE);
    txt(yp.pct + '%', X + Wd - 36 * s, y + 58 * s, font(700, 40), WHITE, 'right');
    rr(ctx, X + 36 * s, y + 78 * s, Wd - 72 * s, 14 * s, 7 * s); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill();
    rr(ctx, X + 36 * s, y + 78 * s, Math.max(14 * s, (Wd - 72 * s) * yp.pct / 100), 14 * s, 7 * s); ctx.fillStyle = WHITE; ctx.fill();
    txt(`ผ่านไปแล้ว ${yp.pct}% ของปี`, X + 36 * s, y + 130 * s, font(400, 27), DIM);
    txt(`เหลืออีก ${yp.left} วัน`, X + Wd - 36 * s, y + 130 * s, font(400, 27), DIM, 'right');
    y += ph + 26 * s;
    const bottom = H * 0.86, avail = bottom - y;
    const open = tasks.filter(t => !t.done);

    const taskLine = (t, x, yy, w, size, showWhen) => {
      const col = QS[t.q].wp, over = t.date && t.date < today;
      circle(x + 14 * s, yy - size * 0.36 * s, 13 * s, col, false);
      let right = '';
      if (showWhen) right = over ? fmtShort(t.date) : (t.time || '');
      ctx.font = font(400, size - 4);
      const rw = right ? ctx.measureText(right).width + 16 * s : 0;
      if (right) txt(right, x + w, yy, font(500, size - 4), over ? '#ff8a80' : DIM, 'right');
      ctx.font = font(500, size);
      txt(fit(ctx, t.title, w - 44 * s - rw), x + 42 * s, yy, font(500, size), WHITE);
    };

    if (o.tpl === 'matrix') {
      const gap = 24 * s, cw = (Wd - gap) / 2, ch = (avail - gap) / 2;
      [1, 2, 3, 4].forEach((q, i) => {
        const cx = X + (i % 2) * (cw + gap), cy = y + Math.floor(i / 2) * (ch + gap);
        panel(cx, cy, cw, ch);
        const list = sortTasks(open.filter(t => t.q === q));
        circle(cx + 40 * s, cy + 50 * s, 11 * s, QS[q].wp, true);
        ctx.font = font(700, 29);
        txt(fit(ctx, QS[q].name, cw - 140 * s), cx + 64 * s, cy + 60 * s, font(700, 29), WHITE);
        if (list.length) {
          circle(cx + cw - 44 * s, cy + 50 * s, 22 * s, QS[q].wp, true);
          txt(String(list.length), cx + cw - 44 * s, cy + 61 * s, font(700, 27), '#fff', 'center');
        }
        const lh = 56 * s, max = Math.max(0, Math.floor((ch - 100 * s) / lh));
        const shown = list.length > max ? list.slice(0, Math.max(0, max - 1)) : list;
        shown.forEach((t, k) => taskLine(t, cx + 26 * s, cy + 128 * s + k * lh, cw - 52 * s, 29, false));
        if (list.length > shown.length) txt(`+${list.length - shown.length} รายการ`, cx + 68 * s, cy + 128 * s + shown.length * lh, font(500, 27), DIM);
        if (!list.length) txt('ว่าง', cx + 40 * s, cy + 128 * s, font(400, 27), 'rgba(255,255,255,.35)');
      });
    } else if (o.tpl === 'month') {
      panel(X, y, Wd, avail);
      const grid = monthGrid(now.getFullYear(), now.getMonth(), ws), rows = grid.length / 7;
      txt(`${MONTHS[now.getMonth()]} ${yearLabel(now.getFullYear(), be)}`, X + 36 * s, y + 64 * s, font(700, 36), WHITE);
      const cw = (Wd - 40 * s) / 7, gx = X + 20 * s;
      for (let i = 0; i < 7; i++) txt(DOW_S[(i + ws) % 7], gx + cw * i + cw / 2, y + 122 * s, font(500, 26), DIM, 'center');
      const rh = Math.min(100 * s, (avail * 0.66 - 150 * s) / rows), gy = y + 150 * s;
      const byDay = {};
      open.forEach(t => { if (t.date) (byDay[t.date] = byDay[t.date] || new Set()).add(t.q); });
      grid.forEach((d, i) => {
        const cx = gx + cw * (i % 7) + cw / 2, cy = gy + rh * Math.floor(i / 7) + rh * 0.42, ds = ymd(d);
        const inM = d.getMonth() === now.getMonth();
        if (ds === today) circle(cx, cy - 10 * s, 30 * s, '#c9a96e', true);
        txt(String(d.getDate()), cx, cy, font(ds === today ? 700 : 500, 30), ds === today ? '#1a1a1a' : inM ? WHITE : 'rgba(255,255,255,.3)', 'center');
        const qs = byDay[ds] ? [...byDay[ds]].sort() : [];
        qs.slice(0, 3).forEach((q, k) => circle(cx + (k - (Math.min(qs.length, 3) - 1) / 2) * 16 * s, cy + 36 * s, 5.5 * s, QS[q].wp, true));
      });
      let ly = gy + rh * rows + 40 * s;
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(X + 36 * s, ly - 26 * s, Wd - 72 * s, 2 * s);
      txt('วันนี้', X + 36 * s, ly + 20 * s, font(700, 30), WHITE);
      const list = tasksForDay(tasks, today, today, false), lh = 56 * s;
      const max = Math.max(0, Math.floor((y + avail - ly - 50 * s) / lh));
      if (!list.length) txt('ไม่มีงานค้าง 🎉', X + 36 * s, ly + 76 * s, font(400, 28), DIM);
      const shown = list.length > max ? list.slice(0, Math.max(0, max - 1)) : list;
      shown.forEach((t, k) => taskLine(t, X + 36 * s, ly + 76 * s + k * lh, Wd - 72 * s, 29, true));
      if (list.length > shown.length) txt(`+${list.length - shown.length} รายการ`, X + 78 * s, ly + 76 * s + shown.length * lh, font(500, 27), DIM);
    } else { // today
      panel(X, y, Wd, avail);
      txt(`วันนี้ · ${DOW_L[now.getDay()]} ${now.getDate()} ${MONTHS_S[now.getMonth()]}`, X + 40 * s, y + 70 * s, font(700, 36), WHITE);
      const list = tasksForDay(tasks, today, today, false), lh = 70 * s;
      const max = Math.max(0, Math.floor((avail - 130 * s) / lh));
      if (!list.length) txt('ไม่มีงานค้าง พักได้ 🎉', X + 40 * s, y + 150 * s, font(400, 32), DIM);
      const shown = list.length > max ? list.slice(0, Math.max(0, max - 1)) : list;
      shown.forEach((t, k) => taskLine(t, X + 40 * s, y + 150 * s + k * lh, Wd - 80 * s, 33, true));
      if (list.length > shown.length) txt(`+${list.length - shown.length} รายการ`, X + 82 * s, y + 150 * s + shown.length * lh, font(500, 29), DIM);
    }
  }

  return { pad, ymd, parseYmd, addDays, startOfDay, MONTHS, MONTHS_S, DOW_S, DOW_L, QS, BGS, BG_NAMES,
    quadrantOf, yearLabel, fmtShort, parseQuick, streak, sortTasks, tasksForDay, yearProgress, monthGrid, drawWallpaper };
});
