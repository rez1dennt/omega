<?php
defined( 'ABSPATH' ) || exit;

function omega_site_settings_has_acf_pro(): bool {
    return function_exists( 'acf_add_options_page' ) && function_exists( 'acf_add_local_field_group' ) && function_exists( 'get_field' );
}

function omega_site_settings_admin_pages(): void {
    if ( ! omega_site_settings_has_acf_pro() ) {
        return;
    }
    foreach ( omega_site_settings_schema() as $section => $definition ) {
        $slug = omega_site_settings_page_slug( $section );
        acf_add_options_page( array(
            'page_title' => 'Настройка сайта — ' . ( $definition['title'] ?? $section ),
            'menu_title' => 'omega-site-settings' === $slug ? 'Настройка сайта' : ( $definition['title'] ?? $section ),
            'menu_slug' => $slug,
            'parent_slug' => 'omega-site-settings' === $slug ? '' : 'omega-site-settings',
            'post_id' => OMEGA_SITE_SETTINGS_POST_ID,
            'capability' => 'manage_options',
            'position' => '61.5',
            'icon_url' => 'dashicons-admin-customizer',
            'redirect' => false,
            'autoload' => false,
            'update_button' => 'Сохранить раздел',
            'updated_message' => 'Раздел сохранён. Изменения уже доступны на сайте.',
        ) );
    }
}
add_action( 'acf/init', 'omega_site_settings_admin_pages', 20 );

function omega_site_settings_compact_menu(): void {
    // Keep native registrations: WordPress resolves child-page hooks and permissions from $submenu.
    // Removing every child makes its registered ACF callback inaccessible (HTTP 403).
    echo '<style>#toplevel_page_omega-site-settings .wp-submenu{display:none!important}</style>';
}
add_action( 'admin_head', 'omega_site_settings_compact_menu' );

