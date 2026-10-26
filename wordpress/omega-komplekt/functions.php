<?php
/** Theme bootstrap. The companion plugin owns content storage; request delivery stays separate. */
defined( 'ABSPATH' ) || exit;

foreach ( array( 'content', 'helpers', 'editor', 'pitch', 'setup', 'documents', 'integrations', 'assets' ) as $omega_module ) {
    require_once get_parent_theme_file_path( '/inc/' . $omega_module . '.php' );
}
unset( $omega_module );
