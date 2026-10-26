<?php defined( 'ABSPATH' ) || exit; ?>


  <dialog class="info-dialog" id="delivery-details" aria-labelledby="delivery-details-title"><button class="dialog-close" type="button" data-close-dialog aria-label="Закрыть условия доставки"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button><p class="eyebrow"><?php echo esc_html( omega_theme_contact( 'brand' ) ); ?></p><h2 id="delivery-details-title">Доставка</h2><p>Мы упакуем, оформим документы и передадим ваш заказ любым удобным для вас способом в любой регион РФ. Способ доставки выбираете вы сами:</p><ul class="dialog-list"><li>Самовывоз с нашего склада в г. Саратов.</li><li>Доставка до предприятий г. Энгельс бесплатно — каждую среду.</li><li>Доставка по России осуществляется бесплатно до терминала ТК по будням.</li></ul><h3>Транспортные компании</h3><p>Деловые Линии · ПЭК · СДЭК · Кит · Байкал-Сервис</p><p class="dialog-highlight">При заказе на сумму от 50 000 руб. — бесплатная доставка по всей России!</p></dialog>
  <dialog class="info-dialog" id="production-details" aria-labelledby="production-details-title"><button class="dialog-close" type="button" data-close-dialog aria-label="Закрыть информацию о производстве"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button><p class="eyebrow"><?php echo esc_html( omega_theme_contact( 'brand' ) ); ?></p><h2 id="production-details-title">Наше производство</h2><p>Мы производим ленточные пилы на современном автоматизированном высокоточном оборудовании. Контролируем качество на каждом этапе, обеспечиваем максимальный ресурс и надёжность. Сварим полотно в кольцо и поможем подобрать параметры под ваш станок, материал и задачу.</p><a class="button" href="#selection-dialog" data-dialog="selection-dialog">Подобрать полотно<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></dialog>
  <dialog class="info-dialog" id="legal-dialog" aria-labelledby="legal-dialog-title"><button class="dialog-close" type="button" data-close-dialog aria-label="Закрыть документ"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button><h2 id="legal-dialog-title">Документы</h2><p>Информация на сайте носит справочный характер. Стоимость, сроки изготовления и условия заказа согласуются с менеджером. Условия обработки данных указаны в политике и отдельном согласии.</p></dialog>

  <?php get_template_part( 'template-parts/overlays/selection' ); ?>
  <dialog class="info-dialog request-dialog" id="request-dialog" aria-labelledby="request-title" aria-describedby="request-intro">
    <header class="request-heading">
      <span class="request-brand"><span class="brand-mark" aria-hidden="true"></span><span><?php echo omega_theme_wordmark(); ?></span></span>
      <button class="dialog-close" type="button" data-close-dialog aria-label="Закрыть заявку"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
      <p class="eyebrow">ПОД ВАШ СТАНОК И ЗАДАЧУ</p>
      <h2 id="request-title">Заявка на изготовление<span>.</span></h2>
      <p id="request-intro">Укажите параметры полотна и контакты для уточнения заказа.</p>
    </header>
    <?php get_template_part( 'template-parts/forms/request', null, array( 'content' => $content ?? array() ) ); ?>
  </dialog>
