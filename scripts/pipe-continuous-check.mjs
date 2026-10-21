import assert from 'node:assert/strict';
import * as data from '../dist/scripts/pitch-data.js';
const recommend=data.recommendPipe||data.lookupPipe;
for(const d of [89,90,108,88.9,108.5]) {
  assert.ok((recommend(d,3).pitches||[]).includes('8/12'),`${d} × 3 must have a sourced recommendation`);
  assert.ok((recommend(d,5).pitches||[]).includes('6/10'),`${d} × 5 must include the fine side of the chart transition`);
}
for(let wall=1.25;wall<=50;wall+=.05) {
  const result=recommend(500,wall);
  assert.ok(result.pitches?.length,`no gap at wall ${wall}`);
  assert.equal(result.source.name,'LENOX');
  for(const p of result.pitches)assert.ok(['14/18','10/14','8/12','6/10','6/8','5/8','4/6','3/4','2/3'].includes(p));
}
assert.equal(recommend(20,10).state,'invalid');
assert.equal(recommend(20,11).state,'invalid');
for(const w of [0,-1,NaN])assert.equal(recommend(90,w).state,'invalid');
for(const w of [1,50.1])assert.equal(recommend(500,w).state,'outside');
assert.deepEqual(recommend(90,3,true).pitches,['6/10'],'bundle is one pitch group coarser, not double wall');
assert.equal(recommend(500,50,true).state,'outside','do not invent a coarser group past the source');
console.log('PASS: requested OD89/90/108 and fractional sizes, continuous wall coverage, chart boundaries, geometry and bundle rule; pure lookup, no mail.');
