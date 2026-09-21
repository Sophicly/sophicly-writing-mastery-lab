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
console.log(pass?'✅ names ONLY the lost paragraph (filed ¶1 not re-filed; unfinished Q3 ¶1 not named)':'❌ wrong set'); process.exit(pass?0:1);
