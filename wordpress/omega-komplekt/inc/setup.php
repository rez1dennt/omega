<?php
defined( 'ABSPATH' ) || exit;

function omega_theme_setup(): void {
    load_theme_textdomain( 'omega-komplekt', get_template_directory() . '/languages' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
    add_editor_style( array( 'styles/tokens.css', 'styles/editor.css' ) );
}
add_action( 'after_setup_theme', 'omega_theme_setup' );

function omega_theme_body_classes( array $classes ): array {
    $classes[] = 'omega-theme';
    if ( ! omega_theme_is_front() ) {
        $classes[] = 'legal-page';
    }
    return $classes;
}
add_filter( 'body_class', 'omega_theme_body_classes' );

function omega_theme_document_title( string $title ): string {
    $document = omega_theme_current_document();
    if ( $document ) {
        $titles = array( 'privacy' => 'Политика обработки персональных данных', 'consent' => 'Согласие на обработку персональных данных' );
        return $titles[ $document ] . ' — Омега Комплект';
    }
    return omega_theme_is_front() ? omega_theme_contact( 'site_title' ) : $title;
}
add_filter( 'pre_get_document_title', 'omega_theme_document_title' );

function omega_theme_head(): void {
    if ( omega_theme_is_front() ) {
        echo '<meta name="description" content="' . esc_attr( omega_theme_contact( 'description' ) ) . '">' . "\n";
    }
    if ( ! has_site_icon() ) {
        echo '<link rel="icon" type="image/svg+xml" href="' . esc_url( omega_theme_asset( 'assets/favicon.svg' ) ) . '">' . "\n";
    }
    echo '<meta name="theme-color" content="#1A1A1D">' . "\n";
    echo '<link rel="preload" href="' . esc_url( omega_theme_asset( 'assets/fonts/golos-text-variable.ttf' ) ) . '" as="font" type="font/ttf" crossorigin>' . "\n";
    if ( omega_theme_is_front() ) {
        echo '<link rel="preload" href="' . esc_url( omega_theme_asset( 'assets/images/bandsaw.webp' ) ) . '" as="image" fetchpriority="high">' . "\n";
    }
    if ( get_query_var( 'omega_document', '' ) && omega_theme_current_document() ) {
        echo '<link rel="canonical" href="' . esc_url( omega_theme_document_url( omega_theme_current_document() ) ) . '">' . "\n";
    }
}
add_action( 'wp_head', 'omega_theme_head', 2 );
