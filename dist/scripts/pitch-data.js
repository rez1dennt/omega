/* Literal transcription of the customer-supplied table.jpg. No interpolation. */
export const rodRanges = [
  {min:0,max:25,label:'до 25',pitch:'10/14'},
  {min:15,max:40,label:'15–40',pitch:'8/12'},
  {min:25,max:50,label:'25–50',pitch:'6/10'},
  {min:35,max:70,label:'35–70',pitch:'5/8'},
  {min:40,max:90,label:'40–90',pitch:'5/6'},
  {min:50,max:120,label:'50–120',pitch:'4/6'},
  {min:80,max:150,label:'80–150',pitch:'3/4'},
  {min:130,max:350,label:'130–350',pitch:'2/3'},
  {min:150,max:450,label:'150–450',pitch:'1,5/2'},
  {min:200,max:600,label:'200–600',pitch:'1,1/1,6'},
  {min:500,max:Infinity,label:'свыше 500',pitch:'0,75/1,25',exclusiveMin:true},
];
export const pipeDiameters = [20,40,60,80,100,120,150,200,300,500];
export const pipeWalls = [2,3,4,5,6,8,10,12,15,20,30,50];
export const pipePitches = [
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
// Separate manufacturer reference: BAHCO Bandsaw Catalogue 2024, page 35. Literal cells; no interpolation.
export const bahcoSource = {name:'BAHCO',page:35,url:'https://media.bahco.com/media/media-download/catalogue/Bandsaw_catalogue_UK_2024_14.pdf'};
export const bahcoDiameters = [20,40,60,80,90,100,110,120,130,140,150,160,170,180,190,200,220,250,300,350,400,500,600,700,800];
export const bahcoWalls = [2,4,6,8,10,15,25,35,50,65,75,100,130,150];
export const bahcoPitches = [
  ["14/18","14/18","14/18","14/18","14/18","14/18","14/18","14/18","10/14","10/14","10/14","10/14","10/14","10/14","10/14","10/14","10/14","8/12","8/12","8/12","8/12","8/12","8/12","8/12","8/12"],
  ["10/14","10/14","10/14","10/14","8/12","8/12","8/12","8/12","6/10","6/10","6/10","6/10","6/10","6/10","6/10","6/10","6/10","5/8","5/8","5/8","5/8","5/8","5/8","5/8","5/8"],
  ["10/14","8/12","8/12","8/12","6/10","6/10","6/10","6/10","5/8","5/8","5/8","5/8","5/8","5/8","5/8","5/8","5/8","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6"],
  [null,"6/10","6/10","6/10","5/8","5/8","5/8","5/8","5/8","5/8","5/8","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6"],
  [null,"5/8","5/8","5/8","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4"],
  [null,null,"5/8","4/6","4/6","4/6","4/6","4/6","4/6","4/6","4/6","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4"],
  [null,null,"4/6","4/6","4/6","4/6","4/6","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3"],
  [null,null,null,"3/4","3/4","3/4","3/4","3/4","3/4","3/4","3/4","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3"],
  [null,null,null,null,null,null,null,"3/4","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3","2/3"],
  [null,null,null,null,null,null,null,null,null,"2/3","2/3","2/3","2/3","2/3","2/3","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2"],
  [null,null,null,null,null,null,null,null,null,null,null,"2/3","2/3","2/3","2/3","2/3","2/3","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2","1,4/2"],
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"1,4/2","1,4/2","1,4/2","1,4/2","0,7/1","0,7/1","0,7/1","0,7/1"],
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"1,4/2","1,4/2","1,4/2","0,7/1","0,7/1","0,7/1","0,7/1"],
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"1,4/2","1,4/2","0,7/1","0,7/1","0,7/1","0,7/1"]
];
export function parseDimension(value) {
  const text = String(value).trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) return NaN;
  const number = Number(text.replace(',','.'));
  return Number.isFinite(number) && number > 0 ? number : NaN;
}
export function lookupRod(diameter) {
  if (!Number.isFinite(diameter) || diameter <= 0) return [];
  return rodRanges.filter(row=>(row.exclusiveMin?diameter>row.min:diameter>=row.min) && diameter<=row.max);
}
export function lookupPipe(diameter, wall, adjacent = false) {
  const effectiveWall = adjacent ? wall * 2 : wall;
  if (![diameter,wall,effectiveWall].every(value=>Number.isFinite(value)&&value>0)) return {state:'invalid',pitch:null,effectiveWall};
  const row = pipeWalls.indexOf(effectiveWall), column = pipeDiameters.indexOf(diameter);
  const pitch = row<0 || column<0 ? null : pipePitches[row][column];
  if(row>=0 && column>=0) return {state:pitch?'match':'missing',pitch,effectiveWall,row,column};
  const referenceRow=bahcoWalls.indexOf(effectiveWall),referenceColumn=bahcoDiameters.indexOf(diameter);
  const referencePitch=referenceRow<0 || referenceColumn<0 ? null : bahcoPitches[referenceRow][referenceColumn];
  if(referencePitch) return {state:'reference',pitch:referencePitch,effectiveWall,row:referenceRow,column:referenceColumn,source:bahcoSource};
  return {state:'missing',pitch:null,effectiveWall,row,column};
}

