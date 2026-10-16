<?php
/** Theme bootstrap. Data storage and request delivery belong to the future plugin. */
defined( 'ABSPATH' ) || exit;

foreach ( array( 'content', 'helpers', 'setup', 'documents', 'integrations', 'assets' ) as $omega_module ) {
    require_once get_parent_theme_file_path( '/inc/' . $omega_module . '.php' );
}
unset( $omega_module );
