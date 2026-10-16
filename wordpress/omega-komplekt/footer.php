<?php
defined( 'ABSPATH' ) || exit;
if ( omega_theme_is_front() ) {
    get_template_part( 'template-parts/shared/footer' );
    get_template_part( 'template-parts/overlays/dialogs' );
} else {
    get_template_part( 'template-parts/shared/footer', 'compact' );
}
get_template_part( 'template-parts/overlays/cookie' );
wp_footer();
?>
</body>
</html>
