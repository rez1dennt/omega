<?php defined( 'ABSPATH' ) || exit; ?>
<?php $content = omega_theme_content( 'selection' ); ?>
  <dialog class="info-dialog selection-dialog" id="selection-dialog" aria-labelledby="selection-title" aria-describedby="selection-intro">
    <header class="selection-heading"><div><p class="eyebrow"><?php echo esc_html( $content['eyebrow'] ); ?></p><h2 id="selection-title"><?php echo esc_html( $content['title'] ); ?><span>.</span></h2><p id="selection-intro"><?php echo esc_html( $content['intro'] ); ?></p></div><button class="dialog-close" type="button" data-close-dialog aria-label="Закрыть подбор полотна"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button></header>
    <div class="selection-body"><details class="selection-guide"><summary><span><?php echo esc_html( $content['table_label'] ); ?> <small><?php echo esc_html( $content['table_hint'] ); ?></small></span><svg class="icon" aria-hidden="true"><use href="#i-chevron"/></svg></summary><div id="selection-pitch-slot" class="selection-pitch-slot is-ready"></div></details><div id="selection-form-slot" class="selection-form-slot dark-section"></div></div>
  </dialog>
