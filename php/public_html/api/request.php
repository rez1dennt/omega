<?php
declare(strict_types=1);
ini_set('display_errors', '0');

$private = dirname(__DIR__, 2) . '/private';
if (!is_file($private . '/request-handler.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo '{"ok":false,"code":"mail_not_configured"}';
    exit;
}
require $private . '/request-handler.php';
$config = require $private . '/mail.example.php';
if (is_file($private . '/mail.local.php')) {
    $local = require $private . '/mail.local.php';
    if (is_array($local)) $config = array_replace($config, array_intersect_key($local, $config));
}
$config['enabled'] = getenv('OMEGA_MAIL_ENABLED') === '1' || $config['enabled'] === true;
if (getenv('OMEGA_SMTP_PASSWORD')) $config['smtp_password'] = getenv('OMEGA_SMTP_PASSWORD');
if (getenv('OMEGA_SITE_ORIGIN')) $config['site_origin'] = getenv('OMEGA_SITE_ORIGIN');
omegaHandleRequest($config);
