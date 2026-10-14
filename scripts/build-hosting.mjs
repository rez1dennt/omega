import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, basename } from 'node:path';

const output = resolve('release/hosting');
let localSecretExists = false;
try { await access(resolve(output, 'private/mail.local.php')); localSecretExists = true; } catch { /* A clean build has no local password file. */ }
if (localSecretExists) throw new Error('The build output contains mail.local.php. Move it outside the build before creating a distributable package.');
await mkdir(output, { recursive: true });
await cp('dist', resolve(output, 'public_html'), { recursive: true });
await cp('php/public_html', resolve(output, 'public_html'), { recursive: true });
await cp('php/private', resolve(output, 'private'), {
  recursive: true,
  filter: path => !['mail.local.php', 'sessions'].includes(basename(path)),
});
await cp('docs/CONNECT-SMTP.md', resolve(output, 'CONNECT-SMTP.md'));
// Keep the Sites preview private, but allow indexing on the real hosting package.
const indexPath = resolve(output, 'public_html/index.html');
const html = (await readFile(indexPath, 'utf8')).replace(/\s*<meta name="robots" content="noindex, nofollow">/, '');
await writeFile(indexPath, html);
await writeFile(resolve(output, 'public_html/robots.txt'), 'User-agent: *\nAllow: /\n');
await access(resolve(output, 'public_html/api/request.php'));
await access(resolve(output, 'private/lib/PHPMailer/PHPMailer.php'));
console.log(`Hosting package: ${output}. SMTP remains disabled; no requests or emails sent.`);
