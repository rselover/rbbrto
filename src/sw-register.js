if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js', { scope: './' }).catch(error => {
		console.warn('Service worker registration failed', error);
	});
}
