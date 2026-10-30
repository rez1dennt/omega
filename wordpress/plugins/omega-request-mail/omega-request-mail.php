<?php
/**
 * Plugin Name: Омега — Заявки на почту
 * Description: Безопасный приём заявок темы «Омега Комплект» и доставка через Mail.ru.
 * Version: 1.0.0
 * Requires PHP: 8.1
 */
defined( 'ABSPATH' ) || exit;

/** Validate without accepting a recipient or headers from the visitor. */
function omega_request_validate( array $input, string $consent_version ): array {
    $text = static function ( $value, int $limit ): ?string {
        if ( ! is_string( $value ) || 1 !== preg_match( '//u', $value ) || preg_match_all( '/./us', $value ) > $limit ) {
            return null;
        }
        return trim( $value );
    };
    $parameters = $text( $input['parameters'] ?? null, 3000 );
    $email = $text( $input['email'] ?? null, 254 );
    $phone = $text( $input['phone'] ?? null, 24 );
    $name = $text( $input['name'] ?? '', 160 );
    $digits = null === $phone ? '' : preg_replace( '/\D/', '', $phone );
    if ( 10 === strlen( $digits ) ) { $digits = '7' . $digits; }
    if ( 11 === strlen( $digits ) && '8' === $digits[0] ) { $digits = '7' . substr( $digits, 1 ); }
    $errors = array();
    if ( null === $parameters || '' === $parameters ) { $errors['parameters'] = 'Укажите параметры заказа — до 3000 символов.'; }
    if ( null === $email || ! filter_var( $email, FILTER_VALIDATE_EMAIL ) || preg_match( '/[\r\n]/', $email ) ) { $errors['email'] = 'Проверьте e-mail.'; }
    if ( null === $phone || ! preg_match( '/^[+\d\s()-]+$/D', $phone ) || ! preg_match( '/^7\d{10}$/D', $digits ) ) { $errors['phone'] = 'Проверьте номер телефона.'; }
    if ( null === $name ) { $errors['name'] = 'Имя или компания — до 160 символов.'; }
    if ( ( $input['consent'] ?? null ) !== true ) { $errors['consent'] = 'Подтвердите согласие на обработку данных.'; }
    if ( $errors ) { return array( 'ok' => false, 'code' => 'validation_failed', 'fieldErrors' => $errors ); }
    $id = $input['requestId'] ?? '';
    if ( ! is_string( $id ) || ! preg_match( '/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iD', $id ) || ! empty( $input['website'] ) ) {
        return array( 'ok' => false, 'code' => 'invalid_request' );
    }
    if ( '' === $consent_version || ( $input['consentVersion'] ?? '' ) !== $consent_version ) {
        return array( 'ok' => false, 'code' => 'consent_changed' );
    }
    return array( 'ok' => true, 'data' => array( 'parameters' => $parameters, 'email' => $email, 'phone' => '+' . $digits, 'name' => $name, 'requestId' => strtolower( $id ), 'consentVersion' => $consent_version ) );
}

function omega_request_config(): array {
    $file = defined( 'OMEGA_REQUEST_CONFIG' ) ? OMEGA_REQUEST_CONFIG : dirname( rtrim( ABSPATH, '/\\' ), 2 ) . '/omega-mail-private/config.php';
    if ( ! is_string( $file ) || ! is_file( $file ) || ! is_readable( $file ) ) { return array(); }
    $config = require $file;
    if ( ! is_array( $config ) || ( $config['enabled'] ?? false ) !== true || ! is_string( $config['password'] ?? null ) || '' === $config['password'] ) { return array(); }
    return $config;
}

function omega_request_settings( $settings ): array {
    $settings = is_array( $settings ) ? $settings : array();
    // Some hosts keep an HTTP home URL behind an HTTPS proxy; forms must never post over HTTP.
    $settings['endpoint'] = set_url_scheme( rest_url( 'omega-request/v1/send' ), 'https' );
    $settings['nonce'] = '';
    return $settings;
}
add_filter( 'omega_theme_request_settings', 'omega_request_settings' );

