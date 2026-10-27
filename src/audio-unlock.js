// Keep resume() inside the original user event: never wait for an import first.
export default class AudioUnlock {
	constructor(load, changed = () => {}) {
		this.loader = load;
		this.changed = changed;
		this.tone = null;
		this.loading = null;
		this.phase = 'loading';
		this.request = 0;
	}
	set(phase) {
		this.phase = phase;
		this.changed(phase);
	}
	load() {
		if (this.loading) return this.loading;
		this.set('loading');
		this.loading = Promise.resolve()
			.then(this.loader)
			.then(tone => {
				this.tone = tone;
				tone.context.rawContext?.addEventListener?.('statechange', () =>
					this.sync()
				);
				this.sync();
				return tone;
			})
			.catch(error => {
				console.warn('Sound could not load', error);
				this.set('error');
				return null;
			})
			.finally(() => {
				this.loading = null;
			});
		return this.loading;
	}
	sync() {
		this.set(this.tone?.context.state === 'running' ? 'running' : 'ready');
	}
	unlock() {
		if (!this.tone) return Promise.resolve(false);
		if (this.tone.context.state === 'running') {
			this.sync();
			return Promise.resolve(true);
		}
		const request = ++this.request;
		let resume;
		try {
			// Called synchronously from click, keydown, or touch pointerup.
			resume = this.tone.start();
		} catch (error) {
			this.set('blocked');
			return Promise.resolve(false);
		}
		this.set('starting');
		// A blocked resume can stay pending on Safari; another tap must be allowed.
		return Promise.resolve(resume)
			.then(() => {
				if (request !== this.request)
					return this.tone.context.state === 'running';
				const running = this.tone.context.state === 'running';
				this.set(running ? 'running' : 'blocked');
				return running;
			})
			.catch(() => {
				if (request === this.request) this.set('blocked');
				return false;
			});
	}
}
