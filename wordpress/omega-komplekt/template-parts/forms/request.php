<?php defined( 'ABSPATH' ) || exit; ?>
<form class="request-form" id="request-form" data-endpoint="<?php echo esc_url( omega_theme_request_settings()['endpoint'] ); ?>" novalidate>
      <div class="request-error-summary" role="alert" hidden></div>
      <p class="request-required"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_003', 'Поля со' ); ?> <span>*</span> <?php echo omega_theme_copy( 'request', 'request_65e22b_text_004', 'обязательны' ); ?></p>
      <div class="request-field">
        <label for="request-parameters"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_005', 'Параметры заказа' ); ?> <span>*</span></label>
        <textarea id="request-parameters" name="parameters" maxlength="3000" rows="3" required autofocus aria-describedby="request-parameters-help request-parameters-error" placeholder="<?php echo omega_theme_attr( 'request', 'request_65e22b_attribute_006', 'Например: полотно 27 × 2450 мм, 4/6 TPI, сталь, 2 шт.' ); ?>"></textarea>
        <p class="request-help" id="request-parameters-help"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_007', 'Укажите размеры и количество или опишите задачу — поможем подобрать полотно.' ); ?></p>
        <p class="field-error" id="request-parameters-error" hidden></p>
      </div>
      <div class="request-row">
        <div class="request-field">
          <label for="request-email"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_008', 'E-mail' ); ?> <span>*</span></label>
          <input id="request-email" name="email" type="email" maxlength="254" inputmode="email" autocomplete="email" required aria-describedby="request-email-error" placeholder="<?php echo omega_theme_attr( 'request', 'request_65e22b_attribute_009', 'Ваш e-mail' ); ?>">
          <p class="field-error" id="request-email-error" hidden></p>
        </div>
        <div class="request-field">
          <label for="request-phone"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_010', 'Телефон' ); ?> <span>*</span></label>
          <input id="request-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="24" aria-describedby="request-phone-error" placeholder="<?php echo omega_theme_attr( 'request', 'request_65e22b_attribute_011', '+7 (___) ___-__-__' ); ?>">
          <p class="field-error" id="request-phone-error" hidden></p>
        </div>
      </div>
      <details class="request-name-details"><summary><?php echo omega_theme_copy( 'request', 'request_65e22b_text_012', 'Добавить имя / компанию' ); ?> <span><?php echo omega_theme_copy( 'request', 'request_65e22b_text_013', 'необязательно' ); ?></span></summary><div class="request-field">
        <label for="request-name"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_014', 'Имя / Компания' ); ?> <span class="request-optional"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_015', 'необязательно' ); ?></span></label>
        <input id="request-name" name="name" type="text" maxlength="160" autocomplete="name" placeholder="<?php echo omega_theme_attr( 'request', 'request_65e22b_attribute_016', 'Как к вам обращаться' ); ?>">
      </div></details>
      <div class="request-consent">
        <label class="consent-label"><input id="request-consent" name="consent" type="checkbox" required aria-describedby="request-consent-error"><span><?php echo omega_theme_copy( 'request', 'request_65e22b_text_017', 'Даю согласие на обработку персональных данных' ); ?> <span class="required-mark">*</span></span></label>
        <p class="field-error" id="request-consent-error" hidden></p>
        <details class="consent-details"><summary><?php echo omega_theme_copy( 'request', 'request_65e22b_text_018', 'Условия обработки данных' ); ?></summary><p><?php echo omega_theme_copy( 'request', 'request_65e22b_text_019', 'Контакты и параметры заказа передаются ООО «Омега Комплект» для подбора полотен или оборудования и ответа на заявку.' ); ?> <a href="<?php echo esc_url( omega_theme_document_url( 'consent', '' ) ); ?>" target="_blank" rel="noopener"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_020', 'Отдельное согласие' ); ?></a> · <a href="<?php echo esc_url( omega_theme_document_url( 'privacy', '' ) ); ?>" target="_blank" rel="noopener"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_021', 'Политика обработки данных' ); ?></a>.</p></details>
      </div>
      <div class="visually-hidden" aria-hidden="true"><label for="request-website"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_022', 'Не заполняйте это поле' ); ?></label><input id="request-website" name="website" type="text" tabindex="-1" autocomplete="off"></div><button class="button request-submit" type="submit" disabled data-workflow-submit><span class="request-submit-label"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_023', 'Отправить заявку' ); ?></span><?php echo omega_theme_icon( 'request_65e22b_icon_001', 'arrow', 'icon' ); ?></button>
      <p class="request-note"><?php echo omega_theme_icon( 'request_65e22b_icon_002', 'lock', 'icon' ); ?><?php echo omega_theme_copy( 'request', 'request_65e22b_text_024', 'Контакты используем только для ответа по заявке.' ); ?></p>
      <p class="request-status" role="status" hidden></p>
    <noscript><p class="request-status"><?php echo omega_theme_copy( 'request', 'request_65e22b_text_025', 'Для оформления заказа позвоните' ); ?> <a href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'phone_uri' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'phone' ) ); ?></a> <?php echo omega_theme_copy( 'request', 'request_65e22b_text_026', 'или напишите' ); ?> <a href="<?php echo esc_url( 'mailto:' . omega_theme_contact( 'email' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'email' ) ); ?></a>.</p></noscript>
</form>
