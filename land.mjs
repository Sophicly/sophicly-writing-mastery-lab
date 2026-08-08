import puppeteer from 'puppeteer'; import path from 'path';
const F='file://'+path.join(process.env.PORT_DIR,'Risen Church Mobile Landing - PORT.html');
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});

async function probe(label, setup){
  const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  await p.setViewport({width:414,height:736,isMobile:true,hasTouch:true});
  await p.goto(F,{waitUntil:'networkidle2'});
  await p.evaluate(()=>window.__WD071.skipIntro());
  await new Promise(r=>setTimeout(r,2200));
  await setup(p);
  const before=await p.evaluate(()=>({
    idx:window.__WD071.index, par:window.__WD071.parallax,
    wh:window.innerHeight, ww:window.innerWidth,
    holderH:document.getElementById('holder').style.height,
    anim:document.querySelectorAll('#holder li.holderAnim').length,
    t0:getComputedStyle(document.querySelectorAll('#holder li')[0]).transform,
    t1:getComputedStyle(document.querySelectorAll('#holder li')[1]).transform }));
  await p.evaluate(()=>window.__WD071.next());
  await new Promise(r=>setTimeout(r,1400));
  const after=await p.evaluate(()=>({
    idx:window.__WD071.index,
    anim:document.querySelectorAll('#holder li.holderAnim').length,
    t0:getComputedStyle(document.querySelectorAll('#holder li')[0]).transform,
    t1:getComputedStyle(document.querySelectorAll('#holder li')[1]).transform,
    vis1:document.querySelectorAll('#holder li')[1].getBoundingClientRect().top }));
  console.log(`\n### ${label}`);
  console.log('  before', JSON.stringify(before));
  console.log('  after ', JSON.stringify(after));
  console.log('  errors', errs.length, errs.slice(0,2));
  await p.close();
}

await probe('A. portrait control (414x736)', async p=>{});
await probe('B. ROTATED to landscape (736x414) after load', async p=>{
  await p.setViewport({width:736,height:414,isMobile:true,hasTouch:true});
  await new Promise(r=>setTimeout(r,900));
});
await b.close();
