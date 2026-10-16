<?php
defined( 'ABSPATH' ) || exit;

/** Resolve a public file through WordPress, including a child-theme override. */
function omega_theme_asset( string $path ): string {
    return get_theme_file_uri( '/' . ltrim( $path, '/' ) );
}

/** A future media field may provide a WordPress attachment URL or a local theme path. */
function omega_theme_media( string $source ): string {
    return preg_match( '~^https?://~i', $source ) ? esc_url_raw( $source ) : omega_theme_asset( $source );
}

function omega_theme_contact( string $key ): string {
    $company = omega_theme_content( 'company' );
    return isset( $company[ $key ] ) && is_scalar( $company[ $key ] ) ? (string) $company[ $key ] : '';
}

function omega_theme_is_front(): bool {
    return is_front_page() && '' === omega_theme_current_document();
}

/** Local anchors retain the existing mobile-navigation focus/scroll behavior. */
function omega_theme_anchor( string $id ): string {
    $fragment = '#' . sanitize_html_class( $id );
    return omega_theme_is_front() ? $fragment : home_url( '/' ) . $fragment;
}

function omega_theme_document_page( string $name ): ?WP_Post {
    if ( ! in_array( $name, array( 'privacy', 'consent' ), true ) ) {
        return null;
    }
    $page = get_page_by_path( $name, OBJECT, 'page' );
    return $page instanceof WP_Post && 'publish' === $page->post_status ? $page : null;
}

/** Prefer actual published pages; query fallback needs neither rewrites nor DB writes. */
function omega_theme_document_url( string $name, string $fragment = '' ): string {
    if ( ! in_array( $name, array( 'privacy', 'consent' ), true ) ) {
        return home_url( '/' );
    }
    $page = omega_theme_document_page( $name );
    $url  = $page ? get_permalink( $page ) : add_query_arg( 'omega_document', $name, home_url( '/' ) );
    return $url . ( '' !== $fragment ? '#' . sanitize_html_class( ltrim( $fragment, '#' ) ) : '' );
}

function omega_theme_current_document(): string {
    $name = get_query_var( 'omega_document', '' );
    if ( is_string( $name ) && in_array( $name, array( 'privacy', 'consent' ), true ) ) {
        return $name;
    }
    foreach ( array( 'privacy', 'consent' ) as $document ) {
        if ( is_page( $document ) || is_page_template( 'page-' . $document . '.php' ) ) {
            return $document;
        }
    }
    return '';
}
