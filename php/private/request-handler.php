<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

const OMEGA_RECIPIENT = 'omegakomplekt@mail.ru';
const OMEGA_CONSENT_VERSION = '2026-10-15';

function omegaJson(int $status, array $data): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function omegaText(mixed $value, int $max): ?string
{
    if (!is_string($value) || preg_match('//u', $value) !== 1) return null;
    $value = trim($value);
    if (preg_match_all('/./us', $value) > $max) return null;
    return $value;
}

function omegaHandleRequest(array $config): never
{
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        omegaJson(405, ['ok' => false, 'code' => 'method_not_allowed']);
    }
    $enabled = $config['enabled'] === true && $config['smtp_password'] !== '' && $config['site_origin'] !== '';
    if (!$enabled) {
        omegaJson($method === 'GET' ? 200 : 503, ['ok' => false, 'available' => false, 'code' => 'mail_not_configured']);
    }
    if (!extension_loaded('openssl') || !filter_var($config['smtp_username'], FILTER_VALIDATE_EMAIL)) {
        omegaJson(503, ['ok' => false, 'code' => 'mail_not_configured']);
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') === '443';
    if ($config['require_https'] && !$https) omegaJson(403, ['ok' => false, 'code' => 'https_required']);
    $origin = rtrim($config['site_origin'], '/');
    if ($method === 'POST' && ($_SERVER['HTTP_ORIGIN'] ?? '') !== $origin) {
        omegaJson(403, ['ok' => false, 'code' => 'origin_rejected']);
    }

    $sessionDir = __DIR__ . '/sessions';
    if (!is_dir($sessionDir) && !mkdir($sessionDir, 0700, true) && !is_dir($sessionDir)) {
        omegaJson(503, ['ok' => false, 'code' => 'temporary_unavailable']);
    }
    // Retain only short-lived technical session metadata; no lead fields are saved here.
    foreach (glob($sessionDir . '/sess_*') ?: [] as $file) {
        if (is_file($file) && filemtime($file) < time() - 3600) unlink($file);
    }
    session_save_path($sessionDir);
    session_name('omega_session');
    session_start([
        'use_strict_mode' => 1,
        'cookie_httponly' => true,
        'cookie_secure' => $https,
        'cookie_samesite' => 'Lax',
        'gc_maxlifetime' => 3600,
    ]);
    $_SESSION['csrf'] = array_filter($_SESSION['csrf'] ?? [], static fn($time) => $time > time() - 900);
    $_SESSION['requests'] = array_filter($_SESSION['requests'] ?? [], static fn($item) => $item['time'] > time() - 3600);
    if ($method === 'GET') {
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf'][$token] = time();
        $_SESSION['csrf'] = array_slice($_SESSION['csrf'], -4, null, true);
        session_write_close();
        omegaJson(200, ['available' => true, 'csrfToken' => $token, 'consentVersion' => OMEGA_CONSENT_VERSION]);
    }
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !isset($_SESSION['csrf'][$token])) {
        omegaJson(403, ['ok' => false, 'code' => 'csrf_rejected']);
    }
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        omegaJson(415, ['ok' => false, 'code' => 'invalid_request']);
    }
    $body = file_get_contents('php://input', false, null, 0, 16385);
    if ($body === false || strlen($body) > 16384) omegaJson(413, ['ok' => false, 'code' => 'request_too_large']);
    try { $data = json_decode($body, true, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException) { omegaJson(400, ['ok' => false, 'code' => 'invalid_request']); }
    if (!is_array($data) || !empty($data['website'])) omegaJson(422, ['ok' => false, 'code' => 'invalid_request']);

    $parameters = omegaText($data['parameters'] ?? null, 3000);
    $email = omegaText($data['email'] ?? null, 254);
    $phone = omegaText($data['phone'] ?? null, 24);
    $name = omegaText($data['name'] ?? '', 160);
    $digits = $phone === null ? '' : preg_replace('/\D/', '', $phone);
    if (strlen($digits) === 10) $digits = '7' . $digits;
    if (strlen($digits) === 11 && str_starts_with($digits, '8')) $digits = '7' . substr($digits, 1);
    $errors = [];
    if ($parameters === null || $parameters === '') $errors['parameters'] = 'Укажите параметры заказа — до 3000 символов.';
    if ($email === null || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) $errors['email'] = 'Проверьте e-mail.';
    if ($phone === null || !preg_match('/^[+\d\s()-]+$/', $phone) || !preg_match('/^7\d{10}$/', $digits)) $errors['phone'] = 'Проверьте номер телефона.';
    if ($name === null) $errors['name'] = 'Имя или компания — до 160 символов.';
    if (($data['consent'] ?? false) !== true) $errors['consent'] = 'Подтвердите согласие на обработку данных.';
    if ($errors) omegaJson(422, ['ok' => false, 'code' => 'validation_failed', 'fieldErrors' => $errors]);
    if (($data['consentVersion'] ?? '') !== OMEGA_CONSENT_VERSION) omegaJson(409, ['ok' => false, 'code' => 'consent_changed']);
    $id = $data['requestId'] ?? '';
    if (!is_string($id) || !preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i', $id)) omegaJson(400, ['ok' => false, 'code' => 'invalid_request']);
    $digest = hash('sha256', json_encode([$parameters, $email, $digits, $name, OMEGA_CONSENT_VERSION], JSON_THROW_ON_ERROR));
    if (isset($_SESSION['requests'][$id])) {
        $previous = $_SESSION['requests'][$id];
        if ($previous['digest'] !== $digest) omegaJson(409, ['ok' => false, 'code' => 'duplicate_conflict']);
        if ($previous['state'] === 'sent') omegaJson(200, ['ok' => true, 'status' => 'accepted', 'requestId' => $id]);
        omegaJson(409, ['ok' => false, 'code' => 'delivery_unconfirmed']);
    }
    $recent = array_filter($_SESSION['requests'], static fn($item) => $item['time'] > time() - 600);
    if (count($recent) >= 5) omegaJson(429, ['ok' => false, 'code' => 'rate_limited']);
    $_SESSION['requests'][$id] = ['state' => 'sending', 'digest' => $digest, 'time' => time()];
    session_write_close();

    require_once __DIR__ . '/lib/PHPMailer/Exception.php';
    require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/lib/PHPMailer/SMTP.php';
    $acceptedAt = date(DATE_ATOM);
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->Port = $config['smtp_port'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_username'];
        $mail->Password = $config['smtp_password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->Timeout = 15;
        $mail->SMTPDebug = 0;
        $mail->setFrom($config['smtp_username'], 'Омега Комплект — сайт');
        $mail->addAddress(OMEGA_RECIPIENT);
        $mail->addReplyTo($email);
        $mail->Subject = 'Заявка с сайта «Омега Комплект» — ' . substr($id, 0, 8);
        $mail->isHTML(false);
        $mail->Body = "Новая заявка с сайта\n\nПараметры заказа:\n{$parameters}\n\nИмя / Компания: {$name}\nТелефон: +{$digits}\nE-mail: {$email}\n\nНомер заявки: {$id}\nВремя: {$acceptedAt}\nСогласие на обработку данных: подтверждено\nРедакция согласия: " . OMEGA_CONSENT_VERSION;
        if (!$mail->send()) throw new RuntimeException('Delivery not accepted');
        session_start();
        $_SESSION['requests'][$id]['state'] = 'sent';
        session_write_close();
        omegaJson(200, ['ok' => true, 'status' => 'accepted', 'requestId' => $id]);
    } catch (Throwable) {
        session_start();
        $_SESSION['requests'][$id]['state'] = 'unconfirmed';
        session_write_close();
        // Do not log personal data, SMTP credentials or the message body.
        error_log('Omega delivery failed, request ' . $id);
        omegaJson(502, ['ok' => false, 'code' => 'delivery_unconfirmed']);
    }
}
