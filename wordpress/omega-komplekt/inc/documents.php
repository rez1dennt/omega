<?php
defined( 'ABSPATH' ) || exit;

function omega_theme_document_query_vars( array $vars ): array {
    $vars[] = 'omega_document';
    return $vars;
}
add_filter( 'query_vars', 'omega_theme_document_query_vars' );

function omega_theme_document_template( string $template ): string {
    $requested = get_query_var( 'omega_document', '' );
    if ( '' === $requested ) {
        return $template;
    }
    if ( ! is_string( $requested ) || ! in_array( $requested, array( 'privacy', 'consent' ), true ) ) {
        $GLOBALS['wp_query']->set_404();
        status_header( 404 );
        return get_404_template() ?: $template;
    }
    $GLOBALS['wp_query']->is_404 = false;
    $GLOBALS['wp_query']->is_home = false;
    $GLOBALS['wp_query']->is_page = false;
    $GLOBALS['wp_query']->is_single = false;
    $GLOBALS['wp_query']->is_singular = false;
    // A document query is its own route, even when attached to an existing Page URL.
    $GLOBALS['wp_query']->queried_object = null;
    $GLOBALS['wp_query']->queried_object_id = 0;
    remove_action( 'wp_head', 'rel_canonical' );
    status_header( 200 );
    return get_theme_file_path( '/page-' . $requested . '.php' );
}
add_filter( 'template_include', 'omega_theme_document_template' );

function omega_theme_document_redirect( $redirect ) {
    return get_query_var( 'omega_document', '' ) ? false : $redirect;
}
add_filter( 'redirect_canonical', 'omega_theme_document_redirect' );
