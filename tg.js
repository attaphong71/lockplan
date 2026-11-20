/* LockPlan × Telegram: ส่งข้อมูลงานไปเก็บเป็นไฟล์ปักหมุดในแชตบอท ให้ GitHub Actions อ่านแล้วแจ้งเตือน */
(function () {
  'use strict';
  const K = 'lockplan.tg';
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem(K)) || {}; } catch (e) {}
  const store = () => { try { localStorage.setItem(K, JSON.stringify(cfg)); } catch (e) {} };
  const api = (m, body, token) => fetch(`https://api.telegram.org/bot${token || cfg.token}/${m}`, { method: 'POST', body })
    .then(r => r.json()).catch(e => ({ ok: false, description: String(e) }));
  const fd = o => { const f = new FormData(); for (const k in o) if (o[k] != null) f.append(k, o[k]); return f; };
  const connected = () => !!(cfg.token && cfg.chat);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function payload(D) {
    const off = -new Date().getTimezoneOffset(), sg = off >= 0 ? '+' : '-', a = Math.abs(off);
    return {
      app: 'LockPlan', v: 1, updatedAt: new Date().toISOString(), morning: '08:00',
      tz: `${sg}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`,
      url: location.href.split('#')[0].split('?')[0],
      tasks: D.tasks.filter(t => !t.done && t.date).map(t => ({ id: t.id, title: t.title, q: t.q, date: t.date, time: t.time || null }))
    };
  }
  let busy = null, pending = null, timer = null, lastSent = '';
  async function sync(D, force) {
    if (!connected()) return { ok: false, description: 'ยังไม่ได้เชื่อม Telegram' };
    const data = payload(D), sig = JSON.stringify(data.tasks) + data.tz;
    if (!force && sig === lastSent) return { ok: true };
    const file = new File([JSON.stringify(data)], 'lockplan-tasks.json', { type: 'application/json' });
    let r = { ok: false };
    if (cfg.msgId) {
      r = await api('editMessageMedia', fd({ chat_id: cfg.chat, message_id: cfg.msgId, f: file,
        media: JSON.stringify({ type: 'document', media: 'attach://f', caption: '📌 ข้อมูลสำหรับแจ้งเตือน LockPlan — อย่าลบหรือเลิกปักหมุด' }) }));
      if (!r.ok && /not modified/i.test(r.description || '')) r = { ok: true };
    }
    if (!r.ok) {
      r = await api('sendDocument', fd({ chat_id: cfg.chat, document: file, disable_notification: true,
        caption: '📌 ข้อมูลสำหรับแจ้งเตือน LockPlan — อย่าลบหรือเลิกปักหมุด' }));
      if (r.ok) {
        cfg.msgId = r.result.message_id; store();
        await api('pinChatMessage', fd({ chat_id: cfg.chat, message_id: cfg.msgId, disable_notification: true }));
      }
    }
    if (r.ok) { lastSent = sig; cfg.lastSync = Date.now(); store(); }
    return r;
  }
  function queue(D) {
    if (!connected()) return;
    pending = D; clearTimeout(timer);
    timer = setTimeout(flush, 1500);
  }
  async function flush() {
    clearTimeout(timer);
    if (!pending || busy) return;
    const D = pending; pending = null;
    busy = sync(D).finally(() => { busy = null; if (pending) flush(); });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  async function connect(token, D) {
    token = String(token || '').trim();
    if (!/^\d+:[\w-]{30,}$/.test(token)) throw new Error('รูปแบบโทเคนไม่ถูกต้อง');
    const me = await api('getMe', null, token);
    if (!me.ok) throw new Error('โทเคนใช้ไม่ได้: ' + (me.description || ''));
    const up = await api('getUpdates', null, token);
    const msgs = (up.ok ? up.result : []).map(u => u.message).filter(m => m && m.chat && m.chat.type === 'private');
    if (!msgs.length) throw new Error(`เปิดแชตกับ @${me.result.username} แล้วกด Start (หรือพิมพ์ /start) ก่อน แล้วลองใหม่`);
    const m = msgs[msgs.length - 1];
    cfg = { token, chat: m.chat.id, bot: me.result.username, who: m.chat.first_name || '' };
    store(); lastSent = '';
    await api('sendMessage', fd({ chat_id: cfg.chat, text: '✅ เชื่อม LockPlan สำเร็จ\nเมื่องานถึงกำหนด จะมีข้อความแจ้งที่แชตนี้' }));
    return sync(D, true);
  }
  const secret = () => `${cfg.token}#${cfg.chat}`;

  function settingsHTML() {
    const tile = `<span class="tile" style="background:#2a9fd8"><svg class="i" viewBox="0 0 24 24"><path d="M21 4.5L2.8 11.4c-.9.4-.9 1.6 0 1.9l4.5 1.5 1.7 5.3c.2.7 1.1.9 1.6.4l2.5-2.4 4.6 3.4c.6.4 1.4.1 1.6-.6L22.5 6c.3-1-.6-1.9-1.5-1.5z"/><path d="M7.3 14.8L18 8"/></svg></span>`;
    if (!connected()) return `<div class="lbl">แจ้งเตือน Telegram</div><div class="card">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">${tile}<b style="font-weight:600">แจ้งเตือนเมื่องานถึงกำหนด</b></div>
      <ol class="steps"><li>ใน Telegram คุยกับ <b>@BotFather</b> → <b>/newbot</b> → ตั้งชื่อ → คัดลอก <b>โทเคน</b></li>
      <li>เปิดแชตกับบอทที่เพิ่งสร้าง แล้วกด <b>Start</b></li><li>วางโทเคนด้านล่างแล้วกด <b>เชื่อมต่อ</b></li></ol>
      <input class="field" id="tg-token" placeholder="123456789:AAH..." autocomplete="off" autocapitalize="off" spellcheck="false" style="font-size:15px">
      <button class="btn dark" data-act="tgConnect">เชื่อมต่อ Telegram</button></div>`;
    const last = cfg.lastSync ? new Date(cfg.lastSync).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    return `<div class="lbl">แจ้งเตือน Telegram</div><div class="set">
      <div class="it">${tile}<span class="t">เชื่อมกับ @${esc(cfg.bot)}<small>ส่งข้อมูลล่าสุด ${last}</small></span><span class="tg on" data-act="tgOff"></span></div>
      <button class="it" data-act="tgSync"><span class="t">ส่งข้อมูลงานตอนนี้<small>ปกติจะส่งให้อัตโนมัติทุกครั้งที่แก้งาน</small></span></button>
      <button class="it" data-act="tgCopy"><span class="t">คัดลอกรหัสสำหรับ GitHub<small>ใช้ตั้งค่าตัวส่งแจ้งเตือนครั้งเดียว (เก็บเป็นความลับ)</small></span></button></div>`;
  }
  async function act(name, el, ctx) {
    const { D, render, toast } = ctx;
    if (name === 'tgConnect') {
      const v = (document.getElementById('tg-token') || {}).value;
      el.disabled = true; el.textContent = 'กำลังเชื่อมต่อ…';
      try { const r = await connect(v, D()); toast(r.ok ? 'เชื่อม Telegram แล้ว ✓' : 'เชื่อมได้ แต่ส่งข้อมูลไม่สำเร็จ'); }
      catch (e) { toast(e.message); }
      render();
    } else if (name === 'tgSync') {
      const r = await sync(D(), true); toast(r.ok ? 'ส่งข้อมูลแล้ว ✓' : 'ส่งไม่สำเร็จ: ' + (r.description || '')); render();
    } else if (name === 'tgCopy') {
      try { await navigator.clipboard.writeText(secret()); toast('คัดลอกแล้ว'); }
      catch (e) { prompt('คัดลอกรหัสนี้', secret()); }
    } else if (name === 'tgOff') {
      if (confirm('เลิกเชื่อม Telegram?')) { cfg = {}; store(); render(); }
    }
  }
  window.TG = { queue, sync, flush, connect, settingsHTML, act, payload, isConnected: connected, _cfg: () => cfg };
})();
