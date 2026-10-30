import assert from 'node:assert/strict';
import * as staticData from '../dist/scripts/pitch-data.js';
import * as wpData from '../wordpress/omega-komplekt/scripts/pitch-data.js';
for (const [name,data] of [['static',staticData],['wordpress',wpData]]) {
 const {recommendPipe,pipeDiameters,pipeWalls,pipePitches}=data;
 for(const [row,wall] of pipeWalls.entries()) for(const [column,diameter] of pipeDiameters.entries()) {
  const r=recommendPipe(diameter,wall);
  if(wall>=diameter/2){assert.equal(r.state,'invalid');continue;}
  const pitch=pipePitches[row][column];
  assert.equal(r.state,pitch?'match':'missing',name+' '+diameter+'x'+wall);
  assert.equal(r.choices[0].pitch,pitch);
 }
 let r=recommendPipe(90,3);assert.equal(r.state,'nearby');assert.deepEqual(r.choices.map(x=>[x.diameter,x.wall,x.pitch]),[[80,3,'10/14'],[100,3,'10/14']]);
 r=recommendPipe(89,5);assert.equal(r.state,'nearby');assert.deepEqual(r.choices.map(x=>[x.diameter,x.wall,x.pitch]),[[80,5,'8/12'],[100,5,'6/10']]);
 r=recommendPipe(90,5);assert.equal(r.state,'nearby');assert.deepEqual(r.choices.map(x=>[x.diameter,x.wall,x.pitch]),[[80,5,'8/12'],[100,5,'6/10']]);
 r=recommendPipe(108,3.5);assert.equal(r.state,'nearby');assert.deepEqual(r.choices.map(x=>[x.diameter,x.wall,x.pitch]),[[100,3,'10/14'],[120,3,'10/14'],[100,4,'8/12'],[120,4,'8/12']]);
 r=recommendPipe(80,2.5,true);assert.equal(r.effectiveWall,5);assert.equal(r.choices[0].pitch,'8/12');
 assert.equal(recommendPipe(20,10).state,'invalid');assert.equal(recommendPipe(10,3).state,'outside');
 assert.equal(recommendPipe(20,8,true).state,'missing');assert.equal(recommendPipe(40,20).state,'invalid');
 assert.equal(recommendPipe(40,15).state,'match');assert.equal(recommendPipe(501,3).state,'outside');
 assert.equal(recommendPipe(90,1).state,'outside');assert.equal(recommendPipe(90,0).state,'invalid');
}
console.log('PASS: Omega table exact cells, blanks, neighboring 89/90/108, fractional walls, bundle, geometry and bounds in static and WordPress data.');
