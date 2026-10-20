<?php defined( 'ABSPATH' ) || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main"><?php esc_html_e( 'Перейти к содержимому', 'omega-komplekt' ); ?></a>
<?php get_template_part( 'template-parts/shared/sprite' ); ?>
<?php if ( omega_theme_is_front() ) : ?>
    <?php get_template_part( 'template-parts/shared/header' ); ?>
<?php else : ?>
<header class="site-header"><div class="container header-inner">
    <a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( omega_theme_contact( 'name' ) . ' — на главную' ); ?>"><span class="brand-mark" aria-hidden="true"></span><strong aria-label="<?php echo esc_attr( omega_theme_contact( 'brand' ) ); ?>"><?php echo omega_theme_wordmark(); ?></strong></a>
    <a class="legal-return" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'На сайт', 'omega-komplekt' ); ?> <span aria-hidden="true">→</span></a>
</div></header>
<?php endif; ?>
