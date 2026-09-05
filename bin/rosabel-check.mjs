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
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log(`[${label}] HTTP ${resp && resp.status()} final=${page.url()}`);
const loggedIn = await page.evaluate(() => document.body.classList.contains('logged-in'));
console.log(`[${label}] body.logged-in = ${loggedIn}`);
// wait for the WML mount + editor
try { await page.waitForSelector('.swml-section-block, .swml-canvas, #swml-app, .swml-app', { timeout: 45000 }); } catch { console.log(`[${label}] ⛔ no WML mount within 45s`); }
await page.waitForTimeout(8000);
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
  };
});
console.log(`[${label}] title="${info.title}"`);
console.log(`[${label}] sections(${info.sections.length}): ${info.sections.slice(0, 16).join(' | ')}`);
console.log(`[${label}] outline(${info.tocCount}): ${info.toc.join(' | ')}`);
console.log(`[${label}] extract=${info.hasExtract} Q1=${info.hasQ1} Q2scope=${info.hasQ2} Q4scope=${info.hasQ4} multiQ=${info.hasMultiQ} essayShell=${info.hasEssayShell}`);
console.log(`[${label}] console errors (${errors.length}): ${errors.slice(0, 6).join(' || ')}`);
await page.screenshot({ path: `${process.env.OUT || '.'}/rosabel-${label}.png`, fullPage: false });
await browser.close();
