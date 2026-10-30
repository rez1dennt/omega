<?php
defined( 'ABSPATH' ) || exit;

/** Shipped defaults mirror the canonical theme data/pitch-data.json. No user-facing JSON editor. */
return array(
    'pitch_data' => array(
        'title' => 'Данные подбора шага',
        'fields' => array(
            'tpi_order' => array(
                'type' => 'repeater', 'label' => 'Порядок вариантов в форме заявки',
                'instructions' => 'Шаги из таблиц и диаграммы добавляются автоматически. Здесь можно задать порядок и дополнительные варианты.',
                'default' => array( array( 'pitch' => '3/4' ), array( 'pitch' => '4/6' ), array( 'pitch' => '6/10' ), array( 'pitch' => '10/14' ), array( 'pitch' => '8/12' ), array( 'pitch' => '5/8' ), array( 'pitch' => '5/6' ), array( 'pitch' => '2/3' ), array( 'pitch' => '1,5/2' ), array( 'pitch' => '1,1/1,6' ), array( 'pitch' => '0,75/1,25' ), array( 'pitch' => '14' ), array( 'pitch' => '14/18' ), array( 'pitch' => '1,4/2' ), array( 'pitch' => '0,7/1' ), array( 'pitch' => '6/8' ) ), 'min' => 0, 'max' => 40, 'layout' => 'row', 'button_label' => 'Добавить шаг',
                'fields' => array( 'pitch' => array( 'type' => 'text', 'label' => 'Шаг зуба, TPI', 'default' => '' ) )
            ),
            'rod_ranges' => array(
                'type' => 'repeater',
                'label' => 'Пруток: диапазоны диаметров',
                'default' => array(
                    array(
                        'min' => 0,
                        'max' => 25,
                        'label' => 'до 25',
                        'pitch' => '10/14',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 15,
                        'max' => 40,
                        'label' => '15–40',
                        'pitch' => '8/12',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 25,
                        'max' => 50,
                        'label' => '25–50',
                        'pitch' => '6/10',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 35,
                        'max' => 70,
                        'label' => '35–70',
                        'pitch' => '5/8',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 40,
                        'max' => 90,
                        'label' => '40–90',
                        'pitch' => '5/6',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 50,
                        'max' => 120,
                        'label' => '50–120',
                        'pitch' => '4/6',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 80,
                        'max' => 150,
                        'label' => '80–150',
                        'pitch' => '3/4',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 130,
                        'max' => 350,
                        'label' => '130–350',
                        'pitch' => '2/3',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 150,
                        'max' => 450,
                        'label' => '150–450',
                        'pitch' => '1,5/2',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 200,
                        'max' => 600,
                        'label' => '200–600',
                        'pitch' => '1,1/1,6',
                        'exclusive_min' => false
                    ),
                    array(
                        'min' => 500,
                        'max' => null,
                        'label' => 'свыше 500',
                        'pitch' => '0,75/1,25',
                        'exclusive_min' => true
                    )
                ),
                'min' => 1,
                'max' => 30,
                'layout' => 'row',
                'button_label' => 'Добавить строку',
                'fields' => array(
                    'min' => array(
                        'type' => 'number',
                        'label' => 'Диаметр от, мм',
                        'default' => 0,
                        'min' => 0,
                        'step' => 'any'
                    ),
                    'max' => array(
                        'type' => 'number',
                        'label' => 'Диаметр до, мм',
                        'default' => null,
                        'min' => 0,
                        'step' => 'any',
                        'instructions' => 'Пустое поле означает отсутствие верхней границы.'
                    ),
                    'label' => array(
                        'type' => 'text',
                        'label' => 'Подпись диапазона',
                        'default' => ''
                    ),
                    'pitch' => array(
                        'type' => 'text',
                        'label' => 'Шаг зуба, TPI',
                        'default' => ''
                    ),
                    'exclusive_min' => array(
                        'type' => 'true_false',
                        'label' => 'Нижняя граница не включается',
                        'default' => false,
                        'ui' => 1
                    )
                )
            ),
            'lenox_source' => array(
                'type' => 'group',
                'label' => 'Основная диаграмма LENOX',
                'default' => array(
                    'name' => 'LENOX',
                    'page' => 10,
                    'url' => 'https://bynder.sbdinc.com/m/4a09882bef67f9e0/original/LXBSBR_HR.pdf',
                    'min_wall' => 1.25,
                    'max_wall' => 50
                ),
                'fields' => array(
                    'name' => array(
                        'type' => 'text',
                        'label' => 'Название производителя',
                        'default' => ''
                    ),
                    'page' => array(
                        'type' => 'number',
                        'label' => 'Страница каталога',
                        'default' => 1,
                        'min' => 1,
                        'step' => 1
                    ),
                    'url' => array(
                        'type' => 'url',
                        'label' => 'Ссылка на PDF каталога',
                        'default' => ''
                    ),
                    'min_wall' => array(
                        'type' => 'number',
                        'label' => 'Минимальная стенка, мм',
                        'default' => 1.25,
                        'min' => 0.001,
                        'step' => 'any'
                    ),
                    'max_wall' => array(
                        'type' => 'number',
                        'label' => 'Максимальная стенка, мм',
                        'default' => 50,
                        'min' => 0.001,
                        'step' => 'any'
                    )
                )
            ),
            'lenox_axis' => array(
                'type' => 'repeater',
                'label' => 'Диаграмма: опорные значения стенки',
                'default' => array(
                    array(
                        'wall' => 1.25,
                        'position' => 115.7934
                    ),
                    array(
                        'wall' => 2.5,
                        'position' => 143.2521
                    ),
                    array(
                        'wall' => 3.75,
                        'position' => 170.7108
                    ),
                    array(
                        'wall' => 5,
                        'position' => 189.0166
                    ),
                    array(
                        'wall' => 6.25,
                        'position' => 216.4753
                    ),
                    array(
                        'wall' => 7.5,
                        'position' => 234.7811
                    ),
                    array(
                        'wall' => 10,
                        'position' => 253.0869
                    ),
                    array(
                        'wall' => 12.5,
                        'position' => 271.3927
                    ),
                    array(
                        'wall' => 15,
                        'position' => 289.6985
                    ),
                    array(
                        'wall' => 17.5,
                        'position' => 308.0043
                    ),
                    array(
                        'wall' => 20,
                        'position' => 326.3101
                    ),
                    array(
                        'wall' => 22.5,
                        'position' => 344.6158
                    ),
                    array(
                        'wall' => 25,
                        'position' => 362.9216
                    ),
                    array(
                        'wall' => 37.5,
                        'position' => 381.2274
                    ),
                    array(
                        'wall' => 50,
                        'position' => 399.5332
                    )
                ),
                'min' => 2,
                'max' => 40,
                'layout' => 'row',
                'button_label' => 'Добавить строку',
                'fields' => array(
                    'wall' => array(
                        'type' => 'number',
                        'label' => 'Стенка, мм',
                        'default' => 1,
                        'min' => 0.001,
                        'step' => 'any'
                    ),
                    'position' => array(
                        'type' => 'number',
                        'label' => 'Положение на оси PDF',
                        'default' => 1,
                        'min' => 0.001,
                        'step' => 'any'
                    )
                )
            ),
            'lenox_bands' => array(
                'type' => 'repeater',
                'label' => 'Диаграмма: группы шага зуба',
                'default' => array(
                    array(
                        'from' => 97.066,
                        'to' => 120.489,
                        'pitches' => array(
                            array(
                                'pitch' => '14/18'
                            )
                        )
                    ),
                    array(
                        'from' => 120.489,
                        'to' => 144.323,
                        'pitches' => array(
                            array(
                                'pitch' => '10/14'
                            )
                        )
                    ),
                    array(
                        'from' => 144.323,
                        'to' => 166.044,
                        'pitches' => array(
                            array(
                                'pitch' => '8/12'
                            )
                        )
                    ),
                    array(
                        'from' => 166.044,
                        'to' => 187.651,
                        'pitches' => array(
                            array(
                                'pitch' => '6/10'
                            )
                        )
                    ),
                    array(
                        'from' => 187.651,
                        'to' => 219.742,
                        'pitches' => array(
                            array(
                                'pitch' => '6/8'
                            ),
                            array(
                                'pitch' => '5/8'
                            )
                        )
                    ),
                    array(
                        'from' => 219.742,
                        'to' => 286.282,
                        'pitches' => array(
                            array(
                                'pitch' => '4/6'
                            )
                        )
                    ),
                    array(
                        'from' => 286.282,
                        'to' => 368.281,
                        'pitches' => array(
                            array(
                                'pitch' => '3/4'
                            )
                        )
                    ),
                    array(
                        'from' => 368.281,
                        'to' => 408.51,
                        'pitches' => array(
                            array(
                                'pitch' => '2/3'
                            )
                        )
                    )
                ),
                'min' => 1,
                'max' => 30,
                'layout' => 'row',
                'button_label' => 'Добавить строку',
                'fields' => array(
                    'from' => array(
                        'type' => 'number',
                        'label' => 'Начало группы на оси PDF',
                        'default' => 0,
                        'min' => 0,
                        'step' => 'any'
                    ),
                    'to' => array(
                        'type' => 'number',
                        'label' => 'Конец группы на оси PDF',
                        'default' => 1,
                        'min' => 0,
                        'step' => 'any'
                    ),
                    'pitches' => array(
                        'type' => 'repeater',
                        'label' => 'Варианты шага в этой группе',
                        'default' => array(

                        ),
                        'min' => 1,
                        'max' => 10,
                        'layout' => 'row',
                        'button_label' => 'Добавить строку',
                        'fields' => array(
                            'pitch' => array(
                                'type' => 'text',
                                'label' => 'Шаг зуба, TPI',
                                'default' => ''
                            )
                        )
                    )
                )
            ),
            'common_diameters' => array(
                'type' => 'repeater',
                'label' => 'Кнопки частых диаметров',
                'default' => array(
                    array(
                        'diameter' => 20
                    ),
                    array(
                        'diameter' => 21.3
                    ),
                    array(
                        'diameter' => 25
                    ),
                    array(
                        'diameter' => 26.8
                    ),
                    array(
                        'diameter' => 32
                    ),
                    array(
                        'diameter' => 33.5
                    ),
                    array(
                        'diameter' => 40
                    ),
                    array(
                        'diameter' => 42.3
                    ),
                    array(
                        'diameter' => 48
                    ),
                    array(
                        'diameter' => 57
                    ),
                    array(
                        'diameter' => 60
                    ),
                    array(
                        'diameter' => 76
                    ),
                    array(
                        'diameter' => 89
                    ),
                    array(
                        'diameter' => 90
                    ),
                    array(
                        'diameter' => 108
                    ),
                    array(
                        'diameter' => 114
                    ),
                    array(
                        'diameter' => 133
                    ),
                    array(
                        'diameter' => 159
                    ),
                    array(
                        'diameter' => 219
                    ),
                    array(
                        'diameter' => 273
                    ),
                    array(
                        'diameter' => 325
                    ),
                    array(
                        'diameter' => 377
                    ),
                    array(
                        'diameter' => 426
                    ),
                    array(
                        'diameter' => 500
                    )
                ),
                'min' => 1,
                'max' => 60,
                'layout' => 'row',
                'button_label' => 'Добавить строку',
                'fields' => array(
                    'diameter' => array(
                        'type' => 'number',
                        'label' => 'Наружный диаметр, мм',
                        'default' => 20,
                        'min' => 0.001,
                        'step' => 'any'
                    )
                )
            ),
            'bahco_source' => array(
                'type' => 'group',
                'label' => 'Источник дополнительной таблицы BAHCO',
                'default' => array(
                    'name' => 'BAHCO',
                    'page' => 35,
                    'url' => 'https://media.bahco.com/media/media-download/catalogue/Bandsaw_catalogue_UK_2024_14.pdf'
                ),
                'fields' => array(
                    'name' => array(
                        'type' => 'text',
                        'label' => 'Название производителя',
                        'default' => ''
                    ),
                    'page' => array(
                        'type' => 'number',
                        'label' => 'Страница каталога',
                        'default' => 1,
                        'min' => 1,
                        'step' => 1
                    ),
                    'url' => array(
                        'type' => 'url',
                        'label' => 'Ссылка на PDF каталога',
                        'default' => ''
                    )
                )
            )
        )
    ),
    'pitch_omega' => array(
        'title' => 'Таблица «Омега Комплект»',
        'fields' => array(
            'matrix' => array(
                'type' => 'omega_matrix',
                'label' => 'Шаг зуба для труб',
                'default' => array(
                    'diameters' => array(
                        20,
                        40,
                        60,
                        80,
                        100,
                        120,
                        150,
                        200,
                        300,
                        500
                    ),
                    'walls' => array(
                        2,
                        3,
                        4,
                        5,
                        6,
                        8,
                        10,
                        12,
                        15,
                        20,
                        30,
                        50
                    ),
                    'cells' => array(
                        array(
                            '14',
                            '14',
                            '14',
                            '14',
                            '14',
                            '14',
                            '10/14',
                            '10/14',
                            '8/12',
                            '6/10'
                        ),
                        array(
                            '14',
                            '14',
                            '14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '8/12',
                            '8/12',
                            '6/10',
                            '5/8'
                        ),
                        array(
                            '10/14',
                            '10/14',
                            '10/14',
                            '8/12',
                            '8/12',
                            '8/12',
                            '6/10',
                            '6/10',
                            '5/8',
                            '4/6'
                        ),
                        array(
                            '10/14',
                            '8/12',
                            '8/12',
                            '8/12',
                            '6/10',
                            '6/10',
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6'
                        ),
                        array(
                            '8/12',
                            '8/12',
                            '6/10',
                            '6/10',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '3/4'
                        ),
                        array(
                            '8/12',
                            '6/10',
                            '6/10',
                            '6/10',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '3/4'
                        ),
                        array(
                            null,
                            '6/10',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6',
                            '3/4',
                            '3/4'
                        ),
                        array(
                            null,
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6',
                            '4/6',
                            '3/4',
                            '3/4',
                            '3/4'
                        ),
                        array(
                            null,
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '3/4',
                            '2/3',
                            '2/3'
                        ),
                        array(
                            null,
                            null,
                            '4/6',
                            '4/6',
                            '4/6',
                            '3/4',
                            '3/4',
                            '2/3',
                            '2/3',
                            '2/3'
                        ),
                        array(
                            null,
                            null,
                            null,
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '2/3',
                            '2/3',
                            '2/3'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3'
                        )
                    )
                ),
                'max_rows' => 25,
                'max_columns' => 30,
                'max_cells' => 750,
                'instructions' => 'Самостоятельная страница сохранения таблицы. Максимум 25 строк и 30 столбцов; до 750 ячеек.'
            )
        )
    ),
    'pitch_bahco' => array(
        'title' => 'Таблица BAHCO',
        'fields' => array(
            'matrix' => array(
                'type' => 'omega_matrix',
                'label' => 'Справочник BAHCO для труб',
                'default' => array(
                    'diameters' => array(
                        20,
                        40,
                        60,
                        80,
                        90,
                        100,
                        110,
                        120,
                        130,
                        140,
                        150,
                        160,
                        170,
                        180,
                        190,
                        200,
                        220,
                        250,
                        300,
                        350,
                        400,
                        500,
                        600,
                        700,
                        800
                    ),
                    'walls' => array(
                        2,
                        4,
                        6,
                        8,
                        10,
                        15,
                        25,
                        35,
                        50,
                        65,
                        75,
                        100,
                        130,
                        150
                    ),
                    'cells' => array(
                        array(
                            '14/18',
                            '14/18',
                            '14/18',
                            '14/18',
                            '14/18',
                            '14/18',
                            '14/18',
                            '14/18',
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '8/12',
                            '8/12',
                            '8/12',
                            '8/12',
                            '8/12',
                            '8/12',
                            '8/12',
                            '8/12'
                        ),
                        array(
                            '10/14',
                            '10/14',
                            '10/14',
                            '10/14',
                            '8/12',
                            '8/12',
                            '8/12',
                            '8/12',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8'
                        ),
                        array(
                            '10/14',
                            '8/12',
                            '8/12',
                            '8/12',
                            '6/10',
                            '6/10',
                            '6/10',
                            '6/10',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6'
                        ),
                        array(
                            null,
                            '6/10',
                            '6/10',
                            '6/10',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6'
                        ),
                        array(
                            null,
                            '5/8',
                            '5/8',
                            '5/8',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4'
                        ),
                        array(
                            null,
                            null,
                            '5/8',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4'
                        ),
                        array(
                            null,
                            null,
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '4/6',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3'
                        ),
                        array(
                            null,
                            null,
                            null,
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '3/4',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '3/4',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '2/3',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '0,7/1',
                            '0,7/1',
                            '0,7/1',
                            '0,7/1'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '1,4/2',
                            '1,4/2',
                            '1,4/2',
                            '0,7/1',
                            '0,7/1',
                            '0,7/1',
                            '0,7/1'
                        ),
                        array(
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            '1,4/2',
                            '1,4/2',
                            '0,7/1',
                            '0,7/1',
                            '0,7/1',
                            '0,7/1'
                        )
                    )
                ),
                'max_rows' => 25,
                'max_columns' => 30,
                'max_cells' => 750,
                'instructions' => 'Самостоятельная страница сохранения таблицы. Пустые клетки сохраняются как отсутствие рекомендации.'
            )
        )
    ),
    'pitch_ui' => array(
        'title' => 'Подбор шага: тексты и подсказки',
        'fields' => array(
            'omega_result_label' => array( 'type' => 'text', 'label' => 'Подбор трубы: заголовок результата', 'default' => 'ШАГ ПО ТАБЛИЦЕ' ),
            'omega_method' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Описание метода', 'default' => 'Подбор по таблице «Омега Комплект» с учётом наружного диаметра и толщины стенки.' ),
            'omega_default_note' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Подсказка до подбора', 'default' => 'Для точного размера покажем значение таблицы, для промежуточного — соседние ячейки.' ),
            'omega_bundle_note' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Примечание о трубах в пакете', 'default' => 'Для труб в пакете используем удвоенную толщину стенки по примечанию к таблице.' ),
            'omega_exact' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Подпись точного значения', 'default' => 'Значение по таблице «Омега Комплект».' ),
            'omega_nearby' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Пояснение соседних значений', 'default' => 'В таблице нет точной ячейки: показаны соседние размеры и значения. Это ориентир, окончательный шаг уточнит специалист.' ),
            'omega_missing' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Нет значения в ячейке', 'default' => 'В этой ячейке таблицы значение не указано. Обратитесь за консультацией.' ),
            'omega_outside' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Размер вне таблицы', 'default' => 'Для этих размеров таблица не содержит соседних значений. Обратитесь за консультацией.' ),
            'omega_consult' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Кнопка консультации', 'default' => 'Получить консультацию' ),
            'omega_caption' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Подпись размеров ячейки', 'default' => 'Диаметр {diameter} мм · стенка {wall} мм' ),
            'omega_status' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Строка введённых размеров', 'default' => '{description}. {bundle}' ),
            'omega_bundle_status' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Пояснение расчётной стенки', 'default' => 'Для пакета учитываем стенку {effective_wall} мм.' ),
            'omega_geometry' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Ошибка толщины стенки', 'default' => 'Толщина стенки должна быть меньше половины наружного диаметра.' ),
            'omega_missing_cell' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Пустая ячейка таблицы', 'default' => 'В таблице не указано' ),
            'omega_table' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Название таблицы', 'default' => 'Таблица «Омега Комплект»' ),
            'omega_exact_note' => array( 'type' => 'textarea', 'label' => 'Подбор трубы: Пояснение точного результата', 'default' => 'Добавьте шаг в заявку или уточните подбор у специалиста.' ),
            'eyebrow_1' => array(
                'type' => 'text',
                'label' => 'Надзаголовок раздела',
                'default' => 'ПОДБОР ШАГА ЗУБА'
            ),
            'heading_1' => array(
                'type' => 'text',
                'label' => 'Заголовок: строка 1',
                'default' => 'Шаг зуба.'
            ),
            'heading_2' => array(
                'type' => 'text',
                'label' => 'Заголовок: строка 2',
                'default' => 'Под вашу заготовку.'
            ),
            'paragraph_1' => array(
                'type' => 'text',
                'label' => 'Вступление: строка 1',
                'default' => 'Укажите размер прутка или трубы.'
            ),
            'paragraph_2' => array(
                'type' => 'text',
                'label' => 'Вступление: пояснение TPI',
                'default' => 'TPI — количество зубьев на дюйм.'
            ),
            'label_1' => array(
                'type' => 'text',
                'label' => 'Вкладка «Пруток»',
                'default' => 'Пруток'
            ),
            'label_2' => array(
                'type' => 'text',
                'label' => 'Вкладка «Труба»',
                'default' => 'Труба'
            ),
            'heading_3' => array(
                'type' => 'text',
                'label' => 'Заголовок панели прутка',
                'default' => 'Пруток'
            ),
            'label_3' => array(
                'type' => 'text',
                'label' => 'Подпись диаметра прутка',
                'default' => 'Диаметр прутка, мм'
            ),
            'label_4' => array(
                'type' => 'text',
                'label' => 'Кнопка поиска для прутка',
                'default' => 'Найти шаг зуба'
            ),
            'paragraph_3' => array(
                'type' => 'text',
                'label' => 'Заголовок результата прутка',
                'default' => 'ВАШ ШАГ ЗУБА'
            ),
            'paragraph_4' => array(
                'type' => 'text',
                'label' => 'Пруток: начальное состояние',
                'default' => 'Укажите размеры — покажем значения из таблицы.'
            ),
            'paragraph_5' => array(
                'type' => 'text',
                'label' => 'Пруток: подсказка результата',
                'default' => 'Выбранный шаг можно добавить в заявку.'
            ),
            'paragraph_6' => array(
                'type' => 'textarea',
                'label' => 'Пояснение пересечений диапазонов прутка',
                'default' => 'Диапазоны в таблице пересекаются: одному диаметру могут соответствовать несколько вариантов шага. Уточним выбор по вашему материалу и станку.'
            ),
            'label_5' => array(
                'type' => 'text',
                'label' => 'Название таблицы прутка',
                'default' => 'Вся таблица для прутка'
            ),
            'heading_4' => array(
                'type' => 'text',
                'label' => 'Заголовок панели трубы',
                'default' => 'Труба'
            ),
            'label_6' => array(
                'type' => 'text',
                'label' => 'Подпись наружного диаметра трубы',
                'default' => 'Наружный диаметр, мм'
            ),
            'label_7' => array(
                'type' => 'text',
                'label' => 'Подпись толщины стенки',
                'default' => 'Толщина стенки, мм'
            ),
            'label_8' => array(
                'type' => 'text',
                'label' => 'Подпись распила труб в пакете',
                'default' => 'Несколько труб в пакете'
            ),
            'label_9' => array(
                'type' => 'text',
                'label' => 'Кнопка поиска для трубы',
                'default' => 'Найти шаг зуба'
            ),
            'paragraph_7' => array(
                'type' => 'text',
                'label' => 'Заголовок результата трубы',
                'default' => 'РЕКОМЕНДУЕМЫЙ ШАГ'
            ),
            'paragraph_8' => array(
                'type' => 'text',
                'label' => 'Труба: начальное состояние',
                'default' => 'Укажите диаметр и стенку — покажем рекомендуемый шаг.'
            ),
            'paragraph_9' => array(
                'type' => 'textarea',
                'label' => 'Труба: подсказка результата',
                'default' => 'Биметаллическое полотно · стенка от {min_wall} до {max_wall} мм. Шаг по диаграмме {source}.',
                'instructions' => 'Сохраните подстановки {min_wall}, {max_wall}, {source}: сайт заменяет их выбранными параметрами.'
            ),
            'paragraph_10' => array(
                'type' => 'textarea',
                'label' => 'Труба: пояснение методик подбора',
                'default' => 'Для пакета {source} рекомендует шаг на одну группу крупнее. Справочные таблицы ниже относятся к другим методикам и могут давать другие рекомендации.',
                'instructions' => 'Сохраните подстановки {source}: сайт заменяет их выбранными параметрами.'
            ),
            'label_10' => array(
                'type' => 'text',
                'label' => 'Название таблицы «Омега Комплект»',
                'default' => 'Справочная таблица «Омега Комплект»'
            ),
            'paragraph_11' => array(
                'type' => 'textarea',
                'label' => 'Пояснение горизонтальной таблицы',
                'default' => 'Столбцы — наружный диаметр в мм. Значения в ячейках — шаг зуба в TPI. Таблицу можно прокручивать по горизонтали.'
            ),
            'label_11' => array(
                'type' => 'text',
                'label' => 'Обкатка: надзаголовок',
                'default' => 'Перед первым резом'
            ),
            'label_12' => array(
                'type' => 'text',
                'label' => 'Обкатка: название',
                'default' => 'Обкатка биметаллического полотна'
            ),
            'paragraph_12' => array(
                'type' => 'textarea',
                'label' => 'Обкатка: инструкция',
                'default' => 'При обкатке новой пилы подача пильной рамы и скорость вращения полотна должны составлять 50% — половину рекомендуемых параметров для разрезаемого материала.'
            ),
            'tablist_label' => array(
                'type' => 'text',
                'label' => 'Доступное название вкладок',
                'default' => 'Тип заготовки'
            ),
            'rod_group_label' => array(
                'type' => 'text',
                'label' => 'Доступное название размеров прутка',
                'default' => 'Размеры прутка'
            ),
            'pipe_group_label' => array(
                'type' => 'text',
                'label' => 'Доступное название размеров трубы',
                'default' => 'Размеры трубы'
            ),
            'rod_placeholder' => array(
                'type' => 'text',
                'label' => 'Пример диаметра прутка',
                'default' => 'Например, 60'
            ),
            'diameter_placeholder' => array(
                'type' => 'text',
                'label' => 'Пример диаметра трубы',
                'default' => 'Например, 100'
            ),
            'wall_placeholder' => array(
                'type' => 'text',
                'label' => 'Пример толщины стенки',
                'default' => 'Например, 4'
            ),
            'rod_caption' => array(
                'type' => 'text',
                'label' => 'Доступное название таблицы прутка',
                'default' => 'Шаг зуба для прутка'
            ),
            'diameter_column' => array(
                'type' => 'text',
                'label' => 'Столбец диаметра',
                'default' => 'Диаметр, мм'
            ),
            'pitch_column' => array(
                'type' => 'text',
                'label' => 'Столбец шага зуба',
                'default' => 'Шаг зуба, TPI'
            ),
            'pipe_region_label' => array(
                'type' => 'text',
                'label' => 'Доступное название прокручиваемой таблицы',
                'default' => 'Таблица шага зуба для труб, горизонтальная прокрутка'
            ),
            'pipe_caption' => array(
                'type' => 'text',
                'label' => 'Доступное название таблицы труб',
                'default' => 'Труба: наружный диаметр и толщина стенки в миллиметрах'
            ),
            'wall_column' => array(
                'type' => 'text',
                'label' => 'Столбец толщины стенки',
                'default' => 'Стенка, мм'
            ),
            'no_data' => array(
                'type' => 'text',
                'label' => 'Подпись отсутствующих данных',
                'default' => 'Нет данных'
            ),
            'empty_cell' => array(
                'type' => 'text',
                'label' => 'Знак пустой ячейки',
                'default' => '—'
            ),
            'dimension_wall' => array(
                'type' => 'text',
                'label' => 'Название стенки в ошибке',
                'default' => 'толщину стенки'
            ),
            'dimension_diameter' => array(
                'type' => 'text',
                'label' => 'Название диаметра трубы в ошибке',
                'default' => 'наружный диаметр'
            ),
            'dimension_rod' => array(
                'type' => 'text',
                'label' => 'Название диаметра прутка в ошибке',
                'default' => 'диаметр прутка'
            ),
            'example_wall' => array(
                'type' => 'text',
                'label' => 'Пример стенки в ошибке',
                'default' => '4 или 2,5'
            ),
            'example_diameter' => array(
                'type' => 'text',
                'label' => 'Пример диаметра трубы в ошибке',
                'default' => '89 или 108'
            ),
            'example_rod' => array(
                'type' => 'text',
                'label' => 'Пример диаметра прутка в ошибке',
                'default' => '60'
            ),
            'invalid_dimension' => array(
                'type' => 'text',
                'label' => 'Ошибка неправильного размера',
                'default' => 'Введите {dimension} больше нуля, например {example} мм.',
                'instructions' => 'Сохраните подстановки {dimension}, {example}: сайт заменяет их выбранными параметрами.'
            ),
            'missing_dimension' => array(
                'type' => 'text',
                'label' => 'Ошибка незаполненного размера',
                'default' => 'Укажите {dimension} в миллиметрах.',
                'instructions' => 'Сохраните подстановки {dimension}: сайт заменяет их выбранными параметрами.'
            ),
            'add_aria' => array(
                'type' => 'text',
                'label' => 'Доступная подпись добавления шага',
                'default' => 'Добавить {pitch} TPI в заявку',
                'instructions' => 'Сохраните подстановки {pitch}: сайт заменяет их выбранными параметрами.'
            ),
            'pitch_unit' => array(
                'type' => 'text',
                'label' => 'Подпись единицы TPI',
                'default' => 'TPI'
            ),
            'add_action' => array(
                'type' => 'text',
                'label' => 'Кнопка добавления в заявку',
                'default' => 'В заявку'
            ),
            'parameter_pitch' => array(
                'type' => 'text',
                'label' => 'Параметры: добавление шага зуба',
                'default' => '{parameters}; шаг {pitch} TPI',
                'instructions' => 'Сохраните подстановки {parameters}, {pitch}: сайт заменяет их выбранными параметрами.'
            ),
            'transfer_success' => array(
                'type' => 'text',
                'label' => 'Успешное добавление в форму',
                'default' => 'Шаг {pitch} TPI добавлен в форму заявки.',
                'instructions' => 'Сохраните подстановки {pitch}: сайт заменяет их выбранными параметрами.'
            ),
            'transfer_error' => array(
                'type' => 'textarea',
                'label' => 'Ошибка добавления в форму',
                'default' => 'Подбор не добавлен: сократите комментарий в форме и попробуйте ещё раз. Прежние данные сохранены.'
            ),
            'check_dimensions' => array(
                'type' => 'text',
                'label' => 'Сводная ошибка размеров',
                'default' => 'Проверьте размеры: подсказка указана под полем.'
            ),
            'rod_status' => array(
                'type' => 'text',
                'label' => 'Результат подбора для прутка',
                'default' => 'Пруток Ø {diameter} мм: {result}',
                'instructions' => 'Сохраните подстановки {diameter}, {result}: сайт заменяет их выбранными параметрами.'
            ),
            'rod_multiple' => array(
                'type' => 'text',
                'label' => 'Найдено несколько шагов прутка',
                'default' => 'в таблице несколько вариантов шага.'
            ),
            'rod_single' => array(
                'type' => 'text',
                'label' => 'Найден один шаг прутка',
                'default' => 'шаг по таблице.'
            ),
            'rod_no_match' => array(
                'type' => 'text',
                'label' => 'Нет шага для диаметра прутка',
                'default' => 'Для этого диаметра в таблице нет рекомендации. Опишите задачу в заявке.'
            ),
            'rod_choice_caption' => array(
                'type' => 'text',
                'label' => 'Подпись варианта для прутка',
                'default' => 'Диаметр {range} мм',
                'instructions' => 'Сохраните подстановки {range}: сайт заменяет их выбранными параметрами.'
            ),
            'rod_parameters' => array(
                'type' => 'text',
                'label' => 'Пруток: параметры для заявки',
                'default' => 'Пруток Ø {diameter} мм',
                'instructions' => 'Сохраните подстановки {diameter}: сайт заменяет их выбранными параметрами.'
            ),
            'rod_multiple_note' => array(
                'type' => 'text',
                'label' => 'Пруток: пояснение нескольких вариантов',
                'default' => 'Выберите вариант для заявки — уточним подбор по материалу и станку.'
            ),
            'rod_single_note' => array(
                'type' => 'text',
                'label' => 'Пруток: пояснение одного варианта',
                'default' => 'Добавьте шаг и размеры в форму заявки.'
            ),
            'pipe_description' => array(
                'type' => 'text',
                'label' => 'Труба: описание размеров',
                'default' => 'Труба Ø {diameter} мм, стенка {wall} мм',
                'instructions' => 'Сохраните подстановки {diameter}, {wall}: сайт заменяет их выбранными параметрами.'
            ),
            'bundle_status' => array(
                'type' => 'text',
                'label' => 'Пакет: пояснение результата',
                'default' => 'Для пакета — на одну группу крупнее.'
            ),
            'source_label' => array(
                'type' => 'text',
                'label' => 'Название ссылки на диаграмму',
                'default' => 'Диаграмма {source}, стр. {page}',
                'instructions' => 'Сохраните подстановки {source}, {page}: сайт заменяет их выбранными параметрами.'
            ),
            'pipe_choice_caption' => array(
                'type' => 'text',
                'label' => 'Подпись варианта для трубы',
                'default' => 'Стенка {wall} мм · {arrangement}',
                'instructions' => 'Сохраните подстановки {wall}, {arrangement}: сайт заменяет их выбранными параметрами.'
            ),
            'bundle_label' => array(
                'type' => 'text',
                'label' => 'Подпись пакета труб',
                'default' => 'пакет'
            ),
            'single_pipe_label' => array(
                'type' => 'text',
                'label' => 'Подпись одной трубы',
                'default' => 'одна труба'
            ),
            'pipe_parameters' => array(
                'type' => 'text',
                'label' => 'Труба: параметры для заявки',
                'default' => '{description}; диаграмма {source}, стр. {page}{bundle}',
                'instructions' => 'Сохраните подстановки {description}, {source}, {page}, {bundle}: сайт заменяет их выбранными параметрами.'
            ),
            'bundle_parameters' => array(
                'type' => 'text',
                'label' => 'Пакет: дополнение параметров заявки',
                'default' => '; пакет, на одну группу крупнее'
            ),
            'boundary_note' => array(
                'type' => 'textarea',
                'label' => 'Пояснение переходной зоны диаграммы',
                'default' => 'При чтении печатной диаграммы толщина попадает в зону перехода. Показаны соседние варианты для уточнения по материалу, станку и серии полотна.'
            ),
            'multiple_note' => array(
                'type' => 'textarea',
                'label' => 'Труба: пояснение нескольких вариантов',
                'default' => 'Диаграмма допускает оба варианта шага. Добавьте нужный в заявку — уточним по материалу и станку.'
            ),
            'recommendation_note' => array(
                'type' => 'textarea',
                'label' => 'Труба: пояснение рекомендации',
                'default' => 'Рекомендация для биметаллического полотна. Добавьте шаг в заявку — проверим по вашему материалу и станку.'
            ),
            'geometry_error' => array(
                'type' => 'text',
                'label' => 'Ошибка геометрии трубы',
                'default' => 'Толщина стенки должна быть меньше половины наружного диаметра. Иначе это сплошной пруток.'
            ),
            'wall_range_error' => array(
                'type' => 'text',
                'label' => 'Ошибка диапазона толщины стенки',
                'default' => 'Для этой диаграммы укажите толщину стенки от {min_wall} до {max_wall} мм.',
                'instructions' => 'Сохраните подстановки {min_wall}, {max_wall}: сайт заменяет их выбранными параметрами.'
            ),
            'check_wall' => array(
                'type' => 'text',
                'label' => 'Сводная ошибка толщины стенки',
                'default' => 'Проверьте толщину стенки — подсказка под полем.'
            ),
            'bundle_outside' => array(
                'type' => 'text',
                'label' => 'Пакет вне диапазона диаграммы',
                'default' => 'Для такого пакета диаграмма не задаёт следующий более крупный шаг.'
            ),
            'outside_note' => array(
                'type' => 'text',
                'label' => 'Пояснение подбора специалистом',
                'default' => 'Укажите параметры в заявке — специалист подберёт полотно для этой задачи.'
            ),
            'common_title' => array(
                'type' => 'text',
                'label' => 'Название быстрых диаметров',
                'default' => 'Частые диаметры'
            ),
            'method' => array(
                'type' => 'textarea',
                'label' => 'Описание основной методики подбора',
                'default' => 'Ориентировочный подбор для биметаллических полотен по печатной диаграмме {source}. Шаг зависит от толщины стенки; наружный диаметр нужен для проверки размеров трубы. Стенка — от {min_wall} до {max_wall} мм.',
                'instructions' => 'Сохраните подстановки {source}, {min_wall}, {max_wall}: сайт заменяет их выбранными параметрами.'
            ),
            'diameter_button' => array(
                'type' => 'text',
                'label' => 'Подпись кнопки быстрого диаметра',
                'default' => '{diameter} мм',
                'instructions' => 'Сохраните подстановки {diameter}: сайт заменяет их выбранными параметрами.'
            ),
            'common_note' => array(
                'type' => 'textarea',
                'label' => 'Подсказка выбора быстрого диаметра',
                'default' => 'Наружный диаметр, не условный проход. После выбора укажите стенку и нажмите «{find_label}».',
                'instructions' => 'Сохраните подстановки {find_label}: сайт заменяет их выбранными параметрами.'
            ),
            'bahco_summary' => array(
                'type' => 'text',
                'label' => 'Название дополнительной таблицы',
                'default' => 'Дополнительная таблица {source}',
                'instructions' => 'Сохраните подстановки {source}: сайт заменяет их выбранными параметрами.'
            ),
            'bahco_note' => array(
                'type' => 'textarea',
                'label' => 'Пояснение дополнительной таблицы',
                'default' => 'Отдельный справочник {source}. Автоматический подбор выше использует диаграмму {primary_source}; рекомендации разных производителей могут отличаться. Диаметры и стенки — в мм, шаг — в TPI.',
                'instructions' => 'Сохраните подстановки {source}, {primary_source}: сайт заменяет их выбранными параметрами.'
            ),
            'bahco_source' => array(
                'type' => 'text',
                'label' => 'Название ссылки на каталог',
                'default' => 'Источник: каталог {source}, стр. {page}',
                'instructions' => 'Сохраните подстановки {source}, {page}: сайт заменяет их выбранными параметрами.'
            ),
            'bahco_region' => array(
                'type' => 'text',
                'label' => 'Доступное название справочника',
                'default' => 'Справочник {source}, горизонтальная прокрутка',
                'instructions' => 'Сохраните подстановки {source}: сайт заменяет их выбранными параметрами.'
            ),
            'bahco_caption' => array(
                'type' => 'text',
                'label' => 'Доступное название таблицы справочника',
                'default' => 'Рекомендации {source} для труб, каталог стр. {page}',
                'instructions' => 'Сохраните подстановки {source}, {page}: сайт заменяет их выбранными параметрами.'
            )
        )
    )
);
