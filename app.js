/* LockPlan UI */
(function () {
  'use strict';
  const C = window.Core, QS = C.QS;
  const KEY = 'lockplan.v1';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const todayStr = () => C.ymd(new Date());

  /* ---------- ไอคอนเส้น ---------- */
  const P = {
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.5 1.8 1.4 2.8 2.4 3.3.2-2.8 1.5-5 3.4-6.3-.3 2.6.9 4.3 2.2 6 1 1.3 1.4 2.4 1.4 4.3C18.5 18.1 16 21 12 21z"/>',
    star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
    bolt: '<path d="M13 3L5 13.5h6l-1 7.5 8-10.5h-6z"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>', chev: '<path d="M9 6l6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    img: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8.5 8.5"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-3.9M4 4v4h4M4 13a8 8 0 0 0 14.6 3.9M20 20v-4h-4"/>',
    down: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>', up: '<path d="M12 15V4M7 8.5l5-5 5 5M5 20h14"/>',
    trash: '<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5L17.5 7M9.5 7V4.5h5V7"/>',
    sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    week: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h9"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M11 18.5h2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  const I = (k, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${P[k] || ''}</svg>`;
  const qIcon = q => `<span class="qi q${q}">${I(QS[q].icon)}</span>`;

  const defSettings = { weekStart: 0, be: true, view: 'grid', showDone: false, wpTpl: 'matrix', wpBg: 'night', wpPhoto: null, hideInstall: false };
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.tasks)) return { tasks: d.tasks, settings: Object.assign({}, defSettings, d.settings) };
    } catch (e) {}
    const t = todayStr(), now = Date.now();
    return { settings: Object.assign({}, defSettings), tasks: [
      { id: uid(), title: 'ตอบอีเมลสำคัญ', q: 1, date: t, time: null, done: false, createdAt: now },
      { id: uid(), title: 'วางแผนสัปดาห์หน้า', q: 2, date: null, time: null, done: false, createdAt: now + 1 },
      { id: uid(), title: 'ตอบข้อความของทีม', q: 3, date: t, time: null, done: false, createdAt: now + 2 },
      { id: uid(), title: 'จัดโต๊ะทำงาน', q: 4, date: null, time: null, done: false, createdAt: now + 3 }
    ] };
  }
  let D = load();
  const ui = { tab: 'tasks', sel: todayStr(), calMode: 'week', monthCursor: null, wpFile: null, wpImg: null, wpImgSrc: null };
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(D)); }
    catch (e) { toast('พื้นที่เก็บข้อมูลเต็ม — ลองลบรูปพื้นหลัง'); }
    if (window.TG) TG.queue(D);
  }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2000);
  }
  const longDate = d => `${C.DOW_L[d.getDay()]} ${d.getDate()} ${C.MONTHS[d.getMonth()]} ${C.yearLabel(d.getFullYear(), D.settings.be)}`;
  const greet = () => { const h = new Date().getHours(); return h < 5 ? 'ราตรีสวัสดิ์' : h < 12 ? 'อรุณสวัสดิ์' : h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'; };

  /* ---------- ชิ้นส่วน ---------- */
  function taskHTML(t) {
    const over = !t.done && t.date && t.date < todayStr();
    const when = t.date ? C.fmtShort(t.date) + (t.time ? ' · ' + t.time : '') : (t.time || '');
    return `<div class="task q${t.q}${t.done ? ' done' : ''}">
      <button class="circle" data-act="toggle" data-id="${t.id}" aria-label="ทำเสร็จ"></button>
      <div class="tbody" data-act="edit" data-id="${t.id}"><div class="ttl">${esc(t.title)}</div>${when ? `<div class="tdate${over ? ' over' : ''}">${I(t.time ? 'clock' : 'cal')}${when}${over ? ' · เลยกำหนด' : ''}</div>` : ''}</div></div>`;
  }
  const visible = () => D.tasks.filter(t => D.settings.showDone || !t.done);
  const nav = () => `<nav>${[['tasks', 'grid', 'งาน'], ['cal', 'cal', 'ปฏิทิน'], ['lock', 'lock', 'ล็อก'], ['set', 'gear', 'ตั้งค่า']]
    .map(([k, ic, n]) => `<button class="${ui.tab === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${I(ic)}${n}</button>`).join('')}</nav>`;
  const fab = attrs => `<button class="fab" data-act="add" ${attrs || ''} aria-label="เพิ่มงาน">${I('plus')}</button>`;
  const isStandalone = () => window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  const installBanner = () => (isStandalone() || D.settings.hideInstall) ? '' :
    `<div class="banner"><span class="tile" style="background:var(--noir);color:var(--gold2)">${I('phone')}</span><div style="flex:1"><b>ติดตั้งลงหน้าจอโฮม</b><small>Safari → ปุ่มแชร์ → เพิ่มไปยังหน้าจอโฮม</small></div><button data-act="hideInstall" style="color:var(--dim)">${I('x')}</button></div>`;
  function ring(pct) {
    const r = 32, c = 2 * Math.PI * r, off = c * (1 - pct);
    return `<svg viewBox="0 0 74 74" width="74" height="74"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#ecd9ae"/><stop offset="1" stop-color="#b08d57"/></linearGradient></defs>
      <circle cx="37" cy="37" r="${r}" fill="none" stroke="rgba(244,241,234,.1)" stroke-width="5"/>
      <circle cx="37" cy="37" r="${r}" fill="none" stroke="url(#gg)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 37 37)"/></svg>`;
  }

  /* ---------- หน้า งาน ---------- */
  function viewTasks() {
    const st = C.streak(D.tasks), s = D.settings, list = visible(), today = todayStr();
    const todays = D.tasks.filter(t => t.date === today || (!t.done && t.date && t.date < today));
    const dn = todays.filter(t => t.done).length, tot = todays.length, over = todays.filter(t => !t.done && t.date < today).length;
    const open = D.tasks.filter(t => !t.done).length;
    const hero = `<div class="hero"><div class="ring">${ring(tot ? dn / tot : 0)}<b>${tot ? Math.round(dn / tot * 100) : 0}%</b></div>
      <div><div class="k">ความคืบหน้าวันนี้</div><div class="v">${tot ? `เสร็จ ${dn} จาก ${tot} งาน` : 'วันนี้ยังว่าง'}</div>
      <div class="m">ค้างทั้งหมด ${open} งาน${over ? ` · เลยกำหนด ${over}` : ''}</div></div></div>`;
    let body;
    if (s.view === 'grid') {
      body = `<div class="grid2">${[1, 2, 3, 4].map(q => {
        const items = C.sortTasks(list.filter(t => t.q === q));
        const n = D.tasks.filter(t => t.q === q && !t.done).length;
        return `<div class="qcard q${q}"><div class="qh">${qIcon(q)}<span class="sp"></span><span class="qc">${n}</span>
          <button class="qadd" data-act="add" data-q="${q}">${I('plus')}</button></div><div class="qn">${QS[q].name}</div>${items.map(taskHTML).join('')}</div>`;
      }).join('')}</div>`;
    } else {
      body = `<div class="list">${[1, 2, 3, 4].map(q => {
        const items = C.sortTasks(list.filter(t => t.q === q));
        return `<h3 class="lh">${qIcon(q)}${QS[q].name}<span class="qc">${items.length}</span></h3>
          <div class="card">${items.map(taskHTML).join('') || '<div class="qc" style="padding:12px 4px">ว่าง</div>'}</div>`;
      }).join('')}</div>`;
    }
    return `<div class="hdr"><div><div class="eyebrow">${longDate(new Date())}</div><h1>${greet()}</h1></div>
      <div class="pill" title="ทำงานเสร็จติดต่อกัน (วัน)">${I('flame')}${st}</div></div>
      ${hero}
      <div class="bar"><div class="seg"><button class="${s.view === 'grid' ? 'on' : ''}" data-act="view" data-v="grid">${I('grid')}เมทริกซ์</button><button class="${s.view === 'list' ? 'on' : ''}" data-act="view" data-v="list">${I('list')}รายการ</button></div>
      <button class="chip${s.showDone ? ' on' : ''}" data-act="showDone">${I('check')}ทำแล้ว</button></div>
      ${body}${installBanner()}${fab()}`;
  }

  /* ---------- หน้า ปฏิทิน ---------- */
  function dotsFor(ds) {
    const qs = [...new Set(D.tasks.filter(t => t.date === ds && !t.done).map(t => t.q))].sort().slice(0, 3);
    return `<span class="dots">${qs.map(q => `<i style="background:var(--c${q})"></i>`).join('')}</span>`;
  }
  function viewCal() {
    const s = D.settings, sel = C.parseYmd(ui.sel), today = todayStr();
    const cur = ui.monthCursor || new Date(sel.getFullYear(), sel.getMonth(), 1);
    let pick;
    if (ui.calMode === 'week') {
      const off = (sel.getDay() - s.weekStart + 7) % 7, start = C.addDays(sel, -off);
      pick = `<div class="week">${Array.from({ length: 7 }, (_, i) => {
        const d = C.addDays(start, i), ds = C.ymd(d);
        return `<button class="${ds === ui.sel ? 'sel' : ''}${ds === today ? ' tod' : ''}" data-act="pick" data-d="${ds}"><span class="dw">${C.DOW_S[d.getDay()]}</span><span class="dn">${d.getDate()}</span>${dotsFor(ds)}</button>`;
      }).join('')}</div>`;
    } else {
      const g = C.monthGrid(cur.getFullYear(), cur.getMonth(), s.weekStart);
      pick = `<div class="card" style="margin-top:14px"><div class="month">${Array.from({ length: 7 }, (_, i) => `<div class="dw">${C.DOW_S[(i + s.weekStart) % 7]}</div>`).join('')}
        ${g.map(d => { const ds = C.ymd(d); return `<button class="${d.getMonth() !== cur.getMonth() ? 'out' : ''}${ds === ui.sel ? ' sel' : ''}${ds === today ? ' tod' : ''}" data-act="pick" data-d="${ds}">${d.getDate()}${dotsFor(ds)}</button>`; }).join('')}</div></div>`;
    }
    const head = ui.calMode === 'week' ? sel : cur;
    const items = C.tasksForDay(D.tasks, ui.sel, today, s.showDone);
    const label = ui.sel === today ? 'วันนี้' : ui.sel === C.ymd(C.addDays(new Date(), 1)) ? 'พรุ่งนี้' : 'วัน' + C.DOW_L[sel.getDay()];
    return `<div class="mh"><div><div class="eyebrow">ปฏิทิน · ${C.yearLabel(head.getFullYear(), s.be)}</div><h1>${C.MONTHS[head.getMonth()]}</h1></div>
      <div class="nav2"><button class="ib" data-act="calPrev">${I('left')}</button><button class="ib txt" data-act="calToday">วันนี้</button><button class="ib" data-act="calNext">${I('right')}</button>
      <button class="ib" data-act="calMode" title="สลับมุมมอง">${I(ui.calMode === 'week' ? 'grid' : 'week')}</button></div></div>
      ${pick}
      <div class="sec">${label}<span>${sel.getDate()} ${C.MONTHS[sel.getMonth()]}</span></div>
      ${items.length ? `<div class="card" style="padding:4px 14px">${items.map(taskHTML).join('')}</div>` :
        `<div class="card empty"><div class="em">${I('sparkle')}</div><b>ยังไม่มีอะไรที่นี่</b><div style="font-size:14px;margin-top:6px">แตะ + เพื่อวางแผน${label}</div></div>`}
      ${fab(`data-date="${ui.sel}"`)}`;
  }

  /* ---------- หน้า ล็อก ---------- */
  function wallSize() {
    const dpr = window.devicePixelRatio || 3;
    let w = Math.round((screen.width || 393) * dpr), h = Math.round((screen.height || 852) * dpr);
    if (w > h) [w, h] = [h, w];
    if (w < 600) { w = 1179; h = 2556; }
    return { w, h };
  }
  function viewLock() {
    const s = D.settings;
    const tpls = [['matrix', 'grid', 'เมทริกซ์'], ['month', 'cal', 'เดือนนี้'], ['today', 'list', 'วันนี้']];
    return `<div class="eyebrow">วอลเปเปอร์อัจฉริยะ</div><h1>หน้าจอล็อก</h1>
      <div class="stage"><canvas id="wp-prev"></canvas></div>
      <div class="lbl">รูปแบบ</div><div class="row">${tpls.map(([k, ic, n]) => `<button class="chip${s.wpTpl === k ? ' on' : ''}" data-act="tpl" data-v="${k}">${I(ic)}${n}</button>`).join('')}</div>
      <div class="lbl">พื้นหลัง</div><div class="row">${Object.keys(C.BGS).map(k => `<button class="sw${!s.wpPhoto && s.wpBg === k ? ' on' : ''}" title="${C.BG_NAMES[k]}" data-act="bg" data-v="${k}" style="background:linear-gradient(160deg,${C.BGS[k].join(',')})"></button>`).join('')}
        <label class="sw ph${s.wpPhoto ? ' on' : ''}" title="รูปของฉัน">${I('img')}<input type="file" accept="image/*" id="wp-photo" hidden></label>
        ${s.wpPhoto ? `<button class="chip" data-act="rmPhoto">${I('x')}ลบรูป</button>` : ''}</div>
      <button class="btn dark" data-act="shareWp" style="margin-top:20px">${I('refresh')}อัปเดตหน้าจอล็อก</button>
      <button class="btn light" data-act="openWp">${I('down')}เปิดรูปเพื่อบันทึกเอง</button>
      <div class="lbl">ตั้งค่าครั้งเดียว</div>
      <div class="card"><ol class="steps"><li>เปิดแอป <b>คำสั่งลัด</b> → แตะ <b>+</b> ตั้งชื่อ <b>"ตั้งหน้าจอล็อก LockPlan"</b></li>
        <li>แตะ ⓘ → เปิด <b>แสดงในแผ่นแชร์</b> และรับเฉพาะ <b>รูปภาพ</b></li>
        <li>เพิ่ม <b>ตั้งค่ารูปภาพวอลเปเปอร์</b> → รูป = <b>อินพุตคำสั่งลัด</b> → <b>หน้าจอล็อก</b> → ปิด <b>แสดงตัวอย่าง</b></li>
        <li>ครั้งต่อไป กด <b>อัปเดตหน้าจอล็อก</b> แล้วเลือกคำสั่งลัดนี้ — จบ</li></ol></div>`;
  }
  function loadPhoto() {
    const src = D.settings.wpPhoto;
    if (!src) { ui.wpImg = null; ui.wpImgSrc = null; return Promise.resolve(null); }
    if (ui.wpImgSrc === src && ui.wpImg) return Promise.resolve(ui.wpImg);
    return new Promise(res => { const im = new Image(); im.onload = () => { ui.wpImg = im; ui.wpImgSrc = src; res(im); }; im.onerror = () => res(null); im.src = src; });
  }
  function drawTo(canvas, w, h, photo) {
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return false;
    C.drawWallpaper(ctx, w, h, { tasks: D.tasks, tpl: D.settings.wpTpl, bg: D.settings.wpBg, photo, be: D.settings.be, weekStart: D.settings.weekStart });
    return true;
  }
  async function refreshWallpaper() {
    const prev = $('#wp-prev'); if (!prev) return;
    const photo = await loadPhoto(), { w, h } = wallSize();
    if (!drawTo(prev, Math.round(w / 3), Math.round(h / 3), photo)) return;
    const full = document.createElement('canvas');
    if (!drawTo(full, w, h, photo) || !full.toBlob) return;
    // เตรียมไฟล์ล่วงหน้า เพื่อเรียก navigator.share ได้ทันทีตอนแตะ (iOS ต้องการ user gesture)
    full.toBlob(b => { if (b) ui.wpFile = new File([b], 'lockscreen.png', { type: 'image/png' }); }, 'image/png');
  }
  function shrinkPhoto(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => { const im = new Image(); im.onload = () => {
        const { w, h } = wallSize(), k = Math.min(1, Math.max(w / im.width, h / im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.85));
      }; im.onerror = rej; im.src = fr.result; };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }

  /* ---------- หน้า ตั้งค่า ---------- */
  function viewSet() {
    const s = D.settings, total = D.tasks.length, done = D.tasks.filter(t => t.done).length;
    const tg = (on, act) => `<span class="tg${on ? ' on' : ''}" data-act="${act}"></span>`;
    const tile = (ic, bg) => `<span class="tile" style="background:${bg}">${I(ic)}</span>`;
    const chev = I('chev', 'chev');
    return `<div class="eyebrow">LockPlan</div><h1>การตั้งค่า</h1>
      <div class="member"><div class="eyebrow" style="color:var(--gold2)">Complimentary · ฟรีตลอดไป</div>
        <b style="display:block;margin-top:6px">ทุกฟีเจอร์ ไม่มีค่าสมาชิก</b><small>ข้อมูลอยู่ในเครื่องคุณเท่านั้น · ${total} งาน · เสร็จแล้ว ${done}</small></div>
      <div class="lbl">ปฏิทิน</div><div class="set">
        <button class="it" data-act="weekStart">${tile('cal', '#3d5a98')}<span class="t">สัปดาห์เริ่มต้นที่<small>วัน${C.DOW_L[s.weekStart]}</small></span>${chev}</button>
        <div class="it">${tile('sparkle', '#b08d57')}<span class="t">ใช้ปีพุทธศักราช<small>${C.yearLabel(new Date().getFullYear(), s.be)}</small></span>${tg(s.be, 'be')}</div>
        <div class="it">${tile('eye', '#5b6170')}<span class="t">แสดงงานที่ทำแล้ว</span>${tg(s.showDone, 'showDone')}</div></div>
      <div class="lbl">ข้อมูลและการสำรอง</div><div class="set">
        <button class="it" data-act="export">${tile('up', '#2f7d62')}<span class="t">สำรองข้อมูล<small>บันทึกลง iCloud Drive ผ่านแอปไฟล์</small></span>${chev}</button>
        <label class="it">${tile('down', '#4a6fa5')}<span class="t">กู้คืนจากไฟล์สำรอง<small>รวมกับงานเดิม ไม่ลบของเก่า</small></span>${chev}<input type="file" accept="application/json,.json" id="imp" hidden></label>
        <button class="it" data-act="clearDone">${tile('check', '#8d8f96')}<span class="t">ลบงานที่ทำเสร็จแล้ว</span></button>
        <button class="it" data-act="wipe" style="color:var(--c1)">${tile('trash', '#d0533f')}<span class="t">ลบข้อมูลทั้งหมด</span></button></div>
      ${window.TG ? TG.settingsHTML() : ''}
      <div class="lbl">เพิ่มงานด้วยประโยคเดียว</div><div class="card tip">ตัวอย่าง <code>พรุ่งนี้ 9 โมง ส่งรายงาน ด่วน</code><br>
        <b>วัน</b> วันนี้ · พรุ่งนี้ · มะรืน · วันจันทร์ · ศุกร์หน้า · 25 ธ.ค. · 5/1 · ที่ 15<br>
        <b>เวลา</b> 9 โมง · บ่าย 2 · 2 ทุ่ม · 14:30 · เที่ยง · ตี 5 · …ครึ่ง<br>
        <b>ช่อง</b> เว้นวรรคแล้วพิมพ์ <code>ด่วน</code> <code>สำคัญ</code> หรือ <code>!!</code></div>`;
  }

  /* ---------- แผ่นเพิ่ม/แก้ไข ---------- */
  let sheet = null;
  function openSheet({ id, q, date } = {}) {
    const t = id ? D.tasks.find(x => x.id === id) : null;
    sheet = { id: t ? t.id : null, q: t ? t.q : (q || null), date: t ? t.date : (date || null), time: t ? t.time : null, touched: { q: !!q, date: !!date, time: false } };
    $('#layer').innerHTML = `<div class="sheet-bg" data-act="closeBg"><div class="sheet">
      <div class="grab"></div><h3>${t ? 'แก้ไขงาน' : 'งานใหม่'}</h3>
      <textarea class="field" id="f-title" rows="2" placeholder="${t ? '' : 'เช่น พรุ่งนี้ 9 โมง ส่งรายงาน ด่วน'}">${t ? esc(t.title) : ''}</textarea>
      <div class="hint" id="f-hint"></div>
      <div class="qpick">${[1, 2, 3, 4].map(n => `<button class="q${n}" data-act="pickQ" data-q="${n}">${qIcon(n)}${QS[n].name}</button>`).join('')}</div>
      <div class="two"><label>วันที่<input type="date" id="f-date" value="${sheet.date || ''}"></label><label>เวลา<input type="time" id="f-time" value="${sheet.time || ''}"></label></div>
      <textarea class="field" id="f-notes" rows="2" placeholder="โน้ต (ไม่บังคับ)" style="font-size:15px">${t ? esc(t.notes || '') : ''}</textarea>
      <div class="acts">${t ? `<button class="btn red" data-act="del" style="flex:0 0 64px" aria-label="ลบ">${I('trash')}</button>` : '<button class="btn gray" data-act="close" style="flex:0 0 96px">ยกเลิก</button>'}
      <button class="btn dark" data-act="saveTask">บันทึก</button></div></div></div>`;
    paintQ(); updateHint();
    const ti = $('#f-title');
    ti.addEventListener('input', updateHint);
    $('#f-date').addEventListener('input', e => { sheet.touched.date = true; sheet.date = e.target.value || null; });
    $('#f-time').addEventListener('input', e => { sheet.touched.time = true; sheet.time = e.target.value || null; });
    if (!t) setTimeout(() => ti.focus(), 50);
  }
  function paintQ() { document.querySelectorAll('.qpick button').forEach(b => b.classList.toggle('on', +b.dataset.q === (sheet.q || 2))); }
  function updateHint() {
    if (!sheet || sheet.id) { const h = $('#f-hint'); if (h) h.textContent = ''; return; }
    const r = C.parseQuick($('#f-title').value, new Date(), sheet.touched.q ? sheet.q : null);
    if (!sheet.touched.date) { sheet.date = r.date; $('#f-date').value = r.date || ''; }
    if (!sheet.touched.time) { sheet.time = r.time; $('#f-time').value = r.time || ''; }
    if (!sheet.touched.q || r.urgent || r.important) { sheet.q = r.q; paintQ(); }
    const bits = [];
    if (r.date) bits.push(C.fmtShort(r.date)); if (r.time) bits.push(r.time);
    if (r.urgent || r.important) bits.push(QS[r.q].name);
    $('#f-hint').textContent = bits.length && r.title !== $('#f-title').value.trim() ? `✦ "${r.title}" · ${bits.join(' · ')}` : '';
  }
  function closeSheet() { $('#layer').innerHTML = ''; sheet = null; }
  function saveSheet() {
    const raw = $('#f-title').value.trim();
    if (!raw) { toast('พิมพ์ชื่องานก่อน'); return; }
    const notes = $('#f-notes').value.trim();
    if (sheet.id) {
      const t = D.tasks.find(x => x.id === sheet.id);
      Object.assign(t, { title: raw, q: sheet.q || 2, date: sheet.date || null, time: sheet.time || null, notes });
    } else {
      const r = C.parseQuick(raw, new Date(), sheet.touched.q ? sheet.q : null);
      D.tasks.push({ id: uid(), title: r.title, q: (r.urgent || r.important) ? r.q : (sheet.q || r.q), date: sheet.date || null, time: sheet.time || null, notes, done: false, createdAt: Date.now() });
    }
    save(); closeSheet(); render();
  }

  /* ---------- สำรองข้อมูล ---------- */
  function exportData() {
    const name = `lockplan-backup-${todayStr()}.json`;
    const blob = new Blob([JSON.stringify({ app: 'LockPlan', v: 1, exportedAt: new Date().toISOString(), ...D }, null, 1)], { type: 'application/json' });
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file] }).catch(() => {}); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  }
  function importData(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result);
        if (!d || !Array.isArray(d.tasks)) throw 0;
        const have = new Set(D.tasks.map(t => t.id)); let n = 0;
        d.tasks.forEach(t => { if (t && t.id && t.title && !have.has(t.id)) { D.tasks.push(t); n++; } });
        save(); render(); toast(`กู้คืน ${n} งาน`);
      } catch (e) { toast('ไฟล์ไม่ถูกต้อง'); }
    };
    fr.readAsText(file);
  }

  /* ---------- render + events ---------- */
  function render() {
    const v = { tasks: viewTasks, cal: viewCal, lock: viewLock, set: viewSet }[ui.tab]();
    $('#app').innerHTML = v + nav();
    if (ui.tab === 'lock') { ui.wpFile = null; refreshWallpaper(); }
  }
  const acts = {
    tab: e => { ui.tab = e.dataset.tab; try { window.scrollTo(0, 0); } catch (x) {} render(); },
    toggle: e => { const t = D.tasks.find(x => x.id === e.dataset.id); t.done = !t.done; t.doneAt = t.done ? Date.now() : null; save(); render(); if (t.done) toast('✓ เสร็จแล้ว'); },
    edit: e => openSheet({ id: e.dataset.id }),
    add: e => openSheet({ q: e.dataset.q ? +e.dataset.q : null, date: e.dataset.date || null }),
    view: e => { D.settings.view = e.dataset.v; save(); render(); },
    showDone: () => { D.settings.showDone = !D.settings.showDone; save(); render(); },
    hideInstall: () => { D.settings.hideInstall = true; save(); render(); },
    pick: e => { ui.sel = e.dataset.d; render(); },
    calPrev: () => calMove(-1), calNext: () => calMove(1),
    calToday: () => { ui.sel = todayStr(); ui.monthCursor = null; render(); },
    calMode: () => { ui.calMode = ui.calMode === 'week' ? 'month' : 'week'; ui.monthCursor = null; render(); },
    tpl: e => { D.settings.wpTpl = e.dataset.v; save(); render(); },
    bg: e => { D.settings.wpBg = e.dataset.v; D.settings.wpPhoto = null; save(); render(); },
    rmPhoto: () => { D.settings.wpPhoto = null; save(); render(); },
    shareWp: () => {
      const f = ui.wpFile;
      if (!f) { toast('กำลังสร้างรูป… ลองอีกครั้ง'); return; }
      if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] }).catch(() => {});
      else acts.openWp();
    },
    openWp: () => { if (!ui.wpFile) { toast('กำลังสร้างรูป… ลองอีกครั้ง'); return; } const u = URL.createObjectURL(ui.wpFile); const a = document.createElement('a'); a.href = u; a.download = 'lockscreen.png'; a.target = '_blank'; a.click(); },
    weekStart: () => { D.settings.weekStart = D.settings.weekStart === 0 ? 1 : 0; save(); render(); },
    be: () => { D.settings.be = !D.settings.be; save(); render(); },
    export: exportData,
    clearDone: () => { const n = D.tasks.filter(t => t.done).length; if (n && confirm(`ลบงานที่เสร็จแล้ว ${n} งาน?`)) { D.tasks = D.tasks.filter(t => !t.done); save(); render(); } },
    wipe: () => { if (confirm('ลบงานทั้งหมด? (แนะนำให้สำรองข้อมูลก่อน)')) { D.tasks = []; save(); render(); } },
    pickQ: e => { sheet.q = +e.dataset.q; sheet.touched.q = true; paintQ(); },
    saveTask: saveSheet, close: closeSheet,
    del: () => { if (confirm('ลบงานนี้?')) { D.tasks = D.tasks.filter(t => t.id !== sheet.id); save(); closeSheet(); render(); } },
    closeBg: (e, ev) => { if (ev.target === e) closeSheet(); }
  };
  function calMove(n) {
    if (ui.calMode === 'week') ui.sel = C.ymd(C.addDays(C.parseYmd(ui.sel), 7 * n));
    else { const sd = C.parseYmd(ui.sel), c = ui.monthCursor || new Date(sd.getFullYear(), sd.getMonth(), 1); ui.monthCursor = new Date(c.getFullYear(), c.getMonth() + n, 1); }
    render();
  }
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]'); if (!el) return;
    const fn = acts[el.dataset.act]; if (fn) fn(el, ev); else if (window.TG) TG.act(el.dataset.act, el, { D: () => D, render, toast });
  });
  document.addEventListener('change', async ev => {
    if (ev.target.id === 'wp-photo' && ev.target.files[0]) {
      try { D.settings.wpPhoto = await shrinkPhoto(ev.target.files[0]); save(); render(); } catch (e) { toast('เปิดรูปไม่ได้'); }
    }
    if (ev.target.id === 'imp' && ev.target.files[0]) importData(ev.target.files[0]);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !sheet) render(); });

  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__LP = { D: () => D, ui, acts, render };
})();
