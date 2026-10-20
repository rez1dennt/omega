<?php
defined( 'ABSPATH' ) || exit;

/** Stable view-model boundary for a future content plugin; no options/CPT/storage here. */
function omega_theme_content( string $section ): array {
    static $defaults = array();
    $allowed = array( 'company', 'hero', 'advantages', 'production', 'pitch-guide', 'order', 'machines', 'equipment', 'delivery', 'contacts', 'selection' );
    if ( ! in_array( $section, $allowed, true ) ) {
        return array();
    }
    if ( ! isset( $defaults[ $section ] ) ) {
        $defaults[ $section ] = require get_theme_file_path( '/data/' . $section . '.php' );
    }
    $filtered = apply_filters( 'omega_theme_content', $defaults[ $section ], $section );
    if ( ! is_array( $filtered ) ) {
        return $defaults[ $section ];
    }
    // Missing fields and malformed provider values keep the verified shipped default.
    $content = $defaults[ $section ];
    foreach ( $content as $key => $value ) {
        if ( isset( $filtered[ $key ] ) && is_scalar( $filtered[ $key ] ) ) {
            $content[ $key ] = (string) $filtered[ $key ];
        }
    }
    return $content;
}
