<?php defined( 'ABSPATH' ) || exit; ?>
<main class="container legal-main wp-page-main" id="main">
<?php while ( have_posts() ) : the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'wp-page-content' ); ?>>
        <p class="eyebrow"><?php echo esc_html( omega_theme_contact( 'brand' ) ); ?></p>
        <h1><?php the_title(); ?></h1>
        <div class="entry-content"><?php the_content(); ?></div>
        <?php wp_link_pages(); ?>
    </article>
<?php endwhile; ?>
</main>
