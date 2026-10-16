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
  return {state:pitch?'match':'missing',pitch,effectiveWall,row,column};
}
