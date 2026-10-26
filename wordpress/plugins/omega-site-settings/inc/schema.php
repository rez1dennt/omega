<?php
defined( 'ABSPATH' ) || exit;

/** Configuration is local code, never supplied by a request or the database. */
function omega_site_settings_schema(): array {
    static $schema;
    if ( null !== $schema ) {
        return $schema;
    }
    $schema = array();
    $files = glob( OMEGA_SITE_SETTINGS_DIR . '/config/*.php' ) ?: array();
    sort( $files, SORT_STRING );
    foreach ( $files as $file ) {
        $sections = require $file;
        if ( ! is_array( $sections ) ) {
            continue;
        }
        foreach ( $sections as $section => $definition ) {
            if ( ! is_string( $section ) || ! preg_match( '/^[a-z][a-z0-9_-]*$/D', $section ) || ! is_array( $definition ) || ! isset( $definition['fields'] ) || ! is_array( $definition['fields'] ) ) {
                continue;
            }
            $schema[ $section ] = $definition;
        }
    }
    $schema = omega_site_settings_order_sections( $schema );
    return $schema;
}

/** Navigation order is independent of config filenames and field identifiers. */
function omega_site_settings_order_sections( array $schema ): array {
    $preferred = array(
        'company', 'branding', 'layout_header', 'hero', 'advantages', 'production', 'equipment', 'order', 'selection', 'delivery', 'contacts', 'layout_footer', 'links', 'icons', 'decor', 'request', 'overlays', 'cookies', 'document_privacy', 'document_consent', 'pitch_ui', 'pitch_data', 'pitch_omega', 'pitch_bahco', 'runtime', 'system',
    );
    $ordered = array();
    foreach ( $preferred as $section ) {
        if ( array_key_exists( $section, $schema ) ) {
            $ordered[ $section ] = $schema[ $section ];
        }
    }
    return $ordered + $schema;
}

function omega_site_settings_field_key( string $section, array $path = array() ): string {
    return 'field_omega_' . $section . ( $path ? '__' . implode( '__', $path ) : '' );
}

function omega_site_settings_page_slug( string $section ): string {
    $sections = array_keys( omega_site_settings_schema() );
    return isset( $sections[0] ) && $sections[0] === $section ? 'omega-site-settings' : 'omega-site-settings-' . $section;
}

/** Keep ACF settings from descriptors/args while reserving stable keys and names. */
function omega_site_settings_acf_field( string $section, string $name, array $descriptor, array $parents = array() ): array {
    $path = array_merge( $parents, array( $name ) );
    $field = array_merge( is_array( $descriptor['args'] ?? null ) ? $descriptor['args'] : array(), $descriptor );
    unset( $field['args'], $field['fields'], $field['default'], $field['alt'] );
    $field['key'] = omega_site_settings_field_key( $section, $path );
    $field['name'] = $name;
    $field['type'] = $descriptor['type'] ?? 'text';
    $field['label'] = $descriptor['label'] ?? $name;
    if ( array_key_exists( 'default', $descriptor ) && ! in_array( $field['type'], array( 'group', 'repeater', 'image', 'file' ), true ) ) {
        $field['default_value'] = $descriptor['default'];
    }
    if ( in_array( $field['type'], array( 'image', 'file' ), true ) ) {
        $field['return_format'] = 'id';
        $field['omega_default_source'] = $descriptor['default'] ?? '';
        $field['omega_default_alt'] = $descriptor['alt'] ?? '';
        $field['default_value'] = 0;
        if ( 'image' === $field['type'] && ! isset( $field['preview_size'] ) ) {
            $field['preview_size'] = 'medium';
        }
    }
    if ( in_array( $field['type'], array( 'group', 'repeater' ), true ) ) {
        $field['sub_fields'] = array();
        foreach ( $descriptor['fields'] ?? array() as $child_name => $child ) {
            $field['sub_fields'][] = omega_site_settings_acf_field( $section, (string) $child_name, $child, $path );
        }
        if ( ! isset( $field['layout'] ) ) {
            $field['layout'] = 'group' === $field['type'] ? 'block' : 'row';
        }
        if ( 'repeater' === $field['type'] && ! isset( $field['button_label'] ) ) {
            $field['button_label'] = 'Добавить строку';
        }
    }
    return $field;
}