// LENOX 2026 industrial catalogue, p.10, "TUBING/PIPE/STRUCTURALS".
// Published diagram coordinates in PDF points, not invented numeric TPI interpolation.
// The drawing's metric labels/ticks are not perfectly aligned. A 5 pt transition
// zone retains both adjacent published pitch groups instead of false precision.
export const lenoxSource={name:'LENOX',page:10,url:'https://bynder.sbdinc.com/m/4a09882bef67f9e0/original/LXBSBR_HR.pdf',minWall:1.25,maxWall:50};
export const lenoxWallAxis=[
  [1.25,115.7934],[2.5,143.2521],[3.75,170.7108],[5,189.0166],
  [6.25,216.4753],[7.5,234.7811],[10,253.0869],[12.5,271.3927],
  [15,289.6985],[17.5,308.0043],[20,326.3101],[22.5,344.6158],
  [25,362.9216],[37.5,381.2274],[50,399.5332],
];
export const lenoxPitchBands=[
  {from:97.066,to:120.489,pitches:['14/18']},
  {from:120.489,to:144.323,pitches:['10/14']},
  {from:144.323,to:166.044,pitches:['8/12']},
  {from:166.044,to:187.651,pitches:['6/10']},
  {from:187.651,to:219.742,pitches:['6/8','5/8']},
  {from:219.742,to:286.282,pitches:['4/6']},
  {from:286.282,to:368.281,pitches:['3/4']},
  {from:368.281,to:408.510,pitches:['2/3']},
];
export const commonPipeDiameters=[20,21.3,25,26.8,32,33.5,40,42.3,48,57,60,76,89,90,108,114,133,159,219,273,325,377,426,500];
export function recommendPipe(diameter,wall,adjacent=false) {
  const effectiveWall=adjacent?wall*2:wall;
  const base={diameter,wall,adjacent,effectiveWall,choices:[]};
  if(![diameter,wall,effectiveWall].every(n=>Number.isFinite(n)&&n>0)) return {...base,state:'invalid',reason:'dimension'};
  if(wall>=diameter/2) return {...base,state:'invalid',reason:'geometry'};
  function bounds(axis,value) {
    const i=axis.findIndex(n=>n>=value);
    if(i<0 || (i===0 && axis[0]!==value)) return [];
    return axis[i]===value?[i]:[i-1,i];
  }
  const rows=bounds(pipeWalls,effectiveWall),columns=bounds(pipeDiameters,diameter);
  if(!rows.length||!columns.length) return {...base,state:'outside'};
  const choices=rows.flatMap(row=>columns.map(column=>({row,column,diameter:pipeDiameters[column],wall:pipeWalls[row],pitch:pipePitches[row][column]||null})));
  return {...base,state:!choices.some(choice=>choice.pitch)?'missing':rows.length===1&&columns.length===1?'match':'nearby',choices};
}
