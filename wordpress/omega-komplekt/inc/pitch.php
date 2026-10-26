<?php
defined( 'ABSPATH' ) || exit;

/** Canonical shipped tables shared by the public renderer and the settings plugin. */
function omega_theme_pitch_defaults(): array {
    static $defaults;
    if ( null === $defaults ) {
        $file = dirname( __DIR__ ) . '/data/pitch-data.json';
        $decoded = json_decode( (string) file_get_contents( $file ), true );
        $defaults = is_array( $decoded ) ? $decoded : array();
    }
    return $defaults;
}

function omega_theme_pitch_valid_tpi( $value ): bool {
    if ( ! is_scalar( $value ) || ! preg_match( '~^\d+(?:[.,]\d+)?(?:/\d+(?:[.,]\d+)?)?$~D', (string) $value ) ) {
        return false;
    }
    foreach ( explode( '/', str_replace( ',', '.', (string) $value ) ) as $part ) {
        if ( (float) $part <= 0 ) {
            return false;
        }
    }
    return true;
}

/** Invalid external/provider values retain the complete verified reference table. */
function omega_theme_pitch_matrix( $value, array $fallback ): array {
    if ( ! is_array( $value ) || empty( $value['diameters'] ) || empty( $value['walls'] ) || ! isset( $value['cells'] ) || ! is_array( $value['cells'] ) ) {
        return $fallback;
    }
    $matrix = array();
    foreach ( array( 'diameters', 'walls' ) as $axis ) {
        if ( ! is_array( $value[ $axis ] ) ) {
            return $fallback;
        }
        $matrix[ $axis ] = array();
        $previous = 0;
        foreach ( $value[ $axis ] as $number ) {
            $number = is_scalar( $number ) ? str_replace( ',', '.', (string) $number ) : '';
            if ( ! is_numeric( $number ) || ! is_finite( (float) $number ) || (float) $number <= $previous ) {
                return $fallback;
            }
            $previous = (float) $number;
            $matrix[ $axis ][] = $previous;
        }
    }
    if ( count( $value['cells'] ) !== count( $matrix['walls'] ) ) {
        return $fallback;
    }
    $matrix['cells'] = array();
    foreach ( $value['cells'] as $row ) {
        if ( ! is_array( $row ) || count( $row ) !== count( $matrix['diameters'] ) ) {
            return $fallback;
        }
        $cells = array();
        foreach ( $row as $pitch ) {
            if ( null === $pitch || '' === $pitch ) {
                $cells[] = null;
            } elseif ( omega_theme_pitch_valid_tpi( $pitch ) ) {
                $cells[] = (string) $pitch;
            } else {
                return $fallback;
            }
        }
        $matrix['cells'][] = $cells;
    }
    return $matrix;
}