function omega_site_settings_current_section(): string {
    $page = isset( $_GET['page'] ) && is_string( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
    foreach ( omega_site_settings_schema() as $section => $definition ) {
        if ( omega_site_settings_page_slug( $section ) === $page ) {
            return $section;
        }
    }
    return '';
}

function omega_site_settings_body_class( string $classes ): string {
    return omega_site_settings_current_section() ? $classes . ' omega-site-settings-admin' : $classes;
}
add_filter( 'admin_body_class', 'omega_site_settings_body_class' );

/** Navigation groups do not alter the registered pages or their saved field keys. */
function omega_site_settings_navigation_groups( array $schema ): array {
    $groups = array(
        'company'   => array( 'title' => 'Компания', 'sections' => array( 'company', 'branding', 'contacts' ) ),
        'pages'     => array( 'title' => 'Страницы сайта', 'sections' => array( 'layout_header', 'hero', 'advantages', 'production', 'equipment', 'delivery', 'layout_footer' ) ),
        'requests'  => array( 'title' => 'Заявки', 'sections' => array( 'request', 'order', 'selection', 'overlays' ) ),
        'pitch'     => array( 'title' => 'Подбор шага', 'sections' => array( 'pitch_ui', 'pitch_omega' ) ),
        'documents' => array( 'title' => 'Документы и cookie', 'sections' => array( 'document_privacy', 'document_consent', 'cookies' ) ),
        'advanced'  => array( 'title' => 'Дополнительно', 'sections' => array( 'links', 'icons', 'decor', 'runtime', 'pitch_data', 'pitch_bahco', 'system' ) ),
    );
    $assigned = array();
    foreach ( $groups as $key => &$group ) {
        $group['sections'] = array_values( array_intersect( $group['sections'], array_keys( $schema ) ) );
        $assigned = array_merge( $assigned, $group['sections'] );
        if ( ! $group['sections'] ) {
            unset( $groups[ $key ] );
        }
    }
    unset( $group );
    $remaining = array_diff( array_keys( $schema ), $assigned );
    if ( $remaining ) {
        if ( ! isset( $groups['advanced'] ) ) {
            $groups['advanced'] = array( 'title' => 'Дополнительно', 'sections' => array() );
        }
        $groups['advanced']['sections'] = array_merge( $groups['advanced']['sections'], $remaining );
    }
    return $groups;
}

function omega_site_settings_admin_notice(): void {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }
    if ( ! omega_site_settings_has_acf_pro() ) {
        echo '<div class="notice notice-warning"><p><strong>Настройка сайта.</strong> Для редактирования и первичного заполнения нужен активный ACF PRO. Сохранённый контент сайта продолжает работать. ACF PRO устанавливается отдельно; лицензия не входит в этот плагин.</p></div>';
        return;
    }
    $current = omega_site_settings_current_section();
    if ( ! $current ) {
        return;
    }
    $schema = omega_site_settings_schema();
    $groups = omega_site_settings_navigation_groups( $schema );
    $current_group = '';
    foreach ( $groups as $group_key => $group ) {
        if ( in_array( $current, $group['sections'], true ) ) {
            $current_group = $group_key;
            break;
        }
    }
    ?>
    <div class="omega-settings-intro">
        <nav class="omega-settings-nav" aria-label="Навигация по настройкам сайта">
            <p class="omega-nav-heading">Выберите, что хотите изменить</p>
            <div class="omega-nav-groups" aria-label="Категории настроек">
                <?php foreach ( $groups as $group_key => $group ) : ?>
                    <a class="omega-nav-group<?php echo $current_group === $group_key ? ' is-active' : ''; ?>" href="<?php echo esc_url( admin_url( 'admin.php?page=' . omega_site_settings_page_slug( $group['sections'][0] ) ) ); ?>"<?php echo $current_group === $group_key ? ' aria-current="true"' : ''; ?>><?php echo esc_html( $group['title'] ); ?></a>
                <?php endforeach; ?>
            </div>
            <?php if ( isset( $groups[ $current_group ] ) ) : ?>
                <div class="omega-nav-sections" aria-label="Разделы выбранной категории">
                    <span class="omega-nav-sections-label"><?php echo esc_html( $groups[ $current_group ]['title'] ); ?>:</span>
                    <?php foreach ( $groups[ $current_group ]['sections'] as $section ) : ?>
                        <a class="omega-nav-section<?php echo $current === $section ? ' is-active' : ''; ?>" href="<?php echo esc_url( admin_url( 'admin.php?page=' . omega_site_settings_page_slug( $section ) ) ); ?>"<?php echo $current === $section ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $schema[ $section ]['title'] ?? $section ); ?></a>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </nav>
        <p>Редактируйте нужный раздел и нажмите «Сохранить раздел». Каждый раздел сохраняется отдельно. Изображения выбираются из медиатеки; пустое сохранённое поле остаётся пустым. <a href="<?php echo esc_url( home_url( '/' ) ); ?>" target="_blank" rel="noopener">Открыть сайт ↗</a></p>
        <details class="omega-settings-guide">
            <summary>Как изменять сайт</summary>
            <ol>
                <li>Выберите категорию, затем нужный раздел: например, «Страницы сайта» → «Первый экран» или «Компания» → «Контакты и карта».</li>
                <li>Измените текст в подписанном поле. Для фотографии нажмите на карандаш или «Добавить изображение» и выберите файл в медиатеке.</li>
                <li>Нажмите «Сохранить раздел» справа и обновите открытую страницу сайта. Перед переходом в другой раздел сохраните правки.</li>
            </ol>
            <p>Общие телефоны, почта и реквизиты меняются в разделе «Компания и реквизиты». Иконки можно выбрать из готовых или заменить своим изображением. Тексты документов редактируются визуально, а таблицы — обычными ячейками. Поиск ниже найдёт поле в открытом разделе.</p>
        </details>
        <div class="omega-settings-search" role="search" aria-label="Поиск полей текущего раздела">
            <label for="omega-settings-search">Найти поле в этом разделе</label>
            <input type="search" id="omega-settings-search" placeholder="Например, заголовок или изображение" autocomplete="off" aria-describedby="omega-settings-search-status" aria-controls="omega-settings-search-results">
            <p class="description" id="omega-settings-search-status" role="status" aria-live="polite">Поиск по названиям полей. Выберите результат, чтобы перейти к нему.</p>
            <ol id="omega-settings-search-results" hidden></ol>
        </div>
        <details class="omega-settings-migration">
            <summary>Первичное заполнение текущим контентом</summary>
            <p>Кнопка заполнит только недостающие поля всех разделов и добавит исходные изображения в медиатеку. Сохранённые изменения, очищенные поля и выбранные файлы останутся прежними. Повторное заполнение не создаёт копии уже импортированных изображений.</p>
            <p><button type="button" class="button button-secondary" id="omega-settings-seed">Заполнить текущим контентом</button></p>
            <p id="omega-settings-seed-status" role="status" aria-live="polite"></p>
            <progress id="omega-settings-seed-progress" value="0" max="<?php echo esc_attr( count( omega_site_settings_schema() ) ); ?>" hidden></progress>
        </details>
    </div>
    <?php
}
add_action( 'admin_notices', 'omega_site_settings_admin_notice' );

