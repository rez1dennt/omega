<?php
/**
 * Template Name: Политика обработки данных
 * Template Post Type: page
 */
defined( 'ABSPATH' ) || exit;
get_header();
if ( ! function_exists( 'omega_site_settings_values' ) && ! get_query_var( 'omega_document', '' ) && is_page() && have_posts() && '' !== trim( (string) get_post_field( 'post_content', get_queried_object_id() ) ) ) {
    get_template_part( 'template-parts/content/page' );
} else {
    get_template_part( 'template-parts/documents/privacy' );
}
get_footer();
