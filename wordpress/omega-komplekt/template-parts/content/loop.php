<?php defined( 'ABSPATH' ) || exit; ?>
<?php if ( have_posts() ) : ?>
<div class="wp-entry-list">
    <?php while ( have_posts() ) : the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'wp-entry-card' ); ?>>
        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <div class="entry-content"><?php the_excerpt(); ?></div>
        <a class="text-link" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Подробнее', 'omega-komplekt' ); ?> <span aria-hidden="true">→</span></a>
    </article>
    <?php endwhile; ?>
</div>
<?php the_posts_pagination(); ?>
<?php else : ?>
    <p><?php esc_html_e( 'Материалы пока не опубликованы.', 'omega-komplekt' ); ?></p>
    <a class="text-link" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'На главную', 'omega-komplekt' ); ?> <span aria-hidden="true">→</span></a>
<?php endif; ?>