function omega_theme_pitch_data(): array {
    $defaults = omega_theme_pitch_defaults();
    $data = $defaults;
    unset( $data['ui'] );
    $fallback = array(
        'tpi_order' => array_map( static function ( string $pitch ): array { return array( 'pitch' => $pitch ); }, $defaults['tpiOrder'] ),
        'rod_ranges' => array_map( static function ( array $row ): array {
            return array( 'min' => $row['min'], 'max' => $row['max'], 'label' => $row['label'], 'pitch' => $row['pitch'], 'exclusive_min' => ! empty( $row['exclusiveMin'] ) );
        }, $defaults['rodRanges'] ),
        'lenox_source' => array( 'name' => $defaults['lenoxSource']['name'], 'page' => $defaults['lenoxSource']['page'], 'url' => $defaults['lenoxSource']['url'], 'min_wall' => $defaults['lenoxSource']['minWall'], 'max_wall' => $defaults['lenoxSource']['maxWall'] ),
        'lenox_axis' => array_map( static function ( array $row ): array { return array( 'wall' => $row[0], 'position' => $row[1] ); }, $defaults['lenoxWallAxis'] ),
        'lenox_bands' => array_map( static function ( array $row ): array {
            return array( 'from' => $row['from'], 'to' => $row['to'], 'pitches' => array_map( static function ( string $pitch ): array { return array( 'pitch' => $pitch ); }, $row['pitches'] ) );
        }, $defaults['lenoxPitchBands'] ),
        'common_diameters' => array_map( static function ( $diameter ): array { return array( 'diameter' => $diameter ); }, $defaults['commonPipeDiameters'] ),
        'bahco_source' => $defaults['bahcoSource'],
    );
    $settings = function_exists( 'omega_theme_settings' ) ? omega_theme_settings( 'pitch_data', $fallback ) : $fallback;
    $settings = array_replace( $fallback, $settings );
    $order = array();
    foreach ( (array) $settings['tpi_order'] as $row ) {
        if ( ! is_array( $row ) || ! omega_theme_pitch_valid_tpi( $row['pitch'] ?? null ) ) {
            $order = $defaults['tpiOrder'];
            break;
        }
        $order[] = (string) $row['pitch'];
    }
    $data['tpiOrder'] = $order;
    $rods = array();
    foreach ( (array) $settings['rod_ranges'] as $row ) {
        if ( ! is_array( $row ) || ! isset( $row['min'], $row['label'], $row['pitch'] ) || ! is_numeric( $row['min'] ) || (float) $row['min'] < 0 || ! omega_theme_pitch_valid_tpi( $row['pitch'] ) || ! is_scalar( $row['label'] ) ) {
            $rods = array();
            break;
        }
        $maximum = $row['max'] ?? null;
        if ( '' === $maximum ) {
            $maximum = null;
        }
        if ( null !== $maximum && ( ! is_numeric( $maximum ) || (float) $maximum < (float) $row['min'] ) ) {
            $rods = array();
            break;
        }
        $rods[] = array( 'min' => (float) $row['min'], 'max' => null === $maximum ? null : (float) $maximum, 'label' => (string) $row['label'], 'pitch' => (string) $row['pitch'], 'exclusiveMin' => ! empty( $row['exclusive_min'] ) );
    }
    if ( $rods ) {
        $data['rodRanges'] = $rods;
    }
    foreach ( array( 'omega' => 'pipe', 'bahco' => 'bahco' ) as $section => $prefix ) {
        $matrix_default = array( 'diameters' => $defaults[ $prefix . 'Diameters' ], 'walls' => $defaults[ $prefix . 'Walls' ], 'cells' => $defaults[ $prefix . 'Pitches' ] );
        $table_settings = function_exists( 'omega_theme_settings' ) ? omega_theme_settings( 'pitch_' . $section, array( 'matrix' => $matrix_default ) ) : array();
        $matrix = omega_theme_pitch_matrix( $table_settings['matrix'] ?? $matrix_default, $matrix_default );
        $data[ $prefix . 'Diameters' ] = $matrix['diameters'];
        $data[ $prefix . 'Walls' ] = $matrix['walls'];
        $data[ $prefix . 'Pitches' ] = $matrix['cells'];
    }
    foreach ( array( 'bahco_source' => 'bahcoSource', 'lenox_source' => 'lenoxSource' ) as $source_key => $output_key ) {
        $source = is_array( $settings[ $source_key ] ) ? $settings[ $source_key ] : array();
        foreach ( array( 'name', 'url', 'page' ) as $key ) {
            if ( isset( $source[ $key ] ) && is_scalar( $source[ $key ] ) ) {
                $value = 'page' === $key ? max( 1, (int) $source[ $key ] ) : (string) $source[ $key ];
                if ( 'url' !== $key || preg_match( '~^https?://~i', $value ) ) {
                    $data[ $output_key ][ $key ] = $value;
                }
            }
        }
    }
    $axis = array();
    $last_wall = 0;
    $last_position = 0;
    foreach ( (array) $settings['lenox_axis'] as $row ) {
        if ( ! is_array( $row ) || ! isset( $row['wall'], $row['position'] ) || ! is_numeric( $row['wall'] ) || ! is_numeric( $row['position'] ) || (float) $row['wall'] <= $last_wall || (float) $row['position'] <= $last_position ) {
            $axis = array();
            break;
        }
        $last_wall = (float) $row['wall'];
        $last_position = (float) $row['position'];
        $axis[] = array( $last_wall, $last_position );
    }
    if ( count( $axis ) >= 2 ) {
        $data['lenoxWallAxis'] = $axis;
    }
    $bands = array();
    $last_from = -INF;
    foreach ( (array) $settings['lenox_bands'] as $row ) {
        if ( ! is_array( $row ) || ! isset( $row['from'], $row['to'], $row['pitches'] ) || ! is_numeric( $row['from'] ) || ! is_numeric( $row['to'] ) || (float) $row['from'] <= $last_from || (float) $row['to'] <= (float) $row['from'] || ! is_array( $row['pitches'] ) || ! $row['pitches'] ) {
            $bands = array();
            break;
        }
        $pitches = array();
        foreach ( $row['pitches'] as $pitch_row ) {
            if ( ! is_array( $pitch_row ) || ! omega_theme_pitch_valid_tpi( $pitch_row['pitch'] ?? null ) ) {
                $pitches = array();
                break;
            }
            $pitches[] = (string) $pitch_row['pitch'];
        }
        if ( ! $pitches ) {
            $bands = array();
            break;
        }
        $last_from = (float) $row['from'];
        $bands[] = array( 'from' => $last_from, 'to' => (float) $row['to'], 'pitches' => array_values( array_unique( $pitches ) ) );
    }
    if ( $bands ) {
        $data['lenoxPitchBands'] = $bands;
    }
    $source = is_array( $settings['lenox_source'] ) ? $settings['lenox_source'] : array();
    $minimum = $source['min_wall'] ?? $data['lenoxWallAxis'][0][0];
    $maximum = $source['max_wall'] ?? $data['lenoxWallAxis'][ count( $data['lenoxWallAxis'] ) - 1 ][0];
    $axis_min = $data['lenoxWallAxis'][0][0];
    $axis_max = $data['lenoxWallAxis'][ count( $data['lenoxWallAxis'] ) - 1 ][0];
    $data['lenoxSource']['minWall'] = is_numeric( $minimum ) ? max( $axis_min, min( $axis_max, (float) $minimum ) ) : $axis_min;
    $data['lenoxSource']['maxWall'] = is_numeric( $maximum ) ? max( $data['lenoxSource']['minWall'], min( $axis_max, (float) $maximum ) ) : $axis_max;
    $diameters = array();
    foreach ( (array) $settings['common_diameters'] as $row ) {
        if ( is_array( $row ) && isset( $row['diameter'] ) && is_numeric( $row['diameter'] ) && (float) $row['diameter'] > 0 ) {
            $diameters[] = (float) $row['diameter'];
        }
    }
    if ( $diameters ) {
        $data['commonPipeDiameters'] = array_values( array_unique( $diameters ) );
    }
    return $data;
}

