<?php
defined( 'ABSPATH' ) || exit;

/** Public reads never require ACF to be active. Preserve intentionally empty values. */
function omega_site_settings( array $defaults, string $section ): array {
    $snapshot = get_option( OMEGA_SITE_SETTINGS_SNAPSHOT, array() );
    return is_array( $snapshot ) && isset( $snapshot[ $section ] ) && is_array( $snapshot[ $section ] )
        ? array_replace( $defaults, $snapshot[ $section ] ) : $defaults;
}

function omega_site_settings_values( string $section ): array {
    return omega_site_settings( omega_site_settings_defaults( $section ), $section );
}

/** Adapter for the original scalar theme boundary. New helpers consume raw IDs. */
function omega_site_settings_theme_content( array $defaults, string $section ): array {
    $values = omega_site_settings( $defaults, $section );
    $fields = omega_site_settings_schema()[ $section ]['fields'] ?? array();
    foreach ( $fields as $name => $descriptor ) {
        if ( omega_site_settings_is_layout( $descriptor ) ) {
            continue;
        }
        if ( array_key_exists( $name, $values ) && in_array( $descriptor['type'] ?? '', array( 'image', 'file' ), true ) ) {
            $values[ $name ] = omega_site_settings_media_url( $values[ $name ] );
        }
    }
    if ( 'company' === $section ) {
        foreach ( array( 'phone', 'office_phone' ) as $phone ) {
            $digits = preg_replace( '/\D/', '', is_scalar( $values[ $phone ] ?? null ) ? (string) $values[ $phone ] : '' );
            if ( 11 === strlen( $digits ) && '8' === $digits[0] ) {
                $digits = '7' . substr( $digits, 1 );
            }
            $values[ $phone . '_uri' ] = '' !== $digits ? '+' . $digits : '';
        }
    }
    return $values;
}

/** ACF's custom option post_id stores each expanded field under this prefix. */
function omega_site_settings_stored_value( string $name, &$exists = null ) {
    $missing = new stdClass();
    $value = get_option( OMEGA_SITE_SETTINGS_POST_ID . '_' . $name, $missing );
    $exists = $value !== $missing;
    return $exists ? $value : null;
}

function omega_site_settings_section_is_saved( string $section, array $fields = array(), string $prefix = '' ): bool {
    $prefix = $prefix ?: 'omega_' . $section;
    omega_site_settings_stored_value( $prefix, $exists );
    if ( $exists ) {
        return true;
    }
    foreach ( $fields as $name => $descriptor ) {
        if ( omega_site_settings_is_layout( $descriptor ) ) {
            continue;
        }
        $child_name = $prefix . '_' . $name;
        omega_site_settings_stored_value( $child_name, $exists );
        if ( $exists || ( 'group' === ( $descriptor['type'] ?? '' ) && omega_site_settings_section_is_saved( $section, $descriptor['fields'] ?? array(), $child_name ) ) ) {
            return true;
        }
    }
    return false;
}

function omega_site_settings_refresh_snapshot(): array {
    $snapshot = get_option( OMEGA_SITE_SETTINGS_SNAPSHOT, array() );
    $snapshot = is_array( $snapshot ) ? $snapshot : array();
    if ( ! function_exists( 'get_field' ) ) {
        return $snapshot;
    }
    foreach ( omega_site_settings_schema() as $section => $definition ) {
        if ( ! omega_site_settings_section_is_saved( $section, $definition['fields'] ) ) {
            continue;
        }
        $value = get_field( omega_site_settings_field_key( $section ), OMEGA_SITE_SETTINGS_POST_ID, false );
        if ( is_array( $value ) ) {
            $snapshot[ $section ] = omega_site_settings_clean_raw( $definition['fields'], $value, $section );
        }
    }
    update_option( OMEGA_SITE_SETTINGS_SNAPSHOT, $snapshot, false );
    return $snapshot;
}

function omega_site_settings_after_save( $post_id ): void {
    if ( OMEGA_SITE_SETTINGS_POST_ID === $post_id ) {
        omega_site_settings_refresh_snapshot();
    }
}

/** Short-lived locks protect imports from duplicate clicks and parallel tabs. */
function omega_site_settings_acquire_lock( string $identity ) {
    $name = 'omega_site_settings_lock_' . md5( $identity );
    $token = array( 'time' => time(), 'token' => wp_generate_uuid4() );
    if ( ! add_option( $name, $token, '', false ) ) {
        $old = get_option( $name );
        if ( is_array( $old ) && (int) ( $old['time'] ?? 0 ) < time() - 300 && get_option( $name ) === $old ) {
            delete_option( $name );
        }
        if ( ! add_option( $name, $token, '', false ) ) {
            return new WP_Error( 'omega_seed_busy', 'Этот раздел или файл уже заполняется в другом окне. Повторите через несколько минут.' );
        }
    }
    return array( $name, $token );
}

function omega_site_settings_release_lock( array $lock ): void {
    if ( isset( $lock[0], $lock[1] ) && get_option( $lock[0] ) === $lock[1] ) {
        delete_option( $lock[0] );
    }
}

