<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main class="container legal-main wp-page-main" id="main">
    <p class="eyebrow"><?php echo esc_html( omega_theme_contact( 'brand' ) ); ?></p>
    <h1><?php esc_html_e( 'Результаты поиска', 'omega-komplekt' ); ?></h1>
    <p class="legal-lead"><?php echo esc_html( get_search_query() ); ?></p>
    <?php get_search_form(); ?>
    <?php get_template_part( 'template-parts/content/loop' ); ?>
</main>
<?php get_footer(); ?>
