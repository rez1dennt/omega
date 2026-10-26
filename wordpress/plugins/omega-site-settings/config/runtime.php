<?php
defined( 'ABSPATH' ) || exit;

/** Public interface copy only; transport and validation rules remain in code. */
return array(
    'runtime' => array(
        'title'  => 'Сообщения и доступность',
        'fields' => array(
            'request' => array(
                'type'   => 'group',
                'label'  => 'Заявки',
                'fields' => array(
                    'order_width_template' => array(
                        'label'   => 'Ширина в тексте заявки — подстановка {value}',
                        'type'    => 'text',
                        'default' => 'Ширина полотна: {value} мм',
                    ),
                    'order_length_template' => array(
                        'label'   => 'Длина в тексте заявки — подстановка {value}',
                        'type'    => 'text',
                        'default' => 'Длина полотна: {value} мм',
                    ),
                    'order_tpi_template' => array(
                        'label'   => 'Шаг зуба в тексте заявки — подстановка {value}',
                        'type'    => 'text',
                        'default' => 'Шаг зуба: {value}',
                    ),
                    'order_material_template' => array(
                        'label'   => 'Материал в тексте заявки — подстановка {value}',
                        'type'    => 'text',
                        'default' => 'Материал: {value}',
                    ),
                    'error_parameters_required' => array(
                        'label'   => 'Ошибка: параметры заказа не заполнены',
                        'type'    => 'text',
                        'default' => 'Укажите размеры или опишите задачу.',
                    ),
                    'error_parameters_length' => array(
                        'label'   => 'Ошибка: описание длиннее 3000 символов',
                        'type'    => 'text',
                        'default' => 'Сократите описание до 3000 символов.',
                    ),
                    'error_email_required' => array(
                        'label'   => 'Ошибка: электронная почта не заполнена',
                        'type'    => 'text',
                        'default' => 'Укажите e-mail для ответа.',
                    ),
                    'error_email_invalid' => array(
                        'label'   => 'Ошибка: неверная электронная почта',
                        'type'    => 'text',
                        'default' => 'Проверьте e-mail: например, name@example.ru.',
                    ),
                    'error_phone_required' => array(
                        'label'   => 'Ошибка: телефон не заполнен',
                        'type'    => 'text',
                        'default' => 'Укажите номер телефона.',
                    ),
                    'error_phone_invalid' => array(
                        'label'   => 'Ошибка: неверный или неполный телефон',
                        'type'    => 'text',
                        'default' => 'Введите номер полностью: +7 и 10 цифр.',
                    ),
                    'error_name_length' => array(
                        'label'   => 'Ошибка: имя или компания длиннее 160 символов',
                        'type'    => 'text',
                        'default' => 'Имя или компания — до 160 символов.',
                    ),
                    'error_consent' => array(
                        'label'   => 'Ошибка: согласие не подтверждено',
                        'type'    => 'text',
                        'default' => 'Отметьте согласие на обработку данных.',
                    ),
                    'error_dimension' => array(
                        'label'   => 'Ошибка: неверная ширина или длина полотна',
                        'type'    => 'text',
                        'default' => 'Укажите число не меньше 1 мм.',
                    ),
                    'summary_title' => array(
                        'label'   => 'Заголовок общего списка ошибок',
                        'type'    => 'text',
                        'default' => 'Заявка пока не отправлена',
                    ),
                    'summary_hint' => array(
                        'label'   => 'Подсказка перед списком полей с ошибками',
                        'type'    => 'text',
                        'default' => 'Исправьте поля:',
                    ),
                    'field_parameters' => array(
                        'label'   => 'Параметры заказа в списке ошибок',
                        'type'    => 'text',
                        'default' => 'Параметры заказа',
                    ),
                    'field_width' => array(
                        'label'   => 'Ширина полотна в списке ошибок',
                        'type'    => 'text',
                        'default' => 'Ширина полотна',
                    ),
                    'field_length' => array(
                        'label'   => 'Длина полотна в списке ошибок',
                        'type'    => 'text',
                        'default' => 'Длина полотна',
                    ),
                    'field_email' => array(
                        'label'   => 'Электронная почта в списке ошибок',
                        'type'    => 'text',
                        'default' => 'E-mail',
                    ),
                    'field_phone' => array(
                        'label'   => 'Телефон в списке ошибок',
                        'type'    => 'text',
                        'default' => 'Телефон',
                    ),
                    'field_name' => array(
                        'label'   => 'Имя или компания в списке ошибок',
                        'type'    => 'text',
                        'default' => 'Имя / Компания',
                    ),
                    'field_consent' => array(
                        'label'   => 'Согласие в списке ошибок',
                        'type'    => 'text',
                        'default' => 'Согласие',
                    ),
                    'submitting' => array(
                        'label'   => 'Кнопка во время отправки',
                        'type'    => 'text',
                        'default' => 'Отправляем…',
                    ),
                    'success' => array(
                        'label'   => 'Сообщение об успешной отправке',
                        'type'    => 'textarea',
                        'default' => 'Заявка отправлена. Спасибо! Свяжемся с вами по указанным контактам.',
                    ),
                    'rate_limited' => array(
                        'label'   => 'Сообщение о слишком частых попытках',
                        'type'    => 'textarea',
                        'default' => 'Слишком много попыток. Попробуйте через несколько минут или позвоните нам.',
                    ),
                    'delivery_failed' => array(
                        'label'   => 'Ошибка отправки — подстановка {phone}',
                        'type'    => 'textarea',
                        'default' => 'Заявка не отправлена. Данные сохранены в форме. Свяжитесь с нами: {phone}.',
                    ),
                    'fallback_phone' => array(
                        'label'   => 'Резервный телефон в ошибке, если основной не задан',
                        'type'    => 'text',
                        'default' => '+7 (917) 201-21-00',
                    ),
                ),
            ),
            'site' => array(
                'type'   => 'group',
                'label'  => 'Подбор полотна и оборудования',
                'fields' => array(
                    'pitch_prefix' => array(
                        'label'   => 'Подпись результата подбора в комментарии',
                        'type'    => 'text',
                        'default' => 'Подбор шага:',
                    ),
                    'pitch_overflow' => array(
                        'label'   => 'Результат подбора не помещается в комментарий',
                        'type'    => 'textarea',
                        'default' => 'Подбор не добавлен: сократите комментарий, чтобы в нём поместились размеры заготовки. Ваш текст и прежний шаг сохранены.',
                    ),
                    'equipment_title_roller' => array(
                        'label'   => 'Заголовок заявки на рольганг',
                        'type'    => 'text',
                        'default' => 'Подбор рольганга',
                    ),
                    'equipment_title_machine' => array(
                        'label'   => 'Заголовок заявки на станок',
                        'type'    => 'text',
                        'default' => 'Подбор станка',
                    ),
                    'equipment_title_default' => array(
                        'label'   => 'Общий заголовок заявки на оборудование',
                        'type'    => 'text',
                        'default' => 'Подбор оборудования',
                    ),
                    'equipment_intro' => array(
                        'label'   => 'Вступление в заявке на оборудование',
                        'type'    => 'textarea',
                        'default' => 'Расскажите о задаче и оставьте контакты — обсудим подходящее оборудование.',
                    ),
                    'equipment_help_roller' => array(
                        'label'   => 'Подсказка к параметрам рольганга',
                        'type'    => 'textarea',
                        'default' => 'Укажите длину и вес заготовок, нужную длину рольганга и модель станка, если он уже есть.',
                    ),
                    'equipment_help_default' => array(
                        'label'   => 'Подсказка к параметрам станка или оборудования',
                        'type'    => 'textarea',
                        'default' => 'Укажите материал, сечение заготовки и объём работ. Модель, комплектацию и стоимость уточним при подборе.',
                    ),
                    'equipment_placeholder' => array(
                        'label'   => 'Пример ввода в заявке на оборудование',
                        'type'    => 'text',
                        'default' => 'Опишите заготовку и задачу для оборудования',
                    ),
                    'equipment_line_template' => array(
                        'label'   => 'Оборудование в тексте заявки — подстановка {equipment}',
                        'type'    => 'text',
                        'default' => 'Оборудование: {equipment}',
                    ),
                ),
            ),
            'navigation' => array(
                'type'   => 'group',
                'label'  => 'Мобильное меню',
                'fields' => array(
                    'open_label' => array(
                        'label'   => 'Озвучиваемая подпись открытия меню',
                        'type'    => 'text',
                        'default' => 'Открыть меню',
                    ),
                    'close_label' => array(
                        'label'   => 'Озвучиваемая подпись закрытия меню',
                        'type'    => 'text',
                        'default' => 'Закрыть меню',
                    ),
                ),
            ),
        ),
    ),
);