/** Fill missing leaves; existence checks distinguish absent, empty, zero and false. */
function omega_site_settings_seed_descriptor( array $descriptor, $current, string $storage_name, int &$filled, $override = null, bool $has_override = false ) {
    $type = $descriptor['type'] ?? 'text';
    $default = $has_override ? $override : omega_site_settings_descriptor_default( $descriptor );
    $stored = omega_site_settings_stored_value( $storage_name, $exists );
    if ( 'group' === $type ) {
        $value = is_array( $current ) ? $current : array();
        foreach ( $descriptor['fields'] ?? array() as $name => $child ) {
            if ( omega_site_settings_is_layout( $child ) ) {
                unset( $value[ $name ] );
                continue;
            }
            $has_child_default = is_array( $default ) && array_key_exists( $name, $default );
            $child_value = omega_site_settings_seed_descriptor( $child, $value[ $name ] ?? null, $storage_name . '_' . $name, $filled, $has_child_default ? $default[ $name ] : null, $has_child_default );
            if ( is_wp_error( $child_value ) ) {
                return $child_value;
            }
            $value[ $name ] = $child_value;
        }
        return $value;
    }
    if ( 'repeater' === $type ) {
        $rows = $exists ? ( is_array( $current ) ? $current : array() ) : ( is_array( $default ) ? $default : array() );
        if ( ! $exists ) {
            ++$filled;
        }
        foreach ( $rows as $index => $row ) {
            $rows[ $index ] = omega_site_settings_seed_descriptor(
                array( 'type' => 'group', 'fields' => $descriptor['fields'] ?? array() ),
                $row,
                $storage_name . '_' . $index,
                $filled,
                $exists ? null : $row,
                ! $exists
            );
            if ( is_wp_error( $rows[ $index ] ) ) {
                return $rows[ $index ];
            }
        }
        return $rows;
    }
    if ( $exists ) {
        return $stored;
    }
    if ( in_array( $type, array( 'image', 'file' ), true ) ) {
        $default = omega_site_settings_import_media( $default, $descriptor );
        if ( is_wp_error( $default ) ) {
            return $default;
        }
    }
    // Group update_value skips null via isset; a saved empty scalar is explicit and idempotent.
    if ( null === $default ) {
        $default = '';
    }
    ++$filled;
    // Canonicalise only missing defaults. Existing leaves above are returned verbatim.
    $field = array_merge( is_array( $descriptor['args'] ?? null ) ? $descriptor['args'] : array(), $descriptor );
    return omega_site_settings_canonical_value( $default, $field );
}

/** Explicit migration only: never called on activation, page reads or cron. */
function omega_site_settings_seed_section( string $section ) {
    if ( ! current_user_can( 'manage_options' ) ) {
        return new WP_Error( 'omega_forbidden', 'Недостаточно прав для заполнения настроек.' );
    }
    if ( ! function_exists( 'get_field' ) || ! function_exists( 'update_field' ) || ! function_exists( 'acf_add_options_page' ) ) {
        return new WP_Error( 'omega_acf_required', 'Для заполнения и редактирования настроек нужен активный ACF PRO.' );
    }
    $definition = omega_site_settings_schema()[ $section ] ?? null;
    if ( ! is_array( $definition ) ) {
        return new WP_Error( 'omega_unknown_section', 'Раздел настроек не найден.' );
    }
    $lock = omega_site_settings_acquire_lock( 'section:' . $section );
    if ( is_wp_error( $lock ) ) {
        return $lock;
    }
    try {
        $name = 'omega_' . $section;
        omega_site_settings_stored_value( $name, $root_exists );
        $current = get_field( omega_site_settings_field_key( $section ), OMEGA_SITE_SETTINGS_POST_ID, false );
        if ( is_array( $current ) ) {
            $current = omega_site_settings_clean_raw( $definition['fields'], $current, $section );
        }
        $filled = 0;
        $value = omega_site_settings_seed_descriptor( array( 'type' => 'group', 'fields' => $definition['fields'] ), $current, $name, $filled );
        if ( is_wp_error( $value ) ) {
            return $value;
        }
        if ( in_array( $section, array( 'document_privacy', 'document_consent' ), true ) && isset( $value['sections'] ) && is_array( $value['sections'] ) ) {
            $value['sections'] = omega_site_settings_document_rows( $value['sections'], $section );
        }
        if ( $filled || ! $root_exists ) {
            // A group may return false when only its children changed; do not mistake that for a failure.
            update_field( omega_site_settings_field_key( $section ), $value, OMEGA_SITE_SETTINGS_POST_ID );
            $saved = get_field( omega_site_settings_field_key( $section ), OMEGA_SITE_SETTINGS_POST_ID, false );
            if ( is_array( $saved ) ) {
                $saved = omega_site_settings_clean_raw( $definition['fields'], $saved, $section );
            }
            // $value already contains canonical defaults, so every real readback difference still fails.
            if ( ! is_array( $saved ) || $saved != $value ) {
                return new WP_Error( 'omega_seed_save_failed', 'Не удалось проверить сохранение раздела. Существующие данные не сброшены; повторите заполнение.' );
            }
        }
        omega_site_settings_refresh_snapshot();
        return array( 'section' => $section, 'title' => $definition['title'] ?? $section, 'filled' => $filled );
    } finally {
        omega_site_settings_release_lock( $lock );
    }
}
