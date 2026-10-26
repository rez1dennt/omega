import assert from 'node:assert/strict';
import {lstat, readFile, readdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {relative, resolve, sep} from 'node:path';
import {deflateRawSync} from 'node:zlib';

const isPlugin = process.argv.includes('--plugin');
const slug = isPlugin ? 'omega-site-settings' : 'omega-komplekt';
const root = fileURLToPath(new URL(isPlugin ? '../wordpress/plugins/omega-site-settings/' : '../wordpress/omega-komplekt/', import.meta.url));
const destination = fileURLToPath(new URL(isPlugin ? '../../omega-site-settings-wordpress-plugin.zip' : '../../omega-komplekt-wordpress-theme.zip', import.meta.url));
const required = isPlugin ? ['omega-site-settings.php','inc/schema.php','inc/storage.php','inc/media.php','inc/admin.php','inc/class-matrix-field.php','config/content.json','config/runtime.php','config/pitch.php','assets/admin.js','assets/matrix.js','README.md'] : ['style.css','functions.php','index.php','front-page.php','header.php','footer.php','theme.json','screenshot.jpg','readme.txt','inc/assets.php','inc/integrations.php'];
for (const file of required) await readFile(resolve(root,file));
if (isPlugin) {
  assert.match(await readFile(resolve(root,'omega-site-settings.php'),'utf8'),/Plugin Name:\s*Омега — Настройка сайта/);
  JSON.parse(await readFile(resolve(root,'config/content.json'),'utf8'));
} else {
  const manifest = await readFile(resolve(root,'style.css'),'utf8');
  assert.match(manifest,/Theme Name:\s*Омега Комплект/);
  JSON.parse(await readFile(resolve(root,'theme.json'),'utf8'));
}

const files = [];
async function collect(directory) {
  for (const entry of (await readdir(directory)).sort()) {
    const path = resolve(directory,entry);
    const local = relative(root,path);
    assert.ok(!local.startsWith('..') && !local.includes(`..${sep}`),'Package path escaped theme');
    const info = await lstat(path);
    assert.equal(info.isSymbolicLink(),false,`Symlink is not permitted: ${local}`);
    assert.doesNotMatch(local,/(^|[\\/])(?:\.git|\.env[^\\/]*|qa|node_modules|private|sessions|wp-config\.php|mail\.local\.php)([\\/]|$)|\.(?:zip|tar|gz|log|sqlite|db)$/i,`Forbidden package file: ${local}`);
    if (info.isDirectory()) await collect(path);
    else if (info.isFile()) files.push({path,name:`${slug}/${local.split(sep).join('/')}`});
  }
}
await collect(root);
assert.ok(files.length < 65535,'ZIP64 is not needed for a theme');

const crcTable = Uint32Array.from({length:256},(_,index)=>{
  let value=index;
  for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;
  return value>>>0;
});
function crc32(buffer) {
  let crc=0xffffffff;
  for(const byte of buffer)crc=crcTable[(crc^byte)&255]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}
const localParts=[],centralParts=[];
let offset=0;
for(const file of files) {
  const data=await readFile(file.path);
  if (/\.(?:php|js)$/i.test(file.path)) {
    assert.doesNotMatch(data.toString('utf8'), /\b(?:wp_mail|mail)\s*\(|PHPMailer|smtp\.mail\.ru|smtp_password|OMEGA_SMTP_PASSWORD/i, `Mail implementation/credential field is outside theme scope: ${file.name}`);
  }
  const compressed=deflateRawSync(data,{level:9});
  const name=Buffer.from(file.name,'utf8'),crc=crc32(data);
  const local=Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);
  local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);
  const central=Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(0x314,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(8,10);central.writeUInt16LE(33,14);
  central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE((0o100644<<16)>>>0,38);central.writeUInt32LE(offset,42);
  localParts.push(local,name,compressed);centralParts.push(central,name);
  offset+=local.length+name.length+compressed.length;
}
const central=Buffer.concat(centralParts),end=Buffer.alloc(22);
end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
const archive=Buffer.concat([...localParts,central,end]);
await writeFile(destination,archive);
console.log(JSON.stringify({archive:destination,files:files.length,bytes:archive.length,root:slug+'/',mailCodeScan:'PASS: no SMTP implementation or password fields in PHP/JS'}));
