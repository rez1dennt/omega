<?php
defined( 'ABSPATH' ) || exit;

function omega_theme_asset_version( string $path ): string {
    $file = get_theme_file_path( '/' . ltrim( $path, '/' ) );
    return is_file( $file ) ? (string) filemtime( $file ) : wp_get_theme( get_template() )->get( 'Version' );
}

function omega_theme_assets(): void {
    $previous = '';
    $styles = omega_theme_is_front()
        ? array( 'tokens', 'site', 'typography', 'equipment', 'benefits', 'contacts', 'overlays', 'pitch-guide', 'selection', 'wordpress' )
        : array( 'tokens', 'site', 'typography', 'overlays', 'wordpress' );
    foreach ( $styles as $name ) {
        $path = 'styles/' . $name . '.css';
        $handle = 'omega-' . $name;
        wp_enqueue_style( $handle, omega_theme_asset( $path ), $previous ? array( $previous ) : array(), omega_theme_asset_version( $path ) );
        $previous = $handle;
    }

    $scripts = omega_theme_is_front()
        ? array( 'phone-mask', 'dialogs', 'navigation', 'request-client', 'site', 'selection', 'preferences', 'motion', 'benefits' )
        : array( 'dialogs', 'preferences' );
    $previous = '';
    foreach ( $scripts as $name ) {
        $path = 'scripts/' . $name . '.js';
        $handle = 'omega-' . $name;
        wp_enqueue_script( $handle, omega_theme_asset( $path ), $previous ? array( $previous ) : array(), omega_theme_asset_version( $path ), array( 'strategy' => 'defer', 'in_footer' => true ) );
        $previous = $handle;
    }
    if ( omega_theme_is_front() ) {
        $config = array(
            'request'      => omega_theme_request_settings(),
            'contactPhone' => omega_theme_contact( 'phone' ),
            'contactEmail' => omega_theme_contact( 'email' ),
        );
        wp_add_inline_script( 'omega-request-client', 'window.OmegaTheme = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );
        wp_register_script_module( 'omega-pitch-data', omega_theme_asset( 'scripts/pitch-data.js' ), array(), omega_theme_asset_version( 'scripts/pitch-data.js' ) );
        wp_enqueue_script_module( 'omega-pitch-guide', omega_theme_asset( 'scripts/pitch-guide.js' ), array( 'omega-pitch-data' ), omega_theme_asset_version( 'scripts/pitch-guide.js' ) );
    }
    do_action( 'omega_theme_assets_enqueued' );
}
add_action( 'wp_enqueue_scripts', 'omega_theme_assets' );
