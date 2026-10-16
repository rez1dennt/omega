import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
assert.ok(existsSync(new URL('../dist/scripts/pitch-data.js',import.meta.url)),'pitch data module must exist');
const {rodRanges,pipeDiameters,pipeWalls,pipePitches,lookupRod,lookupPipe,parseDimension}=await import('../dist/scripts/pitch-data.js');
assert.deepEqual(rodRanges.map(row=>[row.min,row.max,row.pitch]),[[0,25,'10/14'],[15,40,'8/12'],[25,50,'6/10'],[35,70,'5/8'],[40,90,'5/6'],[50,120,'4/6'],[80,150,'3/4'],[130,350,'2/3'],[150,450,'1,5/2'],[200,600,'1,1/1,6'],[500,Infinity,'0,75/1,25']]);
assert.deepEqual(pipeDiameters,[20,40,60,80,100,120,150,200,300,500]);
assert.deepEqual(pipeWalls,[2,3,4,5,6,8,10,12,15,20,30,50]);
const expected=[
 ['14','14','14','14','14','14','10/14','10/14','8/12','6/10'],
 ['14','14','14','10/14','10/14','10/14','8/12','8/12','6/10','5/8'],
 ['10/14','10/14','10/14','8/12','8/12','8/12','6/10','6/10','5/8','4/6'],
 ['10/14','8/12','8/12','8/12','6/10','6/10','5/8','5/8','4/6','4/6'],
 ['8/12','8/12','6/10','6/10','5/8','5/8','5/8','5/8','4/6','3/4'],
 ['8/12','6/10','6/10','6/10','5/8','5/8','5/8','5/8','4/6','3/4'],
 [null,'6/10','5/8','5/8','5/8','5/8','4/6','4/6','3/4','3/4'],
 [null,'5/8','5/8','5/8','4/6','4/6','4/6','3/4','3/4','3/4'],
 [null,'5/8','5/8','4/6','4/6','4/6','4/6','3/4','2/3','2/3'],
 [null,null,'4/6','4/6','4/6','3/4','3/4','2/3','2/3','2/3'],
 [null,null,null,'3/4','3/4','3/4','3/4','2/3','2/3','2/3'],
 [null,null,null,null,null,null,'2/3','2/3','2/3','2/3'],
];
assert.deepEqual(pipePitches,expected,'all 120 cells must match the supplied table, including empty cells');
for(const [row,wall] of pipeWalls.entries())for(const [column,diameter] of pipeDiameters.entries())assert.equal(lookupPipe(diameter,wall).pitch,expected[row][column]);
assert.deepEqual(lookupRod(60).map(row=>row.pitch),['5/8','5/6','4/6']);
assert.deepEqual(lookupRod(25).map(row=>row.pitch),['10/14','8/12','6/10']);
assert.equal(lookupRod(500).some(row=>row.pitch==='0,75/1,25'),false);
assert.equal(lookupRod(500.1).some(row=>row.pitch==='0,75/1,25'),true);
assert.deepEqual(lookupRod(0),[]);assert.deepEqual(lookupRod(NaN),[]);
assert.equal(lookupPipe(40,3,true).pitch,'8/12');assert.equal(lookupPipe(40,3,true).effectiveWall,6);
assert.equal(lookupPipe(20,10).state,'missing');assert.equal(lookupPipe(90,4).state,'missing');
assert.equal(lookupPipe(80,7,true).state,'missing');assert.equal(lookupPipe(100,0).state,'invalid');
assert.equal(parseDimension('2,5'),2.5);for(const value of ['','abc','-2','1e2','0','2..5'])assert.ok(Number.isNaN(parseDimension(value)));
console.log('PASS: all 11 rod intervals and 120 pipe cells; overlap, boundaries, blanks, exact sizes and doubled wall. Pure lookup only; no network/mail.');
