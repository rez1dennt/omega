import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const client = await readFile('dist/scripts/request-client.js','utf8');
const context = vm.createContext({});
vm.runInContext(client,context);
const data = { width:'27', length:'2450', tpi:'4/6 TPI', material:'Сталь', comment:'Станок: PILOUS\n2 полотна' };
const form = { elements: { namedItem: name => ({ value: data[name] }) } };
const parameters = context.collectOrderParameters(form);
for (const expected of ['Ширина полотна: 27 мм','Длина полотна: 2450 мм','4/6 TPI','Сталь','PILOUS','2 полотна']) assert.ok(parameters.includes(expected));
const payload = { parameters, email:'person@example.test', phone:'+7 (999) 123-45-67', name:'', consent:true };
assert.equal(Object.keys(context.validateRequestPayload(payload)).length,0);
for (const [field,value] of [['parameters',''],['parameters','x'.repeat(3001)],['email','broken'],['email','a\nb@example.test'],['phone','+7 (999)'],['name','x'.repeat(161)],['consent',false]]) {
  assert.ok(context.validateRequestPayload({...payload,[field]:value})[field], `${field} must reject invalid data`);
}
const source = await readFile('dist/scripts/site.js','utf8');
assert.match(source,/attachRequestWorkflow\(orderForm, \(\) => collectOrderParameters\(orderForm\)\)/);
assert.match(source,/attachRequestWorkflow\(requestForm/);
assert.doesNotMatch(source,/orderForm\.addEventListener\('submit'[\s\S]{0,160}openDialog/);
assert.match(client,/sendRequest\(payload, form.dataset.endpoint\)/);
console.log('PASS: order parameter assembly, required contacts, phone/email/length/consent validation and shared direct-submit wiring. Pure data checks only; no requests, form submissions or SMTP.');
