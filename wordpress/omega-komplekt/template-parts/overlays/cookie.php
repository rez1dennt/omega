<?php defined( 'ABSPATH' ) || exit; ?>
<aside class="cookie-banner" id="cookie-banner" aria-labelledby="cookie-title" hidden>
  <div class="cookie-copy"><strong id="cookie-title">Cookie и сервисы сайта</strong><p>Сохраняем ваши настройки. В контактах встроены Яндекс Карты. <a href="<?php echo esc_url( omega_theme_document_url( 'privacy', 'cookies' ) ); ?>">Подробнее</a></p></div>
  <div class="cookie-actions"><button class="button" type="button" data-cookie-save>Понятно</button><button class="cookie-secondary" type="button" data-cookie-settings>Настройки</button></div>
</aside>
<dialog class="info-dialog cookie-settings" id="cookie-settings" aria-labelledby="cookie-settings-title">
  <button class="dialog-close" type="button" data-close-dialog aria-label="Закрыть настройки cookie"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
  <p class="eyebrow">ВАШИ НАСТРОЙКИ</p><h2 id="cookie-settings-title">Cookie и данные браузера</h2>
  <div class="cookie-category"><div><h3>Необходимые</h3><span>Всегда включены</span></div><p>Одна запись с вашим выбором хранится только в этом браузере до 180 дней. Она не содержит имени, телефона, e-mail или рекламного идентификатора.</p></div>
  <div class="cookie-category"><div><h3>Аналитика сайта</h3><span>Не подключена</span></div><p>В коде сайта нет собственных счётчиков посещений и рекламных пикселей.</p></div><div class="cookie-category"><div><h3>Яндекс Карты</h3><span>Внешний сервис</span></div><p>Карта в контактах загружается с сервиса Яндекса. Обработка технических данных и cookie виджета регулируется <a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer">политикой Яндекса</a>. Данные из форм заявки в карту не передаются.</p></div>
  <p class="cookie-platform-note">Эти настройки относятся к коду сайта. Cookie платформы размещения и авторизации управляются её собственными настройками.</p>
  <a class="text-link" href="<?php echo esc_url( omega_theme_document_url( 'privacy', 'cookies' ) ); ?>" target="_blank" rel="noopener">О cookie в политике</a>
  <div class="cookie-settings-actions"><button class="button" type="button" data-cookie-save>Сохранить настройки</button><button class="cookie-clear" type="button" data-cookie-clear>Удалить сохранённый выбор</button></div>
</dialog>
