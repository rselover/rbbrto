// Fetch each request once and retain successful GET responses for offline use.
const CACHE_NAME = 'pwabuilder-offline';

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => cache.add('index.html'))
	);
});

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET') {
		return;
	}

	// Extend the worker lifetime before the asynchronous fetch finishes.
	let finishCache;
	event.waitUntil(new Promise(resolve => { finishCache = resolve; }));
	event.respondWith(
		fetch(event.request)
			.then(response => {
				if (response.ok) {
					const copy = response.clone();
					caches.open(CACHE_NAME)
						.then(cache => cache.put(event.request, copy))
						.catch(error => console.warn('Offline cache update failed', error))
						.finally(finishCache);
				} else {
					finishCache();
				}
				return response;
			})
			.catch(async error => {
				finishCache();
				const cache = await caches.open(CACHE_NAME);
				const cached = await cache.match(event.request);
				if (cached) {
					return cached;
				}
				throw error;
			})
	);
});
