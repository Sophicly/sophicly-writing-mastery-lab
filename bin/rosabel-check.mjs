// Headless logged-in render check for the live-modelling Rosabel page.
// usage: node rosabel-check.mjs <url> <cookieName> <cookieValue> <label>
import { chromium } from '../node_modules/playwright/index.mjs';
const [url, cookieName, cookieValue, label] = process.argv.slice(2);
const u = new URL(url);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, ignoreHTTPSErrors: true });
await ctx.addCookies([{ name: cookieName, value: cookieValue, domain: u.hostname, path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const errors = [], warns = [];
page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
const rest = [];
page.on('response', async resp => { try { const u = resp.url(); if (u.includes('/wp-json/') && (resp.status() >= 400 || u.includes('sophicly-wml'))) { let body = ''; try { body = (await resp.text()).slice(0, 160); } catch {} rest.push(`${resp.status()} ${u.replace(/^https?:\/\/[^/]+/, '').slice(0, 90)} ${resp.status() >= 400 ? '← ' + body.replace(/\s+/g, ' ') : ''}`); } } catch {} });
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log(`[${label}] HTTP ${resp && resp.status()} final=${page.url()}`);
const loggedIn = await page.evaluate(() => document.body.classList.contains('logged-in'));
console.log(`[${label}] body.logged-in = ${loggedIn}`);
// wait for the WML mount + editor
try { await page.waitForSelector('.swml-section-block, .swml-canvas, #swml-app, .swml-app', { timeout: 45000 }); } catch { console.log(`[${label}] ⛔ no WML mount within 45s`); }
await page.waitForTimeout(8000);
// A student account meets the Daily Check-in takeover first (sophicly-checkin). Submit it so the
// lesson underneath can be measured — same thing a real student does before the lesson.
const checkin = await page.evaluate(() => /How are you feeling today/i.test(document.body.innerText || ''));
if (checkin) {
  console.log(`[${label}] daily check-in takeover present — submitting it`);
  const btn = await page.$('button:has-text("Share how I")');
  if (btn) { await btn.click(); await page.waitForTimeout(9000); }
  else { await page.evaluate(() => { document.querySelectorAll('[class*="checkin"], [class*="sck"]').forEach(e => e.remove()); }); await page.waitForTimeout(3000); }
}
// Typing probe: a read-only viewer must not be able to change the document, whatever the DOM attribute says.
let typed = 'n/a';
try {
  const focused = await page.evaluate(() => { const pm = document.querySelector('.swml-canvas-content .ProseMirror'); if (!pm) return false; const p = pm.querySelector('p') || pm; p.scrollIntoView(); pm.focus(); const r = document.createRange(); r.selectNodeContents(p); r.collapse(false); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); return true; });
  if (focused) { await page.keyboard.type('ZZQXTYPEPROBE'); await page.waitForTimeout(800);
    typed = await page.evaluate(() => (document.querySelector('.swml-canvas-content .ProseMirror') || {}).textContent?.includes('ZZQXTYPEPROBE') ? 'TEXT CHANGED' : 'blocked'); }
} catch (e) { typed = 'probe error: ' + String(e.message).slice(0, 60); }
console.log(`[${label}] typing probe: ${typed}`);
const info = await page.evaluate(() => {
  const labels = [...document.querySelectorAll('[data-section-label]')].map(e => e.getAttribute('data-section-label'));
  const heads = [...document.querySelectorAll('.swml-section-block h3, .swml-section-block h2, .swml-section-title')].map(e => e.textContent.trim()).filter(Boolean);
  const toc = [...document.querySelectorAll('.swml-outline-item, .swml-doc-outline li, [class*="outline"] li')].map(e => e.textContent.trim().replace(/\s+/g,' ').slice(0,60)).filter(Boolean);
  const text = document.body.innerText || '';
  return {
    sections: labels.length ? labels : heads,
    tocCount: toc.length, toc: toc.slice(0, 14),
    hasExtract: /Rosabel bought a bunch of violets/.test(text),
    hasQ1: /List four things/i.test(text), hasQ2: /lines? 6 to 14/i.test(text), hasQ4: /line 19 to the end/i.test(text), hasQ5: /describe|story/i.test(text),
    hasMultiQ: /Section A|Question 1|Q1/i.test(text) && /Question 5|Q5/i.test(text),
    hasEssayShell: /Essay Plan/i.test(text) && /Outline/i.test(text) && !/Question 2|Q2/i.test(text),
    title: document.title,
    cfg: (window.swmlConfig ? { userId: window.swmlConfig.userId, viewerMode: window.swmlConfig.viewerMode, reviewMode: window.swmlConfig.reviewMode, reviewRole: window.swmlConfig.reviewRole, targetUserId: window.swmlConfig.targetUserId } : null),
    pill: (document.querySelector('.swml-tutor-view-pill') || {}).textContent || '',
    readonlyNote: (document.querySelector('.swml-chat-readonly-note') || {}).textContent || '',
    chatInput: !!document.querySelector('.swml-chat-input, textarea.swml-chat-textarea, .swml-canvas-chat textarea'),
    editable: [...document.querySelectorAll('.ProseMirror')].map(e => (e.closest('.swml-canvas-content') ? 'doc' : 'other') + ':' + e.getAttribute('contenteditable')).join(','),
  };
});
console.log(`[${label}] title="${info.title}"`);
console.log(`[${label}] sections(${info.sections.length}): ${info.sections.slice(0, 16).join(' | ')}`);
console.log(`[${label}] outline(${info.tocCount}): ${info.toc.join(' | ')}`);
console.log(`[${label}] extract=${info.hasExtract} Q1=${info.hasQ1} Q2scope=${info.hasQ2} Q4scope=${info.hasQ4} multiQ=${info.hasMultiQ} essayShell=${info.hasEssayShell}`);
console.log(`[${label}] cfg=${JSON.stringify(info.cfg)} pill="${info.pill.trim()}" readonlyNote="${info.readonlyNote.trim()}" chatInput=${info.chatInput} contenteditable=${info.editable}`);
console.log(`[${label}] REST (${rest.length}):\n  ` + rest.slice(0, 14).join('\n  '));
console.log(`[${label}] body text head: ` + JSON.stringify((await page.evaluate(() => (document.querySelector('.swml-app, #swml-app, .swml-canvas, main') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 420)))));
console.log(`[${label}] console errors (${errors.length}): ${errors.slice(0, 6).join(' || ')}`);
await page.screenshot({ path: `${process.env.OUT || '.'}/rosabel-${label}.png`, fullPage: false });
await browser.close();
