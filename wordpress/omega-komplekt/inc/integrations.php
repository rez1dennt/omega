<?php
defined( 'ABSPATH' ) || exit;

/** Public transport settings only. SMTP credentials never belong in theme options/JS. */
function omega_theme_request_settings(): array {
    $settings = apply_filters( 'omega_theme_request_settings', array( 'endpoint' => '', 'nonce' => '' ) );
    if ( ! is_array( $settings ) ) {
        return array( 'endpoint' => '', 'nonce' => '' );
    }
    return array(
        'endpoint' => isset( $settings['endpoint'] ) && is_string( $settings['endpoint'] ) ? esc_url_raw( $settings['endpoint'] ) : '',
        'nonce'    => isset( $settings['nonce'] ) && is_string( $settings['nonce'] ) ? sanitize_text_field( $settings['nonce'] ) : '',
    );
}
