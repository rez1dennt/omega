<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main">
<?php
$omega_sections = array( 'hero', 'advantages', 'production', 'pitch-guide', 'order', 'equipment', 'delivery', 'contacts' );
foreach ( $omega_sections as $omega_section ) {
    $omega_content = omega_theme_content( $omega_section );
    do_action( 'omega_theme_before_section', $omega_section, $omega_content );
    get_template_part( 'template-parts/sections/' . $omega_section, null, array( 'content' => $omega_content ) );
    do_action( 'omega_theme_after_section', $omega_section, $omega_content );
}
unset( $omega_sections, $omega_section, $omega_content );
?>
</main>
<?php get_footer(); ?>
