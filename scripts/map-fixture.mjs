/* Layout regressions isolate the external widget. contacts-check --live-map verifies Yandex itself. */
export async function isolateYandexMap(page) {
  await page.route('https://yandex.ru/map-widget/**',route=>route.fulfill({
    status:200,contentType:'text/html; charset=utf-8',
    body:'<!doctype html><html lang="ru"><meta charset="utf-8"><title>Map layout fixture</title><body style="margin:0;background:#EEEEEF"></body></html>',
  }));
}