function omega_theme_pitch_ui(): array {
    $defaults = omega_theme_pitch_defaults()['ui'];
    $settings = function_exists( 'omega_theme_settings' ) ? omega_theme_settings( 'pitch_ui', $defaults ) : $defaults;
    foreach ( $defaults as $key => $value ) {
        if ( isset( $settings[ $key ] ) && is_scalar( $settings[ $key ] ) ) {
            $defaults[ $key ] = (string) $settings[ $key ];
        }
    }
    return $defaults;
}

/** Ordered union: every recommendation and reference-table value can enter the live form. */
function omega_theme_tpi_options(): array {
    $data = omega_theme_pitch_data();
    $pitches = $data['tpiOrder'];
    foreach ( $data['rodRanges'] as $row ) {
        $pitches[] = $row['pitch'];
    }
    foreach ( array( 'pipePitches', 'bahcoPitches' ) as $matrix ) {
        foreach ( $data[ $matrix ] as $row ) {
            foreach ( $row as $pitch ) {
                if ( null !== $pitch ) {
                    $pitches[] = $pitch;
                }
            }
        }
    }
    foreach ( $data['lenoxPitchBands'] as $band ) {
        $pitches = array_merge( $pitches, $band['pitches'] );
    }
    return array_map( static function ( string $pitch ): string { return $pitch . ' TPI'; }, array_values( array_unique( $pitches ) ) );
}
