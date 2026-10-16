/** Disposable real WordPress + official SQLite drop-in; never part of the theme ZIP.
 * Run: node scripts/wordpress-fixture.mjs prepare
 * Then: node scripts/wordpress-fixture.mjs serve
 * Then: node scripts/wordpress-theme-check.mjs
 * PHP may be overridden by OMEGA_PHP; host/port by OMEGA_WP_QA_URL.
 */
import { mkdir, access, readFile, writeFile, cp, rm, rename } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = fileURLToPath(new URL('../', import.meta.url));
export const qaRoot = resolve(repoRoot, 'qa/wordpress');
export const coreRoot = resolve(qaRoot, 'site/omega-wp');
export const sourceTheme = resolve(repoRoot, 'wordpress/omega-komplekt');
export const baseURL = process.env.OMEGA_WP_QA_URL || 'http://127.0.0.1:8095/omega-wp/';
const fixtureURL = new URL(baseURL);
if (fixtureURL.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(fixtureURL.hostname) || fixtureURL.pathname !== '/omega-wp/') throw new Error('WordPress QA URL must be a local HTTP URL ending in /omega-wp/');
const php = process.env.OMEGA_PHP || 'C:/php/php.exe';
const phpArgs = ['-d', 'extension_dir=C:/php/ext', ...['pdo_sqlite', 'sqlite3', 'openssl', 'curl', 'mbstring', 'zip'].flatMap(name => ['-d', `extension=${name}`])];
const exists = path => access(path).then(() => true, () => false);
const phpString = value => `'${value.replaceAll('\\', '/').replaceAll("'", "\\'")}'`;

function insideFixture(path) {
  const absolute = resolve(path);
  if (!absolute.startsWith(`${qaRoot}${sep}`)) throw new Error('Fixture operation escaped qa/wordpress');
  return absolute;
}

export function runPHP(action, data = {}) {
  const result = spawnSync(php, [...phpArgs, resolve(qaRoot, 'bootstrap.php'), action], {
    cwd: repoRoot, input: JSON.stringify(data), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`WordPress fixture ${action} failed: ${result.stdout}\n${result.stderr}`);
  const output = result.stdout.trim();
  try { return JSON.parse(output); } catch { throw new Error(`WordPress fixture ${action} returned invalid JSON: ${output}\n${result.stderr}`); }
}

async function download(url, path) {
  if (await exists(path)) return;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Official fixture download failed: ${response.status}`);
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
}

function unzip(archive, target) {
  const source = `$zip = new ZipArchive(); if ($zip->open(${phpString(archive)}) !== true) exit(2); if (!$zip->extractTo(${phpString(target)})) exit(3); $zip->close();`;
  const result = spawnSync(php, [...phpArgs, '-r', source], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Fixture archive extraction failed: ${result.stderr}`);
}

export async function syncTheme() {
  if (process.env.OMEGA_WP_THEME_ZIP) return installThemeArchive(resolve(process.env.OMEGA_WP_THEME_ZIP));
  if (!(await exists(resolve(sourceTheme, 'style.css')))) throw new Error('Installable theme missing: wordpress/omega-komplekt/style.css');
  const target = insideFixture(resolve(coreRoot, 'wp-content/themes/omega-komplekt'));
  await rm(target, { recursive: true, force: true });
  await cp(sourceTheme, target, { recursive: true });
  return { kind: 'source', path: sourceTheme };
}

