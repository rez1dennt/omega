import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
assert.ok(existsSync(new URL('../dist/scripts/pitch-data.js',import.meta.url)),'pitch data module must exist');
const {rodRanges,pipeDiameters,pipeWalls,pipePitches,lookupRod,lookupPipe,parseDimension,bahcoSource,bahcoDiameters,bahcoWalls,bahcoPitches}=await import('../dist/scripts/pitch-data.js');
assert.deepEqual(rodRanges.map(row=>[row.min,row.max,row.pitch]),[[0,25,'10/14'],[15,40,'8/12'],[25,50,'6/10'],[35,70,'5/8'],[40,90,'5/6'],[50,120,'4/6'],[80,150,'3/4'],[130,350,'2/3'],[150,450,'1,5/2'],[200,600,'1,1/1,6'],[500,Infinity,'0,75/1,25']]);
assert.deepEqual(pipeDiameters,[20,40,60,80,100,120,150,200,300,500]);
assert.deepEqual(pipeWalls,[2,3,4,5,6,8,10,12,15,20,30,50]);
assert.deepEqual(bahcoDiameters,[20,40,60,80,90,100,110,120,130,140,150,160,170,180,190,200,220,250,300,350,400,500,600,700,800]);
assert.deepEqual(bahcoWalls,[2,4,6,8,10,15,25,35,50,65,75,100,130,150]);
assert.equal(bahcoPitches.flat().length,350);
// Fingerprint independently extracted from the official PDF's page35 grid and visually verified.
assert.equal(createHash('sha256').update(JSON.stringify(bahcoPitches)).digest('hex'),'0b1ef513c055d7949c24d8ba39f69c6ef28261faf0d48e2df88102d8f3756f0e');
assert.equal(bahcoSource.page,35);assert.ok(bahcoSource.url.startsWith('https://media.bahco.com/'));
for(const [row,wall] of bahcoWalls.entries())for(const [column,diameter] of bahcoDiameters.entries()) {
 if(pipeWalls.includes(wall)&&pipeDiameters.includes(diameter))continue;
 const result=lookupPipe(diameter,wall);assert.equal(result.pitch,bahcoPitches[row][column]);
 assert.equal(result.state,result.pitch?'reference':'missing');
}

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
assert.equal(lookupPipe(20,10).state,'missing');
assert.equal(lookupPipe(90,4).state,'reference');
assert.equal(lookupPipe(90,4).pitch,'8/12');
assert.equal(lookupPipe(90,4).source.name,'BAHCO');
assert.equal(lookupPipe(90,2).pitch,'14/18');
for(const [wall,pitch] of [[6,'6/10'],[8,'5/8'],[10,'4/6'],[15,'4/6'],[25,'4/6'],[35,'3/4']])assert.equal(lookupPipe(90,wall).pitch,pitch);
assert.equal(lookupPipe(90,3,true).pitch,'6/10');
assert.equal(lookupPipe(100,4).state,'match');
for(const [diameter,wall] of [[90,3],[90,5],[90,50],[89,4],[108,4],[19,4],[801,4],[90,4.5]])assert.equal(lookupPipe(diameter,wall).state,'missing');
assert.equal(lookupPipe(80,7,true).state,'missing');assert.equal(lookupPipe(100,0).state,'invalid');
assert.equal(parseDimension('2,5'),2.5);for(const value of ['','abc','-2','1e2','0','2..5'])assert.ok(Number.isNaN(parseDimension(value)));
console.log('PASS: all 11 rod intervals, 120 original pipe cells, 350 verified BAHCO cells; source precedence, exact dimensions, blanks and doubled wall. Pure lookup only; no network/mail.');
