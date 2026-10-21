<?php defined( 'ABSPATH' ) || exit; ?>
<header class="site-header">
    <div class="nav-backdrop" aria-hidden="true"></div>
    <div class="container header-inner">
      <a class="brand" href="#main" aria-label="Омега Комплект — на главную"><span class="brand-mark" aria-hidden="true"></span><span><strong aria-label="<?php echo esc_attr( omega_theme_contact( 'brand' ) ); ?>"><?php echo omega_theme_wordmark(); ?></strong></span></a>
      <nav class="main-nav" id="main-nav" aria-label="Основная навигация">
        <p class="mobile-nav-label">Навигация по сайту</p>
        <a href="#production"><span>О компании</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#machines"><span>Полотна</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#equipment"><span>Оборудование</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#delivery"><span>Доставка</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#contacts"><span>Контакты</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <div class="mobile-nav-footer"><a class="nav-contact" href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'phone_uri' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'phone' ) ); ?></a><a class="nav-contact" href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'office_phone_uri' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'office_phone' ) ); ?></a><span>9:00–17:00 (МСК)</span><a class="button nav-request" href="#request-dialog" data-dialog="request-dialog">Оставить заявку<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
      </nav>
      <div class="header-phones"><a class="header-phone" href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'phone_uri' ) ); ?>"><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg><span><?php echo esc_html( omega_theme_contact( 'phone' ) ); ?></span></a><a class="header-phone header-phone-office" href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'office_phone_uri' ) ); ?>"><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg><span><?php echo esc_html( omega_theme_contact( 'office_phone' ) ); ?></span></a></div>
      <a class="button button-small header-cta" href="#request-dialog" data-dialog="request-dialog">Оставить заявку</a>
      <button class="menu-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Открыть меню"><span></span><span></span><span></span></button>
    </div>
  </header>
