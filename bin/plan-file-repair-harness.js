#!/usr/bin/env node
/* eslint-env node */
/**
 * v7.20.629 (FIXLIST #570) — PLAN-FILE repair detector, driven on prod student 857’s exact document
 * shape with the SHIPPED functions sliced from wml-assessment.js. Asserts the repair names ONLY the
 * paragraph whose approval was lost: a box already holding a filed plan (one element per LINE, under
 * first-attempt notes) is never re-filed, and a paragraph whose outline rows are unfinished is never named.
 */
const fs=require('fs');const SRC=fs.readFileSync(require('path').join(__dirname,'..','frontend','wml-assessment.js'),'utf8');
function slice(name){const i=SRC.indexOf('function '+name+'(');let d=0;for(let k=SRC.indexOf('{',i);k<SRC.length;k++){if(SRC[k]==='{')d++;else if(SRC[k]==='}'){d--;if(!d)return SRC.slice(i,k+1);}}}
const mkText=t=>({type:{name:'text'},text:t}); const br={type:{name:'hardBreak'}};
const node=(name,fid,children)=>({type:{name},attrs:{fieldId:fid},textContent:children.map(c=>c.text||'').join(''),forEach(f){children.forEach(f);}});
const six=(p,q,filled)=>['topic','evidence','analysis','effects','effects2','purpose'].map(e=>node('outlineRow',`outline-body-${p}-${e}-q${q}`,filled?[mkText('x '+e)]:[]));
const docNodes=[
 // ¶1: old notes + approved plan appended as LINES (Qamar's real shape)
 node('inputField','plan-Q2-para-1',[mkText('"being adrift in a boat" - shows how he is lost'),br,mkText('Topic: emotional state not steady'),br,mkText('TEI: simile adrift'),br,mkText('Purpose: grief')]),
 // ¶2: box exists (after the heal) but EMPTY — approval was lost
 node('inputField','plan-Q2-para-2',[]),
 // Q3 ¶1: only the topic row worked so far → not ready, must not be named
 node('inputField','plan-Q3-para-1',[mkText('beginning - enormous black bird - dreams')]),
 ...six(1,2,true), ...six(2,2,true),
 node('outlineRow','outline-body-1-topic-q3',[mkText('reader does not know')]), ...['evidence','analysis','effects','effects2','purpose'].map(e=>node('outlineRow',`outline-body-1-${e}-q3`,[])),
];
const canvasEditor={state:{doc:{descendants(f){docNodes.forEach(n=>f(n,0));}}}};
const api=new Function('canvasEditor', slice('_planRowExists')+slice('_planFieldSegments')+slice('_planOutlineTargets')+slice('_planLabelElement')+slice('_planBoxesAwaitingApprovedPlan')+';return {_planBoxesAwaitingApprovedPlan};')(canvasEditor);
const got=api._planBoxesAwaitingApprovedPlan();
console.log('boxes awaiting an approved plan:', JSON.stringify(got));
const pass=JSON.stringify(got)===JSON.stringify(['plan-Q2-para-2']);
console.log(pass?'✅ names ONLY the lost paragraph (filed ¶1 not re-filed; unfinished Q3 ¶1 not named)':'❌ wrong set');

// v7.20.634 (#584) — HER DOCUMENT AS IT STANDS ON PROD (read 2026-09-23): she pasted the chat's
// mirror-back lists into the boxes herself, so every line opens with "• " or a non-breaking space.
// Before .634 those lines did not parse, so ¶1 and ¶2 read as UNFILED and the repair turn would fire
// again on her next approval — with the false premise that made Sophia tell her "that last message
// didn't come through". Every box is filed: nothing may be named.
const NB=' ';
const docNodes2=[
 node('inputField','plan-Q2-para-1',[mkText('Topic: his emotional state isn\'t very steady'),br,mkText('• Technique + evidence + inference: The simile "being adrift in a boat"'),br,mkText('• Close analysis: "adrift" suggests being dragged'),br,mkText('• Effect 1: curious'),br,mkText('• Effect 2: reader reminisces')]),
 node('inputField','plan-Q2-para-2',[mkText('• Author\'s purpose: Allende uses grief and curiosity'),br,mkText(NB+'Topic:'+NB+'Alex is being swallowed'),br,mkText('•'+NB+'Technique + evidence + inference:'+NB+'The personification'),br,mkText('•'+NB+'Close analysis:'+NB+'"Roaring" suggests')]),
 node('inputField','plan-Q3-para-1',[mkText('Topic: reader doesn\'t know'),br,mkText('Structural feature+evidence+inference: in medias res'),br,mkText('Close analysis: "black" foreshadows')]),
 ...six(1,2,true), ...six(2,2,true), ...six(1,3,true),
];
const api2=new Function('canvasEditor', slice('_planRowExists')+slice('_planFieldSegments')+slice('_planOutlineTargets')+slice('_planLabelElement')+slice('_planBoxesAwaitingApprovedPlan')+';return {_planBoxesAwaitingApprovedPlan};')({state:{doc:{descendants(f){docNodes2.forEach(n=>f(n,0));}}}});
const got2=api2._planBoxesAwaitingApprovedPlan();
console.log('her current doc — boxes awaiting an approved plan:', JSON.stringify(got2));
const pass2=JSON.stringify(got2)==='[]';
console.log(pass2?'✅ pasted, bullet-prefixed plans read as FILED — the repair will not fire on her next approval':'❌ a filed box reads as unfiled — the repair would fire again with a false premise');
process.exit(pass&&pass2?0:1);
