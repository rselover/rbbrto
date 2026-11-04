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
		this.locked = false;
		this.latched = new Map();
		this.selected = new Map();
	}

	group(note) {
		return this.notes.indexOf(note) < 7 ? 'drum' : 'synth';
	}
	active(note) {
		return [...this.held.values(), ...this.latched.values()].includes(note);
	}
	setLocked(locked) {
		const next = Boolean(locked);
		if (next === this.locked) return;
		this.locked = next;
		if (this.locked) {
			this.selected.clear();
			for (const note of this.held.values())
				this.selected.set(this.group(note), note);
			return;
		}
		const notes = new Set(this.latched.values());
		this.latched.clear();
		for (const note of notes) if (!this.active(note)) this.release(note);
		this.selected.clear();
		for (const note of this.held.values())
			this.selected.set(this.group(note), note);
	}
	start(source, note) {
		if (!this.notes.includes(note)) return;
		const previous = this.held.get(source);
		if (previous === note) return;
		const group = this.group(note);
		const wasActive = this.active(note);
		const selected = this.selected.get(group);
		const latched = this.latched.get(group);
		this.held.delete(source);
		this.held.set(source, note);
		this.selected.set(group, note);
		if (latched !== note) this.latched.delete(group);
		if (!wasActive || selected !== note) this.press(note);
		for (const old of new Set([previous, latched])) {
			if (old !== undefined && old !== note && !this.active(old))
				this.release(old);
		}
	}
	stop(source) {
		const note = this.held.get(source);
		if (note === undefined) return;
		this.held.delete(source);
		const group = this.group(note);
		if (this.locked && this.selected.get(group) === note)
			this.latched.set(group, note);
		if (!this.active(note)) this.release(note);
	}
	stopAll() {
		const notes = new Set([...this.held.values(), ...this.latched.values()]);
		this.held.clear();
		this.latched.clear();
		this.selected.clear();
		for (const note of notes) this.release(note);
		for (const clear of this.clearPointers) clear();
	}

	keyboard(target, page) {
		const down = event => {
			if (event.code === 'Escape') {
				event.preventDefault();
				this.stopAll();
				return;
			}
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
		const touches = new Map();
		const noteAt = event => {
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
			return notes[index];
		};
		const play = event =>
			this.start(pointers.get(event.pointerId), noteAt(event));
		const outside = element.ownerDocument?.defaultView;
		const move = event => {
			if (pointers.has(event.pointerId)) play(event);
		};
		const stop = event => {
			const source = pointers.get(event.pointerId);
			if (source) this.stop(source);
			pointers.delete(event.pointerId);
			if (!pointers.size) unwatch();
		};
		const up = event => {
			if (pointers.has(event.pointerId)) this.unlock();
			stop(event);
		};
		let watching = false;
		const unwatch = () => {
			if (!watching) return;
			outside.removeEventListener('pointermove', move);
			outside.removeEventListener('pointerup', up);
			outside.removeEventListener('pointercancel', stop);
			watching = false;
		};
		const watch = () => {
			if (!outside || watching) return;
			outside.addEventListener('pointermove', move);
			outside.addEventListener('pointerup', up);
			outside.addEventListener('pointercancel', stop);
			watching = true;
		};
		this.clearPointers.add(() => {
			pointers.clear();
			touches.clear();
			unwatch();
		});
		element.addEventListener('pointerdown', event => {
			if (event.pointerType !== 'touch' && event.button !== 0) return;
			if (event.pointerType !== 'touch') event.preventDefault();
			this.unlock();
			if (pointers.has(event.pointerId))
				this.stop(pointers.get(event.pointerId));
			pointers.set(event.pointerId, { touch: event.pointerType === 'touch' });
			// Capture is an optimization, not a prerequisite for starting a note.
			try {
				if (!element.setPointerCapture) throw new Error('No pointer capture');
				element.setPointerCapture(event.pointerId);
			} catch (error) {
				watch();
			}
			play(event);
		});
		element.addEventListener('pointermove', move);
		element.addEventListener('pointerup', up);
		element.addEventListener('pointercancel', stop);
		element.addEventListener('lostpointercapture', stop);

		// Native Touch Events preserve touch.identifier across multiple fingers
		// and continue targeting the starting bank without pointer capture.
		const touchMove = event => {
			event.preventDefault();
			for (const touch of Array.from(event.changedTouches)) {
				const source = touches.get(touch.identifier);
				if (source) this.start(source, noteAt(touch));
			}
		};
		element.addEventListener(
			'touchstart',
			event => {
				event.preventDefault();
				this.unlock();
				for (const touch of Array.from(event.changedTouches)) {
					if (!touches.has(touch.identifier)) touches.set(touch.identifier, {});
					this.start(touches.get(touch.identifier), noteAt(touch));
				}
				// WebKit may emit both streams. Transfer ownership without a second
				// note-on or a release gap, then ignore the redundant pointer stream.
				for (const [id, source] of pointers)
					if (source.touch) {
						this.stop(source);
						pointers.delete(id);
					}
				if (!pointers.size) unwatch();
			},
			{ passive: false }
		);
		element.addEventListener('touchmove', touchMove, { passive: false });
		const touchStop = event => {
			event.preventDefault();
			for (const touch of Array.from(event.changedTouches)) {
				const source = touches.get(touch.identifier);
				if (source) this.stop(source);
				touches.delete(touch.identifier);
			}
		};
		element.addEventListener(
			'touchend',
			event => {
				this.unlock();
				touchStop(event);
			},
			{ passive: false }
		);
		element.addEventListener('touchcancel', touchStop, { passive: false });
	}
}
