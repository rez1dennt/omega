<?php
defined( 'ABSPATH' ) || exit;

/** Resolve only bundled defaults under a verified theme/plugin directory. */
function omega_site_settings_default_file( string $source ) {
    if ( false !== strpos( $source, "\0" ) || preg_match( '~(?:^|[\\\\/])\.\.(?:[\\\\/]|$)~', $source ) ) {
        return new WP_Error( 'omega_media_path', 'Некорректный путь исходного файла.' );
    }
    if ( 0 === strpos( $source, 'plugin:assets/defaults/' ) ) {
        $relative = substr( $source, strlen( 'plugin:' ) );
        $path = OMEGA_SITE_SETTINGS_DIR . '/' . $relative;
        $roots = array( OMEGA_SITE_SETTINGS_DIR . '/assets/defaults' );
    } elseif ( 0 === strpos( $source, 'assets/' ) ) {
        $path = get_theme_file_path( '/' . $source );
        $roots = array( get_template_directory(), get_stylesheet_directory() );
    } else {
        return new WP_Error( 'omega_media_source', 'Для первичного импорта нужен файл из комплекта темы или плагина.' );
    }
    $resolved = realpath( $path );
    if ( false === $resolved || ! is_file( $resolved ) ) {
        return new WP_Error( 'omega_media_missing', 'Исходный файл не найден: ' . sanitize_file_name( basename( $source ) ) );
    }
    if ( ! is_readable( $resolved ) ) {
        return new WP_Error( 'omega_media_unreadable', 'Не удалось прочитать исходный файл: ' . sanitize_file_name( basename( $source ) ) . '. Проверьте права доступа к файлу.' );
    }
    $normal = wp_normalize_path( $resolved );
    foreach ( $roots as $root ) {
        $root = realpath( $root );
        if ( false === $root ) {
            continue;
        }
        $prefix = rtrim( wp_normalize_path( $root ), '/' ) . '/';
        $inside = '\\' === DIRECTORY_SEPARATOR ? 0 === strncasecmp( $normal, $prefix, strlen( $prefix ) ) : 0 === strncmp( $normal, $prefix, strlen( $prefix ) );
        if ( $inside ) {
            return $resolved;
        }
    }
    return new WP_Error( 'omega_media_outside', 'Исходный файл находится вне разрешённого каталога.' );
}

/** URL helper never imports files or writes options. Empty means deliberately removed. */
function omega_site_settings_media_url( $value ): string {
    if ( is_array( $value ) ) {
        $value = $value['ID'] ?? $value['id'] ?? $value['url'] ?? '';
    }
    if ( is_int( $value ) || ( is_string( $value ) && ctype_digit( $value ) ) ) {
        return (int) $value > 0 ? (string) ( wp_get_attachment_url( (int) $value ) ?: '' ) : '';
    }
    if ( ! is_string( $value ) || '' === $value ) {
        return '';
    }
    if ( preg_match( '~^https?://~i', $value ) ) {
        return esc_url_raw( $value, array( 'http', 'https' ) );
    }
    $file = omega_site_settings_default_file( $value );
    if ( is_wp_error( $file ) ) {
        return '';
    }
    return 0 === strpos( $value, 'plugin:' )
        ? plugins_url( substr( $value, strlen( 'plugin:' ) ), OMEGA_SITE_SETTINGS_FILE )
        : get_theme_file_uri( '/' . $value );
}

/** Reject active content rather than silently changing a trusted source. */
function omega_site_settings_safe_svg( string $source ) {
    if ( '' === trim( $source ) || ! class_exists( 'DOMDocument' ) || preg_match( '/<!\s*(?:DOCTYPE|ENTITY)\b/i', $source ) ) {
        return new WP_Error( 'omega_svg_xml', 'SVG должен быть обычным XML без DTD и внешних сущностей.' );
    }
    $document = new DOMDocument();
    $document->resolveExternals = false;
    $document->substituteEntities = false;
    $previous = libxml_use_internal_errors( true );
    libxml_clear_errors();
    try {
        $loaded = $document->loadXML( $source, LIBXML_NONET | LIBXML_NOBLANKS );
        $xml_errors = libxml_get_errors();
    } finally {
        libxml_clear_errors();
        libxml_use_internal_errors( $previous );
    }
    if ( ! $loaded || $xml_errors || ! $document->documentElement || 'svg' !== strtolower( $document->documentElement->localName ) ) {
        return new WP_Error( 'omega_svg_invalid', 'Не удалось проверить SVG-файл.' );
    }
    foreach ( $document->childNodes as $node ) {
        if ( XML_PI_NODE === $node->nodeType || XML_DOCUMENT_TYPE_NODE === $node->nodeType ) {
            return new WP_Error( 'omega_svg_instruction', 'В SVG запрещены внешние инструкции обработки.' );
        }
    }
    $allowed = array( 'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'title', 'desc', 'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'stop', 'pattern', 'use', 'symbol' );
    foreach ( $document->getElementsByTagName( '*' ) as $element ) {
        if ( ! in_array( strtolower( $element->localName ), $allowed, true ) || ( $element->namespaceURI && 'http://www.w3.org/2000/svg' !== $element->namespaceURI ) ) {
            return new WP_Error( 'omega_svg_element', 'В SVG обнаружен запрещённый элемент. Используйте статическое изображение без скриптов и внешних ресурсов.' );
        }
        foreach ( $element->attributes as $attribute ) {
            $name = strtolower( $attribute->localName );
            $value = trim( $attribute->value );
            if ( 0 === strpos( $name, 'on' ) || 'src' === $name || 'base' === $name ) {
                return new WP_Error( 'omega_svg_attribute', 'SVG содержит обработчик события или внешний ресурс.' );
            }
            if ( 'href' === $name && '' !== $value && ! preg_match( '/^#[^\s\x00-\x20<>\x22\x27]+$/D', $value ) ) {
                return new WP_Error( 'omega_svg_href', 'Ссылки в SVG могут вести только на элементы этого же изображения.' );
            }
            if ( preg_match( '/(?:javascript\s*:|data\s*:|expression\s*\(|@|\/\*|\\\\)/i', $value ) ) {
                return new WP_Error( 'omega_svg_css', 'В SVG обнаружено активное или внешнее содержимое.' );
            }
            if ( preg_match_all( '/url\s*\(([^)]*)\)/i', $value, $urls ) ) {
                foreach ( $urls[1] as $url ) {
                    $url = trim( $url, " \t\r\n\"'" );
                    if ( ! preg_match( '/^#[^\s\x00-\x20<>\x22\x27]+$/D', $url ) ) {
                        return new WP_Error( 'omega_svg_url', 'SVG не должен загружать внешние файлы.' );
                    }
                }
            }
        }
    }
    return $document->saveXML( $document->documentElement );
}

