// LockPlan reminder — รันบน GitHub Actions: อ่านไฟล์ปักหมุดในแชต Telegram แล้วแจ้งเตือนงานที่ถึงกำหนด
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const QI = { 1: '🔥', 2: '⭐', 3: '⚡', 4: '🌙' };
const tzMin = tz => { const m = /^([+-])(\d{2}):(\d{2})$/.exec(tz || '+07:00'); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 420; };

/** คืนรายการงานที่ "เพิ่งถึงกำหนด" และอัปเดต sent (กันแจ้งซ้ำ) */
export function computeReminders(data, nowMs, sent = {}) {
  const off = tzMin(data.tz), morning = data.morning || '08:00', due = [];
  for (const t of data.tasks || []) {
    if (t.done || !t.date) continue;
    const [y, mo, d] = t.date.split('-').map(Number);
    const [h, mi] = (t.time || morning).split(':').map(Number);
    const at = Date.UTC(y, mo - 1, d, h, mi) - off * 60000;
    const key = `${t.id}|${t.date}|${t.time || ''}`;
    if (nowMs >= at && !sent[key] && nowMs - at < 3 * 864e5) { due.push({ ...t, at }); sent[key] = nowMs; }
  }
  for (const k in sent) if (nowMs - sent[k] > 45 * 864e5) delete sent[k];
  due.sort((a, b) => a.at - b.at || a.q - b.q);
  return due;
}
export function formatMessage(due, url) {
  const lines = due.map(t => {
    const [, m, d] = t.date.split('-').map(Number);
    return `${QI[t.q] || '•'} ${t.title} — ${d} ${MS[m - 1]}${t.time ? ' ' + t.time : ''}`;
  });
  return `🔔 ถึงกำหนดแล้ว${due.length > 1 ? ` (${due.length} งาน)` : ''}\n\n${lines.join('\n')}${url ? `\n\nเปิดแอป: ${url}` : ''}`;
}

async function main() {
  const [token, chat] = (process.env.LOCKPLAN_TELEGRAM || '').trim().split('#');
  if (!token || !chat) { console.log('ยังไม่ได้ตั้ง secret LOCKPLAN_TELEGRAM — ข้าม'); return; }
  const call = async (m, p) => {
    const r = await fetch(`https://api.telegram.org/bot${token}/${m}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) });
    const j = await r.json(); if (!j.ok) throw new Error(`${m}: ${j.description}`); return j.result;
  };
  const info = await call('getChat', { chat_id: chat });
  const doc = info.pinned_message && info.pinned_message.document;
  if (!doc) { console.log('ไม่พบไฟล์ข้อมูลที่ปักหมุดในแชต — เปิดแอปแล้วกด "ส่งข้อมูลงานตอนนี้"'); return; }
  const f = await call('getFile', { file_id: doc.file_id });
  const data = await (await fetch(`https://api.telegram.org/file/bot${token}/${f.file_path}`)).json();
  const SF = 'state/sent.json';
  let sent = {}; try { sent = JSON.parse(readFileSync(SF, 'utf8')); } catch (e) {}
  const due = computeReminders(data, Date.now(), sent);
  if (due.length) await call('sendMessage', { chat_id: chat, text: formatMessage(due, data.url || process.env.APP_URL), disable_web_page_preview: true });
  mkdirSync('state', { recursive: true }); writeFileSync(SF, JSON.stringify(sent));
  console.log(`งานทั้งหมด ${(data.tasks || []).length} · แจ้งเตือนรอบนี้ ${due.length}`);
}
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main().catch(e => { console.error(e.message); process.exit(1); });