function omega_site_settings_admin_assets(): void {
    if ( ! omega_site_settings_current_section() || ! current_user_can( 'manage_options' ) || ! omega_site_settings_has_acf_pro() ) {
        return;
    }
    $base = OMEGA_SITE_SETTINGS_DIR . '/assets/';
    wp_enqueue_style( 'omega-site-settings-admin', plugins_url( 'assets/admin.css', OMEGA_SITE_SETTINGS_FILE ), array(), (string) filemtime( $base . 'admin.css' ) );
    wp_enqueue_script( 'omega-site-settings-admin', plugins_url( 'assets/admin.js', OMEGA_SITE_SETTINGS_FILE ), array( 'acf-input' ), (string) filemtime( $base . 'admin.js' ), true );
    $sections = array();
    foreach ( omega_site_settings_schema() as $section => $definition ) {
        $sections[] = array( 'id' => $section, 'title' => $definition['title'] ?? $section );
    }
    $config = array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce( 'omega_site_settings_seed' ),
        'sections' => $sections,
        'icons' => omega_site_settings_icon_names(),
        'strings' => array(
            'unsaved' => 'Сначала сохраните изменения текущего раздела, затем запустите заполнение.',
            'working' => 'Заполняем раздел {current} из {total}: {title}…',
            'complete' => 'Все разделы заполнены. Обновляем поля…',
            'failed' => 'Заполнение остановлено. Уже сохранённые разделы доступны; повторный запуск продолжит заполнение недостающих полей.',
            'network' => 'Нет ответа сервера. Проверьте соединение и повторите заполнение.',
            'searchHint' => 'Поиск по названиям полей. Выберите результат, чтобы перейти к нему.',
            'searchEmpty' => 'Полей с таким названием не найдено. Попробуйте другое слово.',
            'searchCount' => 'Найдено: {count}. Выберите результат, чтобы перейти к полю.',
            'searchLimited' => 'Найдено: {count}. Показаны первые {shown}; уточните запрос, если нужного поля нет в списке.',
            'iconPreview' => 'Готовая иконка: {name}',
        ),
    );
    wp_add_inline_script( 'omega-site-settings-admin', 'window.OmegaSiteSettingsAdmin = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );
}
add_action( 'admin_enqueue_scripts', 'omega_site_settings_admin_assets' );

function omega_site_settings_icon_names(): array {
    return array( 'arrow' => 'Стрелка', 'chevron' => 'Раскрытие списка', 'phone' => 'Телефон', 'mail' => 'Почта', 'shield' => 'Щит', 'check' => 'Галочка', 'play' => 'Воспроизведение', 'lock' => 'Защита данных', 'pin' => 'Метка карты', 'close' => 'Закрытие окна', 'menu' => 'Меню' );
}

function omega_site_settings_icon_preview( array $field ): void {
    if ( ! current_user_can( 'manage_options' ) || ! omega_site_settings_current_section() || ! preg_match( '/^field_omega_icons__.+__symbol$/D', $field['key'] ?? '' ) ) {
        return;
    }
    $names = omega_site_settings_icon_names();
    $value = $field['value'] ?? $field['default_value'] ?? 'arrow';
    $value = is_string( $value ) && isset( $names[ $value ] ) ? $value : 'arrow';
    echo '<div class="omega-icon-preview" data-omega-icon-preview><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><use width="40" height="40" href="' . esc_attr( '#i-' . $value ) . '"></use></svg><span>' . esc_html( 'Готовая иконка: ' . $names[ $value ] ) . '</span></div>';
}
add_action( 'acf/render_field/type=select', 'omega_site_settings_icon_preview', 20 );

function omega_site_settings_admin_sprite(): void {
    if ( ! current_user_can( 'manage_options' ) || ! omega_site_settings_current_section() ) {
        return;
    }
    $sprite = get_theme_file_path( '/template-parts/shared/sprite.php' );
    if ( is_file( $sprite ) ) {
        include $sprite;
    }
}
add_action( 'admin_footer', 'omega_site_settings_admin_sprite' );

function omega_site_settings_ajax_seed(): void {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( array( 'message' => 'Недостаточно прав для заполнения настроек.' ), 403 );
        return;
    }
    if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
        wp_send_json_error( array( 'message' => 'Используйте кнопку заполнения в настройках сайта.' ), 405 );
        return;
    }
    if ( ! isset( $_POST['nonce'] ) || ! is_string( $_POST['nonce'] ) || ! check_ajax_referer( 'omega_site_settings_seed', 'nonce', false ) ) {
        wp_send_json_error( array( 'message' => 'Срок действия страницы истёк. Обновите её и повторите заполнение.' ), 403 );
        return;
    }
    $section = isset( $_POST['section'] ) && is_string( $_POST['section'] ) ? sanitize_key( wp_unslash( $_POST['section'] ) ) : '';
    try {
        $result = omega_site_settings_seed_section( $section );
    } catch ( Throwable $error ) {
        wp_send_json_error( array( 'message' => 'Заполнение прервано из-за ошибки сервера. Проверьте журнал WordPress и повторите: существующие значения не сбрасываются.' ), 500 );
        return;
    }
    if ( is_wp_error( $result ) ) {
        wp_send_json_error( array( 'message' => $result->get_error_message(), 'code' => $result->get_error_code() ), 400 );
        return;
    }
    wp_send_json_success( $result );
}
add_action( 'wp_ajax_omega_site_settings_seed_section', 'omega_site_settings_ajax_seed' );
