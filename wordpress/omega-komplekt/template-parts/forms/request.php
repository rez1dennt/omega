<?php defined( 'ABSPATH' ) || exit; ?>
<form class="request-form" id="request-form" data-endpoint="<?php echo esc_url( omega_theme_request_settings()['endpoint'] ); ?>" novalidate>
      <div class="request-error-summary" role="alert" hidden></div>
      <p class="request-required">Поля со <span>*</span> обязательны</p>
      <div class="request-field">
        <label for="request-parameters">Параметры заказа <span>*</span></label>
        <textarea id="request-parameters" name="parameters" maxlength="3000" rows="3" required autofocus aria-describedby="request-parameters-help request-parameters-error" placeholder="Например: полотно 27 × 2450 мм, 4/6 TPI, сталь, 2 шт."></textarea>
        <p class="request-help" id="request-parameters-help">Укажите размеры и количество или опишите задачу — поможем подобрать полотно.</p>
        <p class="field-error" id="request-parameters-error" hidden></p>
      </div>
      <div class="request-row">
        <div class="request-field">
          <label for="request-email">E-mail <span>*</span></label>
          <input id="request-email" name="email" type="email" maxlength="254" inputmode="email" autocomplete="email" required aria-describedby="request-email-error" placeholder="Ваш e-mail">
          <p class="field-error" id="request-email-error" hidden></p>
        </div>
        <div class="request-field">
          <label for="request-phone">Телефон <span>*</span></label>
          <input id="request-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="24" aria-describedby="request-phone-error" placeholder="+7 (___) ___-__-__">
          <p class="field-error" id="request-phone-error" hidden></p>
        </div>
      </div>
      <details class="request-name-details"><summary>Добавить имя / компанию <span>необязательно</span></summary><div class="request-field">
        <label for="request-name">Имя / Компания <span class="request-optional">необязательно</span></label>
        <input id="request-name" name="name" type="text" maxlength="160" autocomplete="name" placeholder="Как к вам обращаться">
      </div></details>
      <div class="request-consent">
        <label class="consent-label"><input id="request-consent" name="consent" type="checkbox" required aria-describedby="request-consent-error"><span>Даю согласие на обработку персональных данных <span class="required-mark">*</span></span></label>
        <p class="field-error" id="request-consent-error" hidden></p>
        <details class="consent-details"><summary>Условия обработки данных</summary><p>Контакты и параметры заказа передаются ООО «Омега Комплект» для подбора полотен или оборудования и ответа на заявку. <a href="<?php echo esc_url( omega_theme_document_url( 'consent', '' ) ); ?>" target="_blank" rel="noopener">Отдельное согласие</a> · <a href="<?php echo esc_url( omega_theme_document_url( 'privacy', '' ) ); ?>" target="_blank" rel="noopener">Политика обработки данных</a>.</p></details>
      </div>
      <div class="visually-hidden" aria-hidden="true"><label for="request-website">Не заполняйте это поле</label><input id="request-website" name="website" type="text" tabindex="-1" autocomplete="off"></div><button class="button request-submit" type="submit" disabled data-workflow-submit><span class="request-submit-label">Отправить заявку</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
      <p class="request-note"><svg class="icon" aria-hidden="true"><use href="#i-lock"/></svg>Контакты используем только для ответа по заявке.</p>
      <p class="request-status" role="status" hidden></p>
    <noscript><p class="request-status">Для оформления заказа позвоните <a href="<?php echo esc_url( 'tel:' . omega_theme_contact( 'phone_uri' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'phone' ) ); ?></a> или напишите <a href="<?php echo esc_url( 'mailto:' . omega_theme_contact( 'email' ) ); ?>"><?php echo esc_html( omega_theme_contact( 'email' ) ); ?></a>.</p></noscript>
</form>