function omega_request_origin_allowed(): bool {
    $origin = isset( $_SERVER['HTTP_ORIGIN'] ) && is_string( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';
    $request_origin = wp_parse_url( $origin );
    $site = wp_parse_url( home_url( '/' ) );
    return is_ssl() && is_array( $request_origin ) && is_array( $site )
        && 'https' === strtolower( $request_origin['scheme'] ?? '' )
        && ! empty( $site['host'] ) && strtolower( $request_origin['host'] ?? '' ) === strtolower( $site['host'] )
        && ! isset( $request_origin['user'] ) && ! isset( $request_origin['pass'] )
        && ! isset( $request_origin['path'] ) && ! isset( $request_origin['query'] ) && ! isset( $request_origin['fragment'] )
        && (int) ( $request_origin['port'] ?? 443 ) === (int) ( $site['port'] ?? 443 );
}

function omega_request_response( string $code, int $status, array $extra = array() ): WP_REST_Response {
    $response = new WP_REST_Response( array_merge( array( 'ok' => false, 'code' => $code ), $extra ), $status );
    $response->header( 'Cache-Control', 'no-store, private' );
    $response->header( 'X-Content-Type-Options', 'nosniff' );
    return $response;
}

function omega_request_cleanup( string $option ): void {
    if ( ! preg_match( '/^omega_request_[a-f0-9-]{36}$/D', $option ) ) { return; }
    $record = get_option( $option );
    if ( is_array( $record ) && (int) ( $record['time'] ?? 0 ) <= time() - HOUR_IN_SECONDS ) { delete_option( $option ); }
}
add_action( 'omega_request_cleanup', 'omega_request_cleanup' );

function omega_request_send( WP_REST_Request $request ): WP_REST_Response {
    if ( ! omega_request_origin_allowed() ) { return omega_request_response( 'origin_rejected', 403 ); }
    $type = strtolower( (string) $request->get_header( 'content-type' ) );
    if ( 0 !== strpos( $type, 'application/json' ) || strlen( $request->get_body() ) > 16384 ) { return omega_request_response( 'invalid_request', 400 ); }
    $config = omega_request_config();
    if ( ! $config || ! function_exists( 'omega_theme_consent_version' ) ) { return omega_request_response( 'mail_not_configured', 503 ); }
    $body = $request->get_json_params();
    if ( ! is_array( $body ) ) { return omega_request_response( 'invalid_request', 400 ); }
    $validated = omega_request_validate( $body, omega_theme_consent_version() );
    if ( ! $validated['ok'] ) { return omega_request_response( $validated['code'], 422, isset( $validated['fieldErrors'] ) ? array( 'fieldErrors' => $validated['fieldErrors'] ) : array() ); }
    $data = $validated['data'];
    $id = $data['requestId'];
    $key = 'omega_request_' . $id;
    $digest = hash_hmac( 'sha256', wp_json_encode( $data ), wp_salt( 'auth' ) );
    $existing = get_option( $key );
    if ( is_array( $existing ) ) {
        if ( ! hash_equals( (string) ( $existing['digest'] ?? '' ), $digest ) ) { return omega_request_response( 'duplicate_conflict', 409 ); }
        if ( 'sent' === ( $existing['status'] ?? '' ) ) { return new WP_REST_Response( array( 'ok' => true, 'status' => 'accepted', 'requestId' => $id ), 200 ); }
        return omega_request_response( 'delivery_unconfirmed', 409 );
    }
    $ip = isset( $_SERVER['REMOTE_ADDR'] ) && is_string( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $rate_key = 'omega_rate_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) ), 0, 32 );
    $count = (int) get_transient( $rate_key );
    if ( $count >= 5 ) { return omega_request_response( 'rate_limited', 429 ); }
    if ( ! add_option( $key, array( 'digest' => $digest, 'status' => 'sending', 'time' => time() ), '', false ) ) { return omega_request_response( 'delivery_unconfirmed', 409 ); }
    set_transient( $rate_key, $count + 1, 10 * MINUTE_IN_SECONDS );
    wp_schedule_single_event( time() + HOUR_IN_SECONDS, 'omega_request_cleanup', array( $key ) );
    $configure = static function ( $mailer ) use ( $config ): void {
        $mailer->isSMTP();
        $mailer->Host = 'smtp.mail.ru';
        $mailer->Port = 465;
        $mailer->SMTPSecure = 'ssl';
        $mailer->SMTPAuth = true;
        $mailer->Username = 'omegakomplekt@mail.ru';
        $mailer->Password = $config['password'];
        $mailer->Timeout = 15;
        $mailer->SMTPDebug = 0;
        $mailer->setFrom( 'omegakomplekt@mail.ru', 'Омега Комплект — сайт', false );
    };
    $subject = 'Заявка с сайта «Омега Комплект» — ' . substr( $id, 0, 8 );
    $message = "Новая заявка с сайта\n\nПараметры заказа:\n{$data['parameters']}\n\nИмя / Компания: {$data['name']}\nТелефон: {$data['phone']}\nE-mail: {$data['email']}\n\nНомер заявки: {$id}\nВремя: " . gmdate( 'c' ) . "\nСогласие на обработку данных: подтверждено\nРедакция согласия: {$data['consentVersion']}";
    add_action( 'phpmailer_init', $configure, PHP_INT_MAX );
    try {
        $sent = wp_mail( 'omegakomplekt@mail.ru', $subject, $message, array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $data['email'] ) );
    } catch ( Throwable $error ) {
        $sent = false;
    } finally {
        remove_action( 'phpmailer_init', $configure, PHP_INT_MAX );
    }
    update_option( $key, array( 'digest' => $digest, 'status' => $sent ? 'sent' : 'unconfirmed', 'time' => time() ), false );
    if ( ! $sent ) { return omega_request_response( 'delivery_unconfirmed', 502 ); }
    $response = new WP_REST_Response( array( 'ok' => true, 'status' => 'accepted', 'requestId' => $id ), 200 );
    $response->header( 'Cache-Control', 'no-store, private' );
    return $response;
}

function omega_request_register_route(): void {
    register_rest_route( 'omega-request/v1', '/send', array( 'methods' => 'POST', 'callback' => 'omega_request_send', 'permission_callback' => '__return_true' ) );
}
add_action( 'rest_api_init', 'omega_request_register_route' );
