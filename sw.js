// Service Worker для PWA "SMM"
// Минимальная версия — достаточна для прохождения проверки браузера

const CACHE_NAME = 'smm-pwa-v1';

// Устанавливаем Service Worker
self.addEventListener('install', (event) => {
  // Активируем сразу, не дожидаясь закрытия старых вкладок
  self.skipWaiting();
});

// Активация — очищаем старые кэши при обновлении
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Берём контроль над всеми открытыми вкладками
  self.clients.claim();
});

// Стратегия: Network First (сначала сеть, потом кэш)
// Подходит для динамического контента
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Кэшируем успешные ответы
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сеть недоступна — отдаём из кэша
        return caches.match(event.request);
      })
  );
});
