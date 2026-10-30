<?php
/**
 * Plugin Name: Омега — Настройка сайта
 * Description: Редактируемый контент сайта, документы и справочники через ACF PRO.
 * Version: 1.1.1
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Text Domain: omega-site-settings
 */
defined( 'ABSPATH' ) || exit;

define( 'OMEGA_SITE_SETTINGS_VERSION', '1.1.1' );
define( 'OMEGA_SITE_SETTINGS_FILE', __FILE__ );
define( 'OMEGA_SITE_SETTINGS_DIR', __DIR__ );
define( 'OMEGA_SITE_SETTINGS_URL', plugin_dir_url( __FILE__ ) );
define( 'OMEGA_SITE_SETTINGS_POST_ID', 'omega_site' );
define( 'OMEGA_SITE_SETTINGS_SNAPSHOT', 'omega_site_settings_public' );

require_once __DIR__ . '/inc/schema.php';
require_once __DIR__ . '/inc/storage.php';
require_once __DIR__ . '/inc/media.php';

function omega_site_settings_matrix_field( $version = null ): void {
    static $instance;
    if ( $instance || ! class_exists( 'acf_field' ) ) {
        return;
    }
    $file = OMEGA_SITE_SETTINGS_DIR . '/inc/class-matrix-field.php';
    if ( is_file( $file ) ) {
        require_once $file;
        if ( class_exists( 'Omega_Site_Matrix_Field' ) ) {
            $instance = new Omega_Site_Matrix_Field();
        }
    }
}
add_action( 'acf/include_field_types', 'omega_site_settings_matrix_field' );
add_action( 'acf/init', 'omega_site_settings_register_fields', 10 );
add_action( 'acf/save_post', 'omega_site_settings_after_save', 30 );
add_filter( 'omega_site_settings', 'omega_site_settings', 10, 2 );
add_filter( 'omega_theme_content', 'omega_site_settings_theme_content', 10, 2 );
add_filter( 'acf/validate_value', 'omega_site_settings_validate_value', 10, 4 );
// Normalize rows before ACF's type dispatcher (priority 10) converts a repeater to its row count.
add_filter( 'acf/update_value', 'omega_site_settings_sanitize_value', 5, 3 );

if ( is_admin() ) {
    require_once __DIR__ . '/inc/admin.php';
}
