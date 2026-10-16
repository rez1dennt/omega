<?php defined( 'ABSPATH' ) || exit; ?>
<?php $content = $args['content'] ?? omega_theme_content( 'delivery' ); ?>
<section class="delivery" id="delivery" aria-labelledby="delivery-title">
      <img class="delivery-photo" src="<?php echo esc_url( omega_theme_media( $content['image_1'] ) ); ?>" width="1672" height="941" alt="Грузовой автомобиль на дороге — доставка по России" loading="lazy">
      <div class="delivery-shade" aria-hidden="true"></div>
      <svg class="delivery-lines decorative" viewBox="0 0 1440 410" preserveAspectRatio="none" aria-hidden="true"><path d="M1437 0C1234 84 1223 316 1387 375"/></svg>
      <div class="delivery-route"><span><?php echo esc_html( $content['label_1'] ); ?></span><svg viewBox="0 0 180 20" aria-hidden="true"><path pathLength="1" d="M2 10h165m-7-6 7 6-7 6"/><circle cx="3" cy="10" r="2"/></svg><span><?php echo esc_html( $content['label_2'] ); ?></span></div>
      <div class="container delivery-grid">
        <div class="delivery-copy"><p class="eyebrow"><?php echo esc_html( $content['eyebrow_1'] ); ?></p><h2 id="delivery-title"><?php echo esc_html( $content['heading_1'] ); ?><br><?php echo esc_html( $content['heading_2'] ); ?></h2><p><?php echo esc_html( $content['paragraph_1'] ); ?><br><?php echo esc_html( $content['paragraph_2'] ); ?></p><ul class="delivery-mini"><li><?php echo esc_html( $content['label_3'] ); ?></li><li><?php echo esc_html( $content['label_4'] ); ?></li></ul><a class="delivery-terms" href="#delivery-details" data-dialog="delivery-details"><?php echo esc_html( $content['label_5'] ); ?><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
        <div class="delivery-offer"><span class="offer-label"><?php echo esc_html( $content['label_6'] ); ?></span><strong><?php echo esc_html( $content['label_7'] ); ?></strong><p><?php echo esc_html( $content['paragraph_3'] ); ?><br><?php echo esc_html( $content['paragraph_4'] ); ?></p><span class="delivery-offer-rule"></span><small><?php echo esc_html( $content['label_8'] ); ?><br><?php echo esc_html( $content['label_9'] ); ?></small></div>
      </div>
      <svg class="delivery-wave decorative" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90C659 25 1100 64 1380 33L1440 0V110H0Z"/></svg>
    </section>
