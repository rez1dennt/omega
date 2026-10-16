<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main class="container legal-main wp-page-main" id="main">
    <p class="eyebrow">404</p>
    <h1><?php esc_html_e( 'Страница не найдена', 'omega-komplekt' ); ?></h1>
    <p class="legal-lead"><?php esc_html_e( 'Перейдите на главную или свяжитесь с нами — поможем подобрать полотно или оборудование.', 'omega-komplekt' ); ?></p>
    <div class="wp-page-actions">
        <a class="button" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'На главную', 'omega-komplekt' ); ?></a>
        <a class="text-link" href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'phone_uri' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'phone' ) ); ?></a>
    </div>
</main>
<?php get_footer(); ?>
