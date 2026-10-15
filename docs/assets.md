# Фотографии и шрифты

## Оборудование — каталожные фотографии PILOUS, 15 октября 2026

Четыре схемы оборудования заменены изображениями из официального каталога производителя. Это каталожные изображения техники, а не съёмка предприятия «Омега Комплект». Фото иллюстрируют категории; наличие конкретной модели на складе не заявляется. Источники и правообладатель — PILOUS. Новые изображения не создавались ImageGen.

| Локальный WebP в `dist/assets/images/equipment/` | Изображённое оборудование | Размер | Источник |
| --- | --- | --- | --- |
| `hydraulic.webp` | ARG 235, гидроразгрузка | 736 × 800, 55288 байт | [Страница](https://www.pilous.cz/ru/metall/stanki-lentochnopilnye/s-gidrorazgruzkoj/arg-235), [файл](https://www.pilous.cz/uploads/fe_catalog_product_photogallery/01_235_cc8d798504bf73fbc31ebd7f6a9ffc21.png) |
| `semiautomatic.webp` | ARG 300 plus S.A.F., полуавтомат | 414 × 362, 32764 байт | [Страница](https://www.pilous.cz/ru/metall/stanki-lentochnopilnye/poluavtomaticheskie/arg-300-plus-s-a-f), [файл](https://www.pilous.cz/uploads/fe_catalog_product/300_plus_SAF_9fe4fdacc25b8144b1ccf7e440b9da98.png) |
| `automatic.webp` | ARG 300 CF-NC, автомат | 800 × 648, 60824 байт | [Страница](https://www.pilous.cz/ru/metall/stanki-lentochnopilnye/avtomaticheskie-chpu/arg-300-cf-nc-automat), [файл](https://www.pilous.cz/uploads/fe_catalog_product_photogallery/01_300_CF_NC_1ef6d0fd6c6caf11370becfb9e67a05a.png) |
| `roller.webp` | Рольганг серии L с упором | 756 × 455, 26600 байт | [Страница](https://www.pilous.cz/ru/metall/rolgangi/serija-l), [файл](https://www.pilous.cz/user_uploads/METAL/Dopravniky/L/dopravn%C3%ADk%20L%20-KO.jpg) |

Оптимизация: ImageMagick, удаление пустых полей `-trim +repage`, уменьшение до 800 × 800 без увеличения, `-strip -quality 86 -define webp:method=6`. Прозрачность PNG сохранена. CSS `grayscale(1)` согласует изображения с монохромными фото сайта, `object-fit: contain` сохраняет оборудование целиком. Файлы раздаются с самого сайта; внешние запросы к PILOUS при просмотре не выполняются.

## Четыре отдельные сцены для преимуществ

Созданы встроенным **ImageGen** по запросу заменить повторяющиеся фотографии. Это фотоиллюстрации услуг, не документальная съёмка предприятия. Файлы находятся в `dist/assets/images/benefits/` и не используются другими секциями:

| Сюжет | Основной файл, 1600 × 900 | Мобильный файл, 800 × 450 |
| --- | --- | --- |
| Размотка стальной ленты | `manufacture.webp` — 134110 байт | `manufacture-800.webp` — 48486 байт |
| Крупный план сварного стыка | `welding.webp` — 150606 байт | `welding-800.webp` — 52594 байт |
| Штангенциркуль и образец полотна | `selection.webp` — 74840 байт | `selection-800.webp` — 29700 байт |
| Упаковка готового заказа | `shipping.webp` — 104574 байт | `shipping-800.webp` — 38398 байт |

[Полный набор промптов и исходные файлы](benefit-image-prompts.json), включая уточнение положения губок штангенциркуля. CLI/API fallback не использовался. PNG-оригиналы сохранены в стандартной папке generated_images; выбранные WebP находятся в проекте. Оптимизация — ImageMagick `-auto-orient -resize 1600x>` и `800x>`, `-strip -quality 84 -define webp:method=6`. Браузер выбирает размер через `srcset`; кадрирование каждой сцены настроено отдельно.

## Главные фотографии сайта

Три фотографии созданы встроенным ImageGen для демонстрации. Они не являются съемкой предприятия клиента. Оптимизированы ImageMagick в WebP; оригиналы сохранены в стандартной папке generated_images.

## hero

Промпт:

Use case: product-mockup. Asset type: industrial website hero background photo, wide landscape 16:9. Realistic macro photograph of three broad steel bandsaw blade loops stacked horizontally, strong serrated teeth along upper edges, curved bands filling right two thirds of frame, blade loops curve towards left. Dark industrial workshop softly out of focus behind. Metallic silver steel with fine brushed textures, realistic tiny dark teeth. Soft monochrome lighting, graphite shadows. Lower band runs across bottom. Uppermost serrated blade near upper right. Left third dark unfocused workshop. Sharp photorealism, matches industrial catalog photo. No lettering, no text, no watermark, no branding, no website UI.

## production

Промпт:

Use case: photorealistic-natural. Asset type: industrial website wide production banner 16:9. Close up of a real metalworking bandsaw blade manufacturing and welding machine. Broad serrated steel band runs curving from left background into foreground lower right, precisely aligned industrial black and silver blocks and clamps and vertical mechanism above the band. Very detailed oily steel surfaces and hard worn machinery, muted graphite and silver, subtle warm reflections from workshop. Shallow depth of field. Photographic not 3D. Wide composition, equipment concentrated center and right. No lettering, no text, no watermark, no branding.

## delivery

Промпт:

Use case: photorealistic-natural. Asset type: industrial website wide delivery banner 16:9. Realistic photograph of a dark charcoal European semi truck with long box trailer driving towards camera at three quarter angle on winter country highway at sunset. Truck on right half, golden low sun behind far right, wet asphalt, thin snow at road edge, bare winter tree silhouettes. Left half dark treeline and road, composition reserved for text overlay later. Moody industrial logistics photography. No lettering, no logos, no text, no watermark, no UI.


Локальные файлы: dist/assets/images/bandsaw.webp, production.webp, delivery.webp. Все интерфейсные надписи, слои и линии выполнены HTML/CSS/SVG, не входят в фотографии.

Текущий шрифт с 15 октября 2026 года: **Golos Text**. Один локальный вариативный TTF с кириллицей, диапазон 400–900; обычный текст 400, кнопки 600, заголовки 650. Источник: [официальный репозиторий Google Fonts](https://github.com/google/fonts/tree/main/ofl/golostext), разработка — Paratype. SIL Open Font License 1.1 сохранена рядом с файлом в `dist/assets/fonts/GolosText-OFL.txt`. Сайт не запрашивает шрифты у внешних сервисов.

Roboto, Roboto Condensed и Oswald относятся к предыдущим вариантам; их файлы сохранены, но больше не подключаются.
