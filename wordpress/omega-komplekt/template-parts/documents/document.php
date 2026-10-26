<?php
defined( 'ABSPATH' ) || exit;
$kind = $args['kind'] ?? 'privacy';
if ( ! in_array( $kind, array( 'privacy', 'consent' ), true ) ) { return; }
$all = json_decode( (string) file_get_contents( get_parent_theme_file_path( '/data/documents.json' ) ), true );
$original = $all[ $kind ];
$document = omega_theme_settings( 'document_' . $kind, $original );
$sections = is_array( $document['sections'] ?? null ) ? $document['sections'] : array();
$anchors = omega_theme_document_anchors( $sections, $original['sections'] );
?>
<main class="container legal-main" id="main">
  <p class="eyebrow"><?php echo esc_html( $document['eyebrow'] ); ?></p>
  <h1><?php echo esc_html( $document['title'] ); ?></h1>
  <p class="legal-meta"><?php echo esc_html( $document['revision'] ); ?></p>
  <p class="legal-lead"><?php echo esc_html( omega_theme_bind_company( $document['lead'] ) ); ?></p>
  <div class="legal-facts">
    <span><strong><?php echo esc_html( $document['operator_label'] ?? 'Оператор' ); ?>:</strong> <?php echo esc_html( omega_theme_contact( 'name' ) ); ?></span>
    <span><strong><?php echo esc_html( $document['inn_label'] ?? 'ИНН' ); ?>:</strong> <?php echo esc_html( omega_theme_contact( 'inn' ) ); ?> · <strong><?php echo esc_html( $document['ogrn_label'] ?? 'ОГРН' ); ?>:</strong> <?php echo esc_html( omega_theme_contact( 'ogrn' ) ); ?></span>
    <span><strong><?php echo esc_html( $document['address_label'] ?? 'Адрес' ); ?>:</strong> <?php echo esc_html( omega_theme_contact( 'address' ) ); ?></span>
    <span><strong><?php echo esc_html( $document['email_label'] ?? 'E-mail' ); ?>:</strong> <a href="<?php echo esc_url( 'mailto:' . omega_theme_contact( 'email' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'email' ) ); ?></a></span>
  </div>
  <nav class="legal-toc" aria-label="<?php echo esc_attr( $document['toc_title'] ); ?>"><strong><?php echo esc_html( $document['toc_title'] ); ?></strong>
    <?php foreach ( $sections as $index => $section ) : $anchor = $anchors[ $index ] ?? 'section-' . ( $index + 1 ); ?>
      <a href="#<?php echo esc_attr( $anchor ); ?>"><?php echo esc_html( $section['heading'] ?? '' ); ?></a>
    <?php endforeach; ?>
  </nav>
  <article class="legal-content">
    <?php foreach ( $sections as $index => $section ) : $anchor = $anchors[ $index ] ?? 'section-' . ( $index + 1 ); ?>
      <section id="<?php echo esc_attr( $anchor ); ?>"><h2><?php echo esc_html( $section['heading'] ?? '' ); ?></h2><?php echo omega_theme_rich( (string) ( $section['body'] ?? '' ) ); ?><?php if ( 'cookies' === $anchor ) : ?><button class="cookie-reopen" type="button" data-cookie-settings><?php echo omega_theme_copy( 'document_privacy', 'cookie_button', 'Настройки cookie' ); ?></button><?php endif; ?></section>
    <?php endforeach; ?>
  </article>
</main>