export async function installThemeArchive(archive) {
  const listSource = `$zip=new ZipArchive(); if ($zip->open(${phpString(archive)}) !== true) exit(2); $files=[]; for($i=0;$i<$zip->numFiles;$i++) $files[]=$zip->getNameIndex($i); echo json_encode($files);`;
  const result = spawnSync(php, [...phpArgs, '-r', listSource], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Cannot inspect theme ZIP: ${result.stderr}`);
  const entries = JSON.parse(result.stdout);
  if (!entries.length || entries.some(name => !name.startsWith('omega-komplekt/') || name.includes('..') || name.includes('\\'))) throw new Error('Theme ZIP must have one safe omega-komplekt/ root');
  for (const file of ['style.css','index.php','functions.php']) if (!entries.includes(`omega-komplekt/${file}`)) throw new Error(`Theme ZIP missing ${file}`);
  const target = insideFixture(resolve(coreRoot, 'wp-content/themes/omega-komplekt'));
  await rm(target, { recursive: true, force: true });
  unzip(archive, dirname(target));
  return { kind: 'zip', path: archive, entries: entries.length, sha256: createHash('sha256').update(await readFile(archive)).digest('hex') };
}

export async function prepareFixture() {
  await mkdir(resolve(qaRoot, 'downloads'), { recursive: true });
  const archive = resolve(qaRoot, 'downloads/wordpress-7.1.3.zip');
  const sqliteArchive = resolve(qaRoot, 'downloads/sqlite-database-integration.zip');
  await Promise.all([
    download('https://downloads.wordpress.org/release/wordpress-7.1.3.zip', archive),
    download('https://downloads.wordpress.org/plugin/sqlite-database-integration.3.1.0.zip', sqliteArchive),
  ]);
  if (!(await exists(resolve(coreRoot, 'wp-load.php')))) {
    await mkdir(dirname(coreRoot), { recursive: true });
    unzip(archive, dirname(coreRoot));
    await rename(resolve(dirname(coreRoot), 'wordpress'), coreRoot);
  }
  const plugins = resolve(coreRoot, 'wp-content/plugins');
  if (!(await exists(resolve(plugins, 'sqlite-database-integration/load.php')))) unzip(sqliteArchive, plugins);
  await cp(resolve(plugins, 'sqlite-database-integration/db.copy'), resolve(coreRoot, 'wp-content/db.php'));
  await mkdir(resolve(coreRoot, 'wp-content/mu-plugins'), { recursive: true });
  const childRoot = resolve(coreRoot, 'wp-content/themes/omega-komplekt-child');
  await mkdir(resolve(childRoot, 'assets'), { recursive: true });
  await mkdir(resolve(childRoot, 'scripts'), { recursive: true });
  await writeFile(resolve(childRoot, 'style.css'), '/*\nTheme Name: Omega QA Child\nTemplate: omega-komplekt\nVersion: 1.0\n*/\n');
  await writeFile(resolve(childRoot, 'assets/qa-child.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><path d="M0 0h1v1H0z"/></svg>');
  if (await exists(resolve(sourceTheme, 'scripts/pitch-data.js'))) await writeFile(resolve(childRoot, 'scripts/pitch-data.js'), 'window.__omegaQaChildPitchDataLoaded = true;\n' + await readFile(resolve(sourceTheme, 'scripts/pitch-data.js'), 'utf8'));
  await writeFile(resolve(coreRoot, 'wp-content/mu-plugins/omega-qa-safety.php'), `<?php
// QA-only: outbound mail and WordPress HTTP are blocked before install or theme activation.
add_filter('pre_wp_mail', static function () { return true; }, PHP_INT_MAX);
add_filter('pre_http_request', static function () { return new WP_Error('omega_qa_network_blocked', 'Outbound HTTP disabled in disposable QA.'); }, PHP_INT_MAX);
add_filter('automatic_updater_disabled', '__return_true');
add_filter('wp_is_application_passwords_available', '__return_false');
`);
  const config = `<?php
define('DB_NAME', 'omega_qa'); define('DB_USER', 'qa'); define('DB_PASSWORD', ''); define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8'); define('DB_COLLATE', '');
define('WP_HOME', ${phpString(baseURL.replace(/\/$/, ''))}); define('WP_SITEURL', WP_HOME);
define('WP_ENVIRONMENT_TYPE', 'local'); define('DISABLE_WP_CRON', true); define('AUTOMATIC_UPDATER_DISABLED', true);
define('WP_HTTP_BLOCK_EXTERNAL', true); define('DISALLOW_FILE_EDIT', true); define('DISALLOW_FILE_MODS', true);
define('WP_DEBUG', true); define('WP_DEBUG_DISPLAY', false); define('WP_DEBUG_LOG', true);
define('WP_DEFAULT_THEME', 'twentytwentyfive');
$table_prefix = 'omega_qa_';
if (!defined('ABSPATH')) define('ABSPATH', __DIR__ . '/');
require_once ABSPATH . 'wp-settings.php';
`;
  await writeFile(resolve(coreRoot, 'wp-config.php'), config);
  await writeFile(resolve(qaRoot, 'router.php'), `<?php
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$prefix = '/omega-wp';
if ($path === $prefix) { header('Location: ' . $prefix . '/'); exit; }
if (!str_starts_with($path, $prefix . '/')) { http_response_code(404); exit('Outside WordPress QA fixture'); }
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'HEAD') { http_response_code(405); exit('QA forbids requests with side effects'); }
$root = ${phpString(coreRoot)};
$relative = substr($path, strlen($prefix));
$file = realpath($root . $relative);
if ($file && str_starts_with(str_replace('\\\\', '/', $file), $root . '/') && is_file($file)) {
  if (pathinfo($file, PATHINFO_EXTENSION) === 'php') { require $file; return true; }
  $types = ['css'=>'text/css', 'js'=>'application/javascript', 'mjs'=>'application/javascript', 'json'=>'application/json', 'svg'=>'image/svg+xml', 'png'=>'image/png', 'jpg'=>'image/jpeg', 'jpeg'=>'image/jpeg', 'webp'=>'image/webp', 'avif'=>'image/avif', 'ico'=>'image/x-icon', 'woff'=>'font/woff', 'woff2'=>'font/woff2'];
  header('Content-Type: ' . ($types[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? 'application/octet-stream'));
  readfile($file); return true;
}
$_SERVER['SCRIPT_NAME'] = $prefix . '/index.php'; $_SERVER['PHP_SELF'] = $_SERVER['SCRIPT_NAME'];
require $root . '/index.php';
`);
  await writeFile(resolve(qaRoot, 'bootstrap.php'), bootstrapSource());
  return runPHP('install', { password: randomBytes(24).toString('base64url') });
}

function bootstrapSource() {
  return `<?php
error_reporting(E_ALL & ~E_DEPRECATED);
$qa_action = $argv[1] ?? 'status'; $qa_data = json_decode(stream_get_contents(STDIN), true) ?: [];
$_SERVER['HTTP_HOST'] = ${phpString(new URL(baseURL).host)};
$_SERVER['SERVER_NAME'] = '127.0.0.1'; $_SERVER['SERVER_PORT'] = ${phpString(new URL(baseURL).port)};
$_SERVER['REQUEST_URI'] = '/omega-wp/'; $_SERVER['SCRIPT_NAME'] = '/omega-wp/index.php'; $_SERVER['REQUEST_METHOD'] = 'GET';
if ($qa_action === 'install') define('WP_INSTALLING', true);
require ${phpString(resolve(coreRoot, 'wp-load.php'))};
require_once ABSPATH . 'wp-admin/includes/upgrade.php';
function qa_fail($message) { fwrite(STDERR, $message . PHP_EOL); exit(1); }
function qa_result($value) { echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
if ($qa_action === 'install') {
  if (!is_blog_installed()) wp_install('Omega WordPress QA', 'omega_qa_admin', 'omega-qa@example.invalid', true, '', $qa_data['password']);
  update_option('permalink_structure', '/%postname%/');
  $page = get_page_by_path('qa-generic');
  if (!$page) $page = wp_insert_post(['post_type'=>'page', 'post_status'=>'publish', 'post_name'=>'qa-generic', 'post_title'=>'Проверочная страница WordPress', 'post_content'=>'<p>Штатный контент страницы WordPress.</p><h2>Подзаголовок</h2><p>Текст страницы для проверки темы.</p>']);
  if (!get_page_by_path('qa-entry', OBJECT, 'post')) wp_insert_post(['post_type'=>'post', 'post_status'=>'publish', 'post_name'=>'qa-entry', 'post_title'=>'Проверочная запись WordPress', 'post_content'=>'<p>Штатный контент записи WordPress.</p>']);
  qa_result(['installed'=>is_blog_installed(), 'version'=>get_bloginfo('version'), 'baseURL'=>home_url('/'), 'mailBlocked'=>has_filter('pre_wp_mail') !== false]);
}
if ($qa_action === 'activate') {
  global $wpdb;
  $before = $wpdb->get_results("SELECT ID, post_type, post_status, post_content, post_title FROM {$wpdb->posts} ORDER BY ID", ARRAY_A);
  $beforeOptions = $wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} ORDER BY option_name", OBJECT_K);
  switch_theme('omega-komplekt');
  if (!validate_current_theme()) qa_fail('Core validate_current_theme rejected omega-komplekt');
  $theme = wp_get_theme(); if ($theme->errors()) qa_fail($theme->errors()->get_error_message());
  $after = $wpdb->get_results("SELECT ID, post_type, post_status, post_content, post_title FROM {$wpdb->posts} ORDER BY ID", ARRAY_A);
  if ($before !== $after) qa_fail('Theme activation changed WordPress posts/pages');
  $afterOptions = $wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} ORDER BY option_name", OBJECT_K);
  $allowed = ['template','stylesheet','current_theme','theme_switched','theme_switch_menu_locations','recently_activated','sidebars_widgets','rewrite_rules','wp_paused_themes'];
  $changes = [];
  foreach ($afterOptions as $key=>$value) if ((!isset($beforeOptions[$key]) || $beforeOptions[$key]->option_value !== $value->option_value) && !in_array($key, $allowed, true) && !str_starts_with($key, 'theme_mods_') && !str_starts_with($key, '_transient_') && !str_starts_with($key, '_site_transient_')) $changes[] = $key;
  if ($changes) qa_fail('Activation changed unrelated options: ' . implode(', ', $changes));
  qa_result(['active'=>get_stylesheet(), 'valid'=>true, 'postsUnchanged'=>true, 'unrelatedOptionsUnchanged'=>true]);
}
if ($qa_action === 'status') qa_result(['active'=>get_stylesheet(), 'version'=>get_bloginfo('version'), 'baseURL'=>home_url('/')]);
if ($qa_action === 'static-front') {
  $front=get_page_by_path('qa-static-front');
  $id=$front ? $front->ID : wp_insert_post(['post_type'=>'page','post_status'=>'publish','post_name'=>'qa-static-front','post_title'=>'QA STATIC FRONT PAGE','post_content'=>'<p>QA_STATIC_FRONT_CONTENT_MARKER</p>']);
  update_option('show_on_front','page'); update_option('page_on_front',$id);
  qa_result(['pageId'=>$id]);
}
if ($qa_action === 'reset-front') { update_option('show_on_front','posts'); update_option('page_on_front',0); $front=get_page_by_path('qa-static-front'); if ($front) wp_delete_post($front->ID,true); qa_result(['reset'=>true]); }
if ($qa_action === 'content-snapshot') {
  global $wpdb;
  $options=[];
  $allowed=['template','stylesheet','current_theme','theme_switched','theme_switch_menu_locations','recently_activated','sidebars_widgets','rewrite_rules','wp_paused_themes'];
  foreach ($wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} ORDER BY option_name", ARRAY_A) as $option) {
    $key=$option['option_name'];
    if (in_array($key,$allowed,true) || str_starts_with($key,'theme_mods_') || str_starts_with($key,'_transient_') || str_starts_with($key,'_site_transient_')) continue;
    $options[$key]=hash('sha256',$option['option_value']);
  }
  $posts=$wpdb->get_results("SELECT * FROM {$wpdb->posts} ORDER BY ID", ARRAY_A);
  qa_result(['posts'=>hash('sha256',serialize($posts)), 'options'=>$options]);
}
if ($qa_action === 'activate-child') { switch_theme('omega-komplekt-child'); if (!validate_current_theme()) qa_fail('Core rejected child theme'); qa_result(['active'=>get_stylesheet()]); }
if ($qa_action === 'child-contracts') {
  if (get_stylesheet() !== 'omega-komplekt-child') qa_fail('Child theme is not active');
  $asset=omega_theme_asset('assets/qa-child.svg');
  if (!str_contains($asset, '/omega-komplekt-child/assets/qa-child.svg')) qa_fail('Asset helper does not honor a child override');
  if (!str_contains(omega_theme_asset('scripts/site.js'), '/omega-komplekt/scripts/site.js')) qa_fail('Asset helper cannot fall back to parent files');
  if (!str_contains(omega_theme_asset('scripts/pitch-data.js'), '/omega-komplekt-child/scripts/pitch-data.js')) qa_fail('Asset helper cannot resolve child-only data module');
  qa_result(['childOverride'=>true, 'parentFallback'=>true]);
}
if ($qa_action === 'plain' || $qa_action === 'pretty') { update_option('permalink_structure', $qa_action === 'plain' ? '' : '/%postname%/'); flush_rewrite_rules(false); qa_result(['mode'=>$qa_action]); }
if ($qa_action === 'legal-pages') {
  $ids = [];
  foreach (['privacy'=>'Политика обработки персональных данных', 'consent'=>'Согласие на обработку персональных данных'] as $slug=>$title) {
    $page = get_page_by_path($slug);
    $id = $page ? $page->ID : wp_insert_post(['post_type'=>'page', 'post_status'=>'publish', 'post_name'=>$slug, 'post_title'=>$title, 'post_content'=>'<p>Native legal page content.</p>']);
    update_post_meta($id, '_wp_page_template', 'page-' . $slug . '.php'); $ids[$slug] = $id;
  }
  qa_result($ids);
}
if ($qa_action === 'remove-legal-pages') { foreach (['privacy','consent'] as $slug) { $page=get_page_by_path($slug); if ($page) wp_delete_post($page->ID, true); } qa_result(['removed'=>true]); }
if ($qa_action === 'contracts') {
  foreach (['omega_theme_asset','omega_theme_anchor','omega_theme_document_url','omega_theme_content'] as $function) if (!function_exists($function)) qa_fail('Missing public API: ' . $function);
  foreach (['privacy','consent'] as $slug) {
    $url=omega_theme_document_url($slug); if (!str_starts_with($url, home_url('/'))) qa_fail('Legal URL escapes subdirectory: ' . $url);
    $page=get_page_by_path($slug); if ($page && $url !== get_permalink($page)) qa_fail('Legal helper does not prefer published native page');
    if (!$page && !str_contains($url, 'omega_document=' . $slug)) qa_fail('Legal fallback missing query route');
  }
  $asset=omega_theme_asset('styles/main.css'); if (!str_contains($asset, '/omega-wp/wp-content/themes/')) qa_fail('Asset URL is not WordPress subdirectory aware');
  qa_result(['helpers'=>true, 'privacy'=>omega_theme_document_url('privacy'), 'consent'=>omega_theme_document_url('consent'), 'asset'=>$asset]);
}
if ($qa_action === 'screenshot') {
  $theme=wp_get_theme(); $theme->cache_delete();
  $file=$theme->get_screenshot('relative');
  if ($file !== 'screenshot.jpg') qa_fail('WordPress does not recognize the JPEG theme screenshot');
  $image=getimagesize(get_stylesheet_directory() . '/' . $file);
  if (!$image || $image[0] !== 1200 || $image[1] !== 900) qa_fail('Theme screenshot must be actual 1200x900');
  qa_result(['recognized'=>true, 'file'=>$file, 'width'=>$image[0], 'height'=>$image[1]]);
}
if ($qa_action === 'auth') { $user=get_user_by('login','omega_qa_admin'); qa_result(['name'=>LOGGED_IN_COOKIE, 'value'=>wp_generate_auth_cookie($user->ID, time()+3600, 'logged_in'), 'url'=>home_url('/')]); }
qa_fail('Unknown fixture action');
`;
}

export async function serveFixture() {
  await prepareFixture();
  const address = new URL(baseURL);
  const child = spawn(php, [...phpArgs, '-S', `${address.hostname}:${address.port}`, '-t', resolve(qaRoot, 'site'), resolve(qaRoot, 'router.php')], { cwd: repoRoot, stdio: 'inherit' });
  child.on('exit', code => { process.exitCode = code ?? 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  console.log(`WordPress QA server: ${baseURL}; outbound mail/HTTP and all browser POST requests are blocked.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const action = process.argv[2] || 'prepare';
  if (action === 'serve') await serveFixture();
  else if (action === 'prepare') console.log(JSON.stringify(await prepareFixture()));
  else if (action === 'activate') { await syncTheme(); console.log(JSON.stringify(runPHP('activate'))); }
  else if (action === 'install-zip') { console.log(JSON.stringify(await installThemeArchive(resolve(process.argv[3] || resolve(repoRoot, '../omega-komplekt-wordpress-theme.zip'))))); console.log(JSON.stringify(runPHP('activate'))); }
  else if (action === 'auth') throw new Error('Authentication cookies are available only through the in-memory runPHP API, never CLI output.');
  else console.log(JSON.stringify(runPHP(action)));
}
