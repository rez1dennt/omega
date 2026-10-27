<?php
/** Typed presentation boundary. ACF and storage remain in the companion plugin. */
defined( 'ABSPATH' ) || exit;

function omega_theme_editor_defaults(): array {
    static $defaults;
    if ( null === $defaults ) {
        $file = get_parent_theme_file_path( '/data/editor-defaults.json' );
        $defaults = is_file( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
        $defaults = is_array( $defaults ) ? $defaults : array();
    }
    return $defaults;
}

function omega_theme_settings( string $section, array $defaults = array() ): array {
    if ( ! $defaults ) { $defaults = omega_theme_editor_defaults()[ $section ] ?? array(); }
    $values = apply_filters( 'omega_site_settings', $defaults, $section );
    return is_array( $values ) ? array_replace( $defaults, $values ) : $defaults;
}

function omega_theme_setting( string $section, string $key, $fallback = '' ) {
    $values = omega_theme_settings( $section );
    return array_key_exists( $key, $values ) ? $values[ $key ] : $fallback;
}

function omega_theme_copy( string $section, string $key, string $fallback = '' ): string {
    return esc_html( omega_theme_bind_company( (string) omega_theme_setting( $section, $key, $fallback ) ) );
}

function omega_theme_bind_company( string $text ): string {
    $original = require get_parent_theme_file_path( '/data/company.php' );
    $current = omega_theme_content( 'company' );
    $map = array();
    foreach ( array( 'name', 'brand', 'email', 'address', 'phone', 'office_phone', 'hours', 'inn', 'kpp', 'ogrn' ) as $key ) {
        if ( ! empty( $original[ $key ] ) && isset( $current[ $key ] ) ) { $map[ $original[ $key ] ] = (string) $current[ $key ]; }
    }
    return strtr( $text, $map );
}

function omega_theme_attr( string $section, string $key, string $fallback = '' ): string {
    return esc_attr( omega_theme_bind_company( (string) omega_theme_setting( $section, $key, $fallback ) ) );
}

function omega_theme_media_url( $source ): string {
    if ( is_numeric( $source ) ) { return (string) wp_get_attachment_url( (int) $source ); }
    if ( ! is_string( $source ) || '' === $source ) { return ''; }
    if ( str_starts_with( $source, 'plugin:' ) ) {
        return defined( 'OMEGA_SITE_SETTINGS_URL' ) ? OMEGA_SITE_SETTINGS_URL . substr( $source, 7 ) : '';
    }
    return omega_theme_media( $source );
}

function omega_theme_image( string $section, string $key, string $fallback, array $attributes = array() ): string {
    $source = omega_theme_setting( $section, $key, $fallback );
    $attributes['alt'] = (string) omega_theme_setting( $section, $key . '_alt', $attributes['alt'] ?? '' );
    if ( is_numeric( $source ) ) {
        return (int) $source > 0 ? wp_get_attachment_image( (int) $source, 'full', false, $attributes ) : '';
    }
    $url = omega_theme_media_url( $source );
    if ( '' === $url ) { return ''; }
    $html = '<img src="' . esc_url( $url ) . '"';
    foreach ( $attributes as $name => $value ) {
        if ( preg_match( '/^(?:class|width|height|alt|loading|decoding|fetchpriority|sizes|aria-hidden)$/', $name ) ) {
            $html .= ' ' . $name . '="' . esc_attr( (string) $value ) . '"';
        }
    }
    return $html . '>';
}

function omega_theme_link_attrs( string $slot, string $fallback, bool $local_anchor = false ): string {
    $link = omega_theme_setting( 'links', $slot, array() );
    $link = is_array( $link ) ? $link : array();
    $target = (string) ( $link['target'] ?? $fallback );
    $href = 'url' === $target ? (string) ( $link['url'] ?? '' ) : $target;
    if ( '' === $href ) { $href = $fallback; }
    $site_anchors = array( '#main', '#production', '#order', '#equipment', '#delivery', '#contacts', '#pitch-guide' );
    if ( ! $local_anchor && ! omega_theme_is_front() && in_array( $href, $site_anchors, true ) ) { $href = home_url( '/' ) . $href; }
    $attrs = 'href="' . esc_url( $href ) . '"';
    $dialogs = array( '#request-dialog', '#selection-dialog', '#production-details', '#delivery-details', '#legal-dialog', '#cookie-settings' );
    if ( in_array( $href, $dialogs, true ) ) {
        $attrs .= ' data-dialog="' . esc_attr( substr( $href, 1 ) ) . '"';
    } elseif ( ! empty( $link['new_tab'] ) ) {
        $attrs .= ' target="_blank" rel="noopener noreferrer"';
    }
    return $attrs;
}

function omega_theme_icon( string $slot, string $fallback, string $class = 'icon' ): string {
    $value = omega_theme_setting( 'icons', $slot, array() );
    $value = is_array( $value ) ? $value : array();
    if ( 'image' === ( $value['mode'] ?? '' ) ) {
        $url = omega_theme_media_url( $value['image'] ?? 0 );
        if ( $url ) { return '<img class="' . esc_attr( $class . ' is-custom-icon' ) . '" src="' . esc_url( $url ) . '" alt="" aria-hidden="true">'; }
    }
    $allowed = array( 'arrow', 'chevron', 'phone', 'mail', 'shield', 'check', 'play', 'lock', 'pin', 'close', 'menu' );
    $symbol = (string) ( $value['symbol'] ?? $fallback );
    if ( ! in_array( $symbol, $allowed, true ) ) { $symbol = $fallback; }
    $viewboxes = array( 'shield' => '0 0 32 36', 'play' => '0 0 36 36', 'lock' => '0 0 24 28', 'pin' => '0 0 24 32' );
    return '<svg class="' . esc_attr( $class ) . '" viewBox="' . esc_attr( $viewboxes[ $symbol ] ?? '0 0 24 24' ) . '" aria-hidden="true"><use href="#i-' . esc_attr( $symbol ) . '"/></svg>';
}

function omega_theme_decoration( string $slot, string $fallback, string $class ): string {
    $value = omega_theme_setting( 'decor', $slot, array() );
    if ( is_array( $value ) && isset( $value['visible'] ) && ! $value['visible'] ) { return ''; }
    $url = is_array( $value ) ? omega_theme_media_url( $value['image'] ?? 0 ) : '';
    return $url ? '<img class="' . esc_attr( $class ) . '" src="' . esc_url( $url ) . '" alt="" aria-hidden="true">' : $fallback;
}

function omega_theme_brand( string $variant = 'light', string $fallback = '#main', bool $tagline = false ): string {
    $source = omega_theme_setting( 'branding', 'logo_' . $variant, 0 );
    $url = omega_theme_media_url( $source );
    $name = (string) omega_theme_setting( 'branding', 'logo_alt', omega_theme_contact( 'brand' ) );
    $content = $url ? '<img class="brand-logo" src="' . esc_url( $url ) . '" alt="' . esc_attr( $name ) . '">' : '<span class="brand-mark" aria-hidden="true"></span><strong>' . omega_theme_wordmark() . '</strong>';
    if ( $tagline ) { $content .= '<small>' . omega_theme_copy( 'branding', 'tagline', 'Ленточные пилы и комплектующие' ) . '</small>'; }
    return '<a class="brand' . ( $tagline ? ' brand-with-tagline' : '' ) . '" ' . omega_theme_link_attrs( 'brand_' . $variant, $fallback ) . ' aria-label="' . esc_attr( $name ) . '">' . $content . '</a>';
}

function omega_theme_modal_logo(): string {
    $url = omega_theme_media_url( omega_theme_setting( 'branding', 'logo_light', 0 ) );
    return $url ? '<img class="request-logo" src="' . esc_url( $url ) . '" alt="' . omega_theme_attr( 'branding', 'logo_alt', omega_theme_contact( 'brand' ) ) . '">' : omega_theme_wordmark();
}

function omega_theme_rich( string $html ): string {
    $allowed = wp_kses_allowed_html( 'post' );
    $allowed['button'] = array( 'type' => true, 'class' => true, 'data-cookie-settings' => true );
    $original = require get_parent_theme_file_path( '/data/company.php' );
    $current = omega_theme_content( 'company' );
    $replacements = array();
    foreach ( array( 'name', 'email', 'address', 'phone_uri', 'office_phone_uri', 'phone', 'office_phone', 'inn', 'kpp', 'ogrn' ) as $key ) {
        if ( ! empty( $original[ $key ] ) && isset( $current[ $key ] ) ) {
            $replacements[ esc_html( $original[ $key ] ) ] = esc_html( $current[ $key ] );
            $replacements[ esc_attr( $original[ $key ] ) ] = esc_attr( $current[ $key ] );
        }
    }
    $html = strtr( $html, $replacements );
    // Shipped document cross-links follow WordPress home URL, including subdirectory installs.
    $html = preg_replace_callback( '~href=([\x22\x27])/?\?omega_document=(privacy|consent)\1~', static function ( array $match ): string {
        return 'href="' . esc_url( omega_theme_document_url( $match[2] ) ) . '"';
    }, $html );
    // ACF's visual editor stores paragraphs as blank lines; render the normal WP paragraph format.
    return wp_kses( wpautop( $html ), $allowed );
}

function omega_theme_consent_version(): string {
    if ( ! function_exists( 'omega_site_settings_values' ) ) { return '2026-10-15'; }
    return 'acf-' . substr( hash( 'sha256', wp_json_encode( array( omega_theme_settings( 'document_consent' ), omega_theme_content( 'company' ) ) ) ), 0, 20 );
}

function omega_theme_requisites_url(): string {
    $company = omega_theme_settings( 'company' );
    if ( 'file' === ( $company['requisites_mode'] ?? '' ) ) {
        $url = omega_theme_media_url( $company['requisites_file'] ?? 0 );
        if ( $url ) { return $url; }
    }
    return add_query_arg( 'omega_requisites', '1', home_url( '/' ) );
}

function omega_theme_download_requisites(): void {
    if ( ! isset( $_GET['omega_requisites'] ) || '1' !== $_GET['omega_requisites'] ) { return; }
    $values = omega_theme_settings( 'company' );
    $labels = array( 'name' => '', 'inn' => 'ИНН', 'kpp' => 'КПП', 'ogrn' => 'ОГРН', 'address' => 'Адрес', 'phone' => 'Телефон', 'office_phone' => 'Телефон офиса', 'email' => 'E-mail', 'checking_account' => 'Расчётный счёт', 'bank' => 'Банк', 'correspondent_account' => 'Корреспондентский счёт', 'bik' => 'БИК', 'director' => 'Директор', 'chief_accountant' => 'Главный бухгалтер' );
    foreach ( $labels as $key => $label ) { $labels[ $key ] = (string) ( $values[ 'download_label_' . $key ] ?? $label ); }
    $filename = sanitize_file_name( (string) ( $values['requisites_filename'] ?? 'omega-komplekt-rekvizity.txt' ) );
    if ( '' === $filename ) { $filename = 'omega-komplekt-rekvizity.txt'; }
    header( 'Content-Type: text/plain; charset=UTF-8' );
    header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
    echo "\xEF\xBB\xBF";
    foreach ( $labels as $key => $label ) { if ( isset( $values[ $key ] ) ) { echo ( $label ? $label . ': ' : '' ) . sanitize_text_field( (string) $values[ $key ] ) . "\r\n"; } }
    exit;
}
add_action( 'template_redirect', 'omega_theme_download_requisites', 1 );

function omega_theme_editor_translation( string $translation, string $text, string $domain ): string {
    if ( 'omega-komplekt' !== $domain ) { return $translation; }
    $values = omega_theme_setting( 'system', 'translations', array() );
    $key = 'tr_' . substr( hash( 'sha256', $text ), 0, 10 );
    return is_array( $values ) && array_key_exists( $key, $values ) ? (string) $values[ $key ] : $translation;
}
add_filter( 'gettext', 'omega_theme_editor_translation', 10, 3 );
