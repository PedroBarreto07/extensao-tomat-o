const CACHE_NAME = 'ext-pedro-pwa-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' // Cache do Font Awesome
];

// Evento 'install': Cacheia os assets principais
self.addEventListener('install', (event) => {
    console.log('[SW] Evento de Instalação');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando assets principais');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => {
                console.error('[SW] Falha ao cachear assets', err);
            })
    );
});

// Evento 'activate': Limpa caches antigos
self.addEventListener('activate', (event) => {
    console.log('[SW] Evento de Ativação');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Limpando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Evento 'fetch': Responde com cache primeiro (Cache First)
self.addEventListener('fetch', (event) => {
    // Não cacheia requisições da API
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se encontrar no cache, retorna
                if (response) {
                    return response;
                }
                
                // Senão, busca na rede, clona e salva no cache
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    
                    // Clona a resposta para poder salvar no cache e retornar
                    const responseToCache = networkResponse.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        
                    return networkResponse;
                });
            })
            .catch(err => {
                console.error('[SW] Erro no Fetch:', err);
                // Pode retornar uma página offline aqui, se desejar
            })
    );
});