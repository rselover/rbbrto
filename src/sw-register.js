if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('sw.js', { scope: './', updateViaCache: 'none' })
		.then(registration => registration.update())
		.catch(error => {
			console.warn('Service worker registration failed', error);
		});
}
