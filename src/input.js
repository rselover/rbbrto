// Seven drum patterns and seven synth patterns, in control-note order.
export const KEY_CODES = [
	'KeyA',
	'KeyS',
	'KeyD',
	'KeyF',
	'KeyG',
	'KeyH',
	'KeyJ',
	'KeyQ',
	'KeyW',
	'KeyE',
	'KeyR',
	'KeyT',
	'KeyY',
	'KeyU'
];

export default class PatternInput {
	constructor(notes, press, release, unlock = () => {}) {
		this.notes = notes;
		this.press = press;
		this.release = release;
		this.unlock = unlock;
		this.held = new Map();
		this.clearPointers = new Set();
	}

	start(source, note) {
		const previous = this.held.get(source);
		if (previous === note) return;
		const alreadyHeld = [...this.held.values()].includes(note);
		this.held.set(source, note);
		// Press first so sliding preserves playback and the other playhead.
		if (!alreadyHeld) this.press(note);
		if (previous !== undefined && ![...this.held.values()].includes(previous)) {
			this.release(previous);
		}
	}

	stop(source) {
		const note = this.held.get(source);
		this.held.delete(source);
		if (note !== undefined && ![...this.held.values()].includes(note)) {
			this.release(note);
		}
	}

	stopAll() {
		for (const source of this.held.keys()) this.stop(source);
		for (const clear of this.clearPointers) clear();
	}

	keyboard(target, page) {
		const down = event => {
			if (event.ctrlKey || event.metaKey || event.altKey || event.repeat)
				return;
			if (
				event
					.composedPath()
					.some(
						element =>
							element.isContentEditable ||
							/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName)
					)
			)
				return;
			const index = KEY_CODES.indexOf(event.code);
			if (index === -1) return;
			event.preventDefault();
			this.unlock();
			this.start(event.code, this.notes[index]);
		};
		const up = event => {
			if (!this.held.has(event.code)) return;
			event.preventDefault();
			this.stop(event.code);
		};
		const blur = () => this.stopAll();
		const visibility = () => {
			if (page.hidden) blur();
		};
		target.addEventListener('keydown', down);
		target.addEventListener('keyup', up);
		target.addEventListener('blur', blur);
		page.addEventListener('visibilitychange', visibility);
		return () => {
			blur();
			target.removeEventListener('keydown', down);
			target.removeEventListener('keyup', up);
			target.removeEventListener('blur', blur);
			page.removeEventListener('visibilitychange', visibility);
		};
	}

	pad(element, notes) {
		element.addEventListener('contextmenu', event => event.preventDefault());
		const pointers = new Map();
		const play = event => {
			const buttons = element.querySelectorAll
				? [...element.querySelectorAll('[data-pattern]')]
				: [];
			let index = 0;
			if (buttons.length === notes.length) {
				// Use the actual button geometry: the grips have multiple rows and gaps.
				let nearest = Infinity;
				buttons.forEach((button, i) => {
					const rect = button.getBoundingClientRect();
					const dx = Math.max(
						rect.left - event.clientX,
						0,
						event.clientX - rect.right
					);
					const dy = Math.max(
						rect.top - event.clientY,
						0,
						event.clientY - rect.bottom
					);
					const distance = dx * dx + dy * dy;
					if (distance < nearest) {
						nearest = distance;
						index = i;
					}
				});
			} else {
				const rect = element.getBoundingClientRect();
				index = Math.max(
					0,
					Math.min(
						notes.length - 1,
						Math.floor(
							((event.clientX - rect.left) / rect.width) * notes.length
						)
					)
				);
			}
			this.start(pointers.get(event.pointerId), notes[index]);
		};
		this.clearPointers.add(() => pointers.clear());
		element.addEventListener('pointerdown', event => {
			if (event.button !== 0) return;
			event.preventDefault();
			this.unlock();
			if (pointers.has(event.pointerId))
				this.stop(pointers.get(event.pointerId));
			pointers.set(event.pointerId, {});
			try {
				element.setPointerCapture(event.pointerId);
			} catch (error) {
				this.stop(pointers.get(event.pointerId));
				pointers.delete(event.pointerId);
				return;
			}
			play(event);
		});
		element.addEventListener('pointermove', event => {
			if (pointers.has(event.pointerId)) play(event);
		});
		const stop = event => {
			const source = pointers.get(event.pointerId);
			if (source) this.stop(source);
			pointers.delete(event.pointerId);
		};
		element.addEventListener('pointerup', event => {
			if (pointers.has(event.pointerId)) this.unlock();
			stop(event);
		});
		// iOS also recognizes touchend; this is harmless after pointerup succeeds.
		element.addEventListener('touchend', () => this.unlock(), {
			passive: true
		});
		element.addEventListener('pointercancel', stop);
		element.addEventListener('lostpointercapture', stop);
	}
}
