<?php defined( 'ABSPATH' ) || exit; ?>
<form class="wp-search-form" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <label for="omega-search"><?php esc_html_e( 'Поиск по сайту', 'omega-komplekt' ); ?></label>
    <input type="search" name="s" id="omega-search" value="<?php echo esc_attr( get_search_query() ); ?>">
    <button class="button" type="submit"><?php esc_html_e( 'Найти', 'omega-komplekt' ); ?></button>
</form>
