<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main class="container legal-main wp-page-main" id="main">
    <p class="eyebrow"><?php echo esc_html( omega_theme_contact( 'brand' ) ); ?></p>
    <?php the_archive_title( '<h1>', '</h1>' ); ?>
    <?php the_archive_description( '<div class="legal-lead">', '</div>' ); ?>
    <?php get_template_part( 'template-parts/content/loop' ); ?>
</main>
<?php get_footer(); ?>