function omega_site_settings_find_import( string $hash ): int {
    $ids = get_posts( array(
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 5,
        'fields' => 'ids',
        'meta_key' => '_omega_site_default_sha256',
        'meta_value' => $hash,
        'no_found_rows' => true,
    ) );
    foreach ( $ids as $id ) {
        $path = get_attached_file( (int) $id );
        if ( is_string( $path ) && is_file( $path ) ) {
            return (int) $id;
        }
    }
    return 0;
}

/** Copy to a temporary file: media_handle_sideload may move only that copy. */
function omega_site_settings_import_media( $source, array $descriptor = array() ) {
    if ( '' === $source || null === $source || false === $source || 0 === $source ) {
        return 0;
    }
    if ( is_int( $source ) || ( is_string( $source ) && ctype_digit( $source ) ) ) {
        return absint( $source );
    }
    if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'upload_files' ) ) {
        return new WP_Error( 'omega_media_forbidden', 'Для заполнения изображений нужны права управления сайтом и загрузки файлов.' );
    }
    if ( ! is_string( $source ) ) {
        return new WP_Error( 'omega_media_value', 'Некорректный исходный файл.' );
    }
    $path = omega_site_settings_default_file( $source );
    if ( is_wp_error( $path ) ) {
        return $path;
    }
    $hash = hash_file( 'sha256', $path );
    if ( ! is_string( $hash ) ) {
        return new WP_Error( 'omega_media_hash', 'Не удалось проверить исходный файл.' );
    }
    $existing = omega_site_settings_find_import( $hash );
    if ( $existing ) {
        return $existing;
    }
    $lock = omega_site_settings_acquire_lock( 'media:' . $hash );
    if ( is_wp_error( $lock ) ) {
        return $lock;
    }
    $temp = '';
    $mime_filter = null;
    $type_filter = null;
    try {
        $existing = omega_site_settings_find_import( $hash );
        if ( $existing ) {
            return $existing;
        }
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $is_svg = 'svg' === strtolower( pathinfo( $path, PATHINFO_EXTENSION ) );
        $svg = $is_svg ? omega_site_settings_safe_svg( (string) file_get_contents( $path ) ) : null;
        if ( is_wp_error( $svg ) ) {
            return $svg;
        }
        $temp = wp_tempnam( basename( $path ) );
        if ( ! $temp || ( $is_svg ? false === file_put_contents( $temp, $svg ) : ! copy( $path, $temp ) ) ) {
            return new WP_Error( 'omega_media_copy', 'Не удалось создать временную копию исходного файла.' );
        }
        if ( $is_svg ) {
            $mime_filter = static function ( $mimes ) { $mimes['svg'] = 'image/svg+xml'; return $mimes; };
            $type_filter = static function ( $data, $file, $filename ) use ( $temp ) {
                if ( wp_normalize_path( $file ) === wp_normalize_path( $temp ) && 'svg' === strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) ) ) {
                    return array( 'ext' => 'svg', 'type' => 'image/svg+xml', 'proper_filename' => false );
                }
                return $data;
            };
            add_filter( 'upload_mimes', $mime_filter );
            add_filter( 'wp_check_filetype_and_ext', $type_filter, 20, 3 );
        }
        $id = media_handle_sideload( array( 'name' => sanitize_file_name( basename( $path ) ), 'tmp_name' => $temp ), 0, sanitize_text_field( $descriptor['label'] ?? basename( $path ) ) );
        if ( is_wp_error( $id ) ) {
            return new WP_Error( 'omega_media_import', 'Не удалось добавить файл в медиатеку: ' . sanitize_file_name( basename( $path ) ) . '. Проверьте разрешённые типы файлов и права каталога загрузок.' );
        }
        update_post_meta( $id, '_omega_site_default_sha256', $hash );
        update_post_meta( $id, '_omega_site_default_source', sanitize_text_field( $source ) );
        if ( isset( $descriptor['alt'] ) ) {
            update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( (string) $descriptor['alt'] ) );
        }
        return (int) $id;
    } finally {
        if ( $mime_filter ) {
            remove_filter( 'upload_mimes', $mime_filter );
        }
        if ( $type_filter ) {
            remove_filter( 'wp_check_filetype_and_ext', $type_filter, 20 );
        }
        if ( $temp && is_file( $temp ) ) {
            wp_delete_file( $temp );
        }
        omega_site_settings_release_lock( $lock );
    }
}