function omega_site_settings_register_fields(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return;
    }
    omega_site_settings_matrix_field();
    foreach ( omega_site_settings_schema() as $section => $definition ) {
        $children = array();
        foreach ( $definition['fields'] as $name => $descriptor ) {
            $children[] = omega_site_settings_acf_field( $section, (string) $name, $descriptor );
        }
        acf_add_local_field_group( array(
            'key' => 'group_omega_' . $section,
            'title' => $definition['title'] ?? $section,
            'fields' => array( array(
                'key' => omega_site_settings_field_key( $section ),
                'name' => 'omega_' . $section,
                'label' => $definition['title'] ?? $section,
                'type' => 'group',
                'layout' => 'block',
                'sub_fields' => $children,
            ) ),
            'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => omega_site_settings_page_slug( $section ) ) ) ),
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'active' => true,
            'show_in_rest' => false,
        ) );
    }
}

/** Defaults also serve the frontend before the first explicit migration. */
function omega_site_settings_descriptor_default( array $descriptor ) {
    $type = $descriptor['type'] ?? 'text';
    if ( 'group' === $type ) {
        $defaults = array();
        foreach ( $descriptor['fields'] ?? array() as $name => $child ) {
            if ( omega_site_settings_is_layout( $child ) ) {
                continue;
            }
            $defaults[ $name ] = omega_site_settings_descriptor_default( $child );
        }
        return array_replace( $defaults, is_array( $descriptor['default'] ?? null ) ? $descriptor['default'] : array() );
    }
    if ( array_key_exists( 'default', $descriptor ) ) {
        return $descriptor['default'];
    }
    return 'repeater' === $type ? array() : ( 'true_false' === $type ? 0 : '' );
}

function omega_site_settings_defaults( string $section ): array {
    $definition = omega_site_settings_schema()[ $section ] ?? array();
    $defaults = array();
    foreach ( $definition['fields'] ?? array() as $name => $descriptor ) {
        if ( omega_site_settings_is_layout( $descriptor ) ) {
            continue;
        }
        $defaults[ $name ] = omega_site_settings_descriptor_default( $descriptor );
    }
    return $defaults;
}

function omega_site_settings_is_layout( array $descriptor ): bool {
    return in_array( $descriptor['type'] ?? '', array( 'accordion', 'tab', 'message' ), true );
}

/** Layout controls carry no public value, including inside groups/repeater rows. */
function omega_site_settings_clean_raw( array $fields, array $values, string $section = '', array $parents = array() ): array {
    $result = array();
    foreach ( $fields as $name => $descriptor ) {
        $path = array_merge( $parents, array( $name ) );
        $key = '' !== $section ? omega_site_settings_field_key( $section, $path ) : $name;
        if ( omega_site_settings_is_layout( $descriptor ) ) {
            continue;
        }
        $source = array_key_exists( $key, $values ) ? $key : $name;
        if ( ! array_key_exists( $source, $values ) ) {
            continue;
        }
        $value = $values[ $source ];
        if ( 'group' === ( $descriptor['type'] ?? '' ) && is_array( $value ) ) {
            $value = omega_site_settings_clean_raw( $descriptor['fields'] ?? array(), $value, $section, $path );
        } elseif ( 'repeater' === ( $descriptor['type'] ?? '' ) && is_array( $value ) ) {
            foreach ( $value as $index => $row ) {
                if ( is_array( $row ) ) {
                    $value[ $index ] = omega_site_settings_clean_raw( $descriptor['fields'] ?? array(), $row, $section, $path );
                }
            }
        }
        $result[ $name ] = $value;
    }
    return $result;
}

function omega_site_settings_is_field( array $field ): bool {
    return isset( $field['key'] ) && 0 === strpos( (string) $field['key'], 'field_omega_' );
}

