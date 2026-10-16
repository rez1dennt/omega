<?php defined( 'ABSPATH' ) || exit; ?>
<?php $content = $args['content'] ?? omega_theme_content( 'order' ); ?>
<section class="order-section dark-section" id="order" aria-labelledby="order-title">
      <div class="order-background" aria-hidden="true"><img src="<?php echo esc_url( omega_theme_media( $content['image_1'] ) ); ?>" width="1672" height="941" alt="" loading="lazy"></div>
      <svg class="order-lines decorative" viewBox="0 0 1440 410" preserveAspectRatio="none" aria-hidden="true"><path d="M1280-70C1122 100 1125 241 1021 469"/><path class="line-neutral" d="M1305-20C1197 117 1158 288 1092 425"/></svg>
      <div class="container order-grid"><div class="order-copy"><p class="eyebrow"><?php echo esc_html( $content['eyebrow_1'] ); ?></p><h2 id="order-title"><?php echo esc_html( $content['heading_1'] ); ?><br><?php echo esc_html( $content['heading_2'] ); ?><br><?php echo esc_html( $content['heading_3'] ); ?> <span><?php echo esc_html( $content['label_1'] ); ?></span></h2><p><?php echo esc_html( $content['paragraph_1'] ); ?></p><a class="text-link order-pitch-link" href="#pitch-guide"><?php echo esc_html( $content['label_2'] ); ?><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
        <?php get_template_part( 'template-parts/forms/order', null, array( 'content' => $content ?? array() ) ); ?>
      </div><svg class="order-wave decorative" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6C487 99 1071 44 1358 58L1440 6V110H0Z"/></svg>
    </section>
