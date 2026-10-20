<?php defined( 'ABSPATH' ) || exit; ?>
<?php $content = $args['content'] ?? omega_theme_content( 'hero' ); ?>
<section class="hero dark-section" id="products" aria-labelledby="hero-title">
      <img class="hero-photo" src="<?php echo esc_url( omega_theme_media( $content['image_1'] ) ); ?>" width="1672" height="941" alt="Стальные ленточные полотна крупным планом" fetchpriority="high">
      <div class="hero-shade" aria-hidden="true"></div>
      <svg class="hero-lines decorative" viewBox="0 0 926 445" preserveAspectRatio="none" aria-hidden="true"><path d="M515-30C493 80 355 141 390 285C402 350 440 352 448 466"/><path class="line-neutral" d="M546-30C510 98 462 178 475 252C474 369 511 390 523 461"/><path d="M820 60C780 111 754 139 751 203C746 226 726 236 701 254"/><path d="M718 194C709 231 684 247 660 268"/><path d="m912 164-89 65"/></svg>
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow"><?php echo esc_html( $content['eyebrow_1'] ); ?></p>
          <h1 id="hero-title"><?php echo esc_html( $content['heading_1'] ); ?><br><?php echo esc_html( $content['heading_2'] ); ?><br><span><?php echo esc_html( $content['label_1'] ); ?></span></h1>
          <p class="hero-description"><?php echo esc_html( $content['paragraph_1'] ); ?></p>
          <div class="hero-actions"><a class="button" href="#request-dialog" data-dialog="request-dialog"><?php echo esc_html( $content['request_label'] ); ?><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a><a class="button button-outline" href="#selection-dialog" data-dialog="selection-dialog"><?php echo esc_html( $content['label_2'] ); ?><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div><a class="learn-link hero-learn" href="#order"><svg class="icon" aria-hidden="true"><use href="#i-play"/></svg><span><?php echo esc_html( $content['label_3'] ); ?></span></a>
          <div class="hero-facts"><p><strong><?php echo esc_html( $content['label_4'] ); ?></strong><span><?php echo esc_html( $content['label_5'] ); ?></span></p><p><strong><?php echo esc_html( $content['label_6'] ); ?></strong><span><?php echo esc_html( $content['label_7'] ); ?></span></p></div>
        </div>
        <div class="material-label"><span><?php echo esc_html( $content['label_8'] ); ?></span><strong><?php echo esc_html( $content['label_9'] ); ?><br><?php echo esc_html( $content['label_10'] ); ?></strong></div>
      </div>
      <svg class="hero-wave decorative" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 68C570 98 1140 130 1440 12V110H0Z"/></svg>
    </section>