function omega_site_settings_validate_value( $valid, $value, $field, $input ) {
    if ( true !== $valid || ! is_array( $field ) || ! omega_site_settings_is_field( $field ) ) {
        return $valid;
    }
    $type = $field['type'] ?? '';
    if ( in_array( $type, array( 'group', 'repeater', 'omega_matrix' ), true ) ) {
        return $valid;
    }
    if ( 'select' === $type && ! empty( $field['multiple'] ) && is_array( $value ) ) {
        foreach ( $value as $choice ) {
            if ( ! is_scalar( $choice ) || ! array_key_exists( (string) $choice, $field['choices'] ?? array() ) ) {
                return 'Выберите значение из списка.';
            }
        }
        return $valid;
    }
    if ( ! is_scalar( $value ) && null !== $value ) {
        return 'Укажите одно значение поля.';
    }
    if ( '' === (string) $value ) {
        return $valid; // ACF owns the descriptor's required rule; empty values are intentional.
    }
    if ( in_array( $type, array( 'image', 'file' ), true ) && ( ! ctype_digit( (string) $value ) || ( (int) $value > 0 && 'attachment' !== get_post_type( (int) $value ) ) ) ) {
        return 'Выберите файл из медиатеки.';
    }
    if ( 'number' === $type && ( ! is_numeric( $value ) || ! is_finite( (float) $value ) ) ) {
        return 'Укажите корректное число.';
    }
    if ( 'email' === $type && ! is_email( (string) $value ) ) {
        return 'Укажите корректный e-mail.';
    }
    if ( 'url' === $type && ! preg_match( '~^https?://~i', (string) $value ) ) {
        return 'Укажите ссылку, начинающуюся с https:// или http://.';
    }
    if ( 'select' === $type && ! array_key_exists( (string) $value, $field['choices'] ?? array() ) ) {
        return 'Выберите значение из списка.';
    }
    return $valid;
}

function omega_site_settings_sanitize_value( $value, $post_id, $field ) {
    if ( OMEGA_SITE_SETTINGS_POST_ID !== $post_id || ! is_array( $field ) || ! omega_site_settings_is_field( $field ) ) {
        return $value;
    }
    return omega_site_settings_canonical_value( $value, $field );
}

/** Shared canonical form for ACF writes and newly seeded expected values. */
function omega_site_settings_canonical_value( $value, array $field ) {
    switch ( $field['type'] ?? '' ) {
        case 'repeater':
            if ( preg_match( '/^field_omega_(document_(?:privacy|consent))__sections$/D', $field['key'] ?? '', $match ) ) {
                return omega_site_settings_document_rows( is_array( $value ) ? $value : array(), $match[1] );
            }
            return $value;
        case 'text': return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';
        case 'textarea': return is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';
        case 'wysiwyg': return is_scalar( $value ) ? wp_kses_post( (string) $value ) : '';
        case 'email': return is_scalar( $value ) ? sanitize_email( (string) $value ) : '';
        case 'url': return is_scalar( $value ) ? esc_url_raw( (string) $value, array( 'http', 'https' ) ) : '';
        case 'image':
        case 'file': return is_scalar( $value ) ? absint( $value ) : 0;
        case 'true_false': return empty( $value ) ? 0 : 1;
        case 'number': return '' === $value || null === $value ? '' : ( is_numeric( $value ) && is_finite( (float) $value ) ? 0 + $value : '' );
        case 'select':
            $choices = $field['choices'] ?? array();
            if ( ! empty( $field['multiple'] ) ) {
                return array_values( array_filter( is_array( $value ) ? $value : array(), static function ( $item ) use ( $choices ) { return is_scalar( $item ) && array_key_exists( (string) $item, $choices ); } ) );
            }
            return is_scalar( $value ) && array_key_exists( (string) $value, $choices ) ? (string) $value : '';
        default: return $value;
    }
}

/** Technical row identities stay hidden from the owner and travel with reordered content. */
function omega_site_settings_document_rows( array $rows, string $section ): array {
    $defaults = omega_site_settings_schema()[ $section ]['fields']['sections']['default'] ?? array();
    $legacy = array_column( $defaults, 'anchor', 'heading' );
    $anchor_key = omega_site_settings_field_key( $section, array( 'sections', 'anchor' ) );
    $heading_key = omega_site_settings_field_key( $section, array( 'sections', 'heading' ) );
    $used = array();
    foreach ( $rows as &$row ) {
        if ( ! is_array( $row ) ) { continue; }
        $raw_keys = array_key_exists( $heading_key, $row ) || array_key_exists( $anchor_key, $row );
        $heading = (string) ( $row[ $heading_key ] ?? $row['heading'] ?? '' );
        $anchor = (string) ( $row[ $anchor_key ] ?? $row['anchor'] ?? '' );
        if ( ! preg_match( '/^[a-z][a-z0-9-]{0,79}$/D', $anchor ) ) { $anchor = (string) ( $legacy[ $heading ] ?? '' ); }
        if ( '' === $anchor || isset( $used[ $anchor ] ) ) { $anchor = 'section-' . wp_generate_uuid4(); }
        $used[ $anchor ] = true;
        $row[ $raw_keys ? $anchor_key : 'anchor' ] = $anchor;
    }
    unset( $row );
    return $rows;
}
