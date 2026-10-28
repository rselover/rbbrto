const clamp = value => Math.max(0, Math.min(1, value));
export default class Expression {
	constructor() {
		this.values = { drum: { x: 0.5, y: 0.65 }, synth: { x: 0.5, y: 0.65 } };
	}
	set(instrument, x, y) {
		this.values[instrument] = { x: clamp(x), y: clamp(y) };
	}
	strength(instrument) {
		return 0.15 + 0.85 * this.values[instrument].y;
	}
	velocity(instrument) {
		return Math.round(127 * this.strength(instrument));
	}
	gate(instrument) {
		return 0.08 + 0.22 * (1 - this.values[instrument].y);
	}
	notes(instrument, pattern, step) {
		const index = ((step % pattern.length) + pattern.length) % pattern.length;
		const original = pattern[index],
			x = this.values[instrument].x;
		if (Math.abs(x - 0.5) < 0.02) return original;
		if (x < 0.5 && original !== null) {
			const keep = 0.15 + 1.7 * x;
			const ordinal = pattern.slice(0, index).filter(note => note !== null)
				.length;
			return Math.floor(ordinal * keep) > Math.floor((ordinal - 1) * keep)
				? original
				: null;
		}
		if (x > 0.5 && original === null) {
			const fill = (x - 0.5) * 2;
			const chance = ((index * 37 + 17) % 101) / 101;
			if (chance >= fill) return null;
			for (let n = 1; n <= pattern.length; n++) {
				const prior = pattern[(index - n + pattern.length) % pattern.length];
				if (prior !== null) return prior;
			}
		}
		return original;
	}
}

export function bindExpression(element, model, instrument, changed) {
	const pointers = new Set(),
		touches = new Set();
	const outside = element.ownerDocument?.defaultView;
	let watching = false;
	const render = () => {
		const { x, y } = model.values[instrument];
		element.style.setProperty('--x', `${x * 100}%`);
		element.style.setProperty('--y', `${(1 - y) * 100}%`);
		element.setAttribute(
			'aria-label',
			`${instrument} rhythm ${Math.round(
				x * 100
			)} percent, expression ${Math.round(
				y * 100
			)} percent. Use arrow keys to adjust.`
		);
		changed(model.values[instrument]);
	};
	const move = point => {
		const rect = element.getBoundingClientRect();
		model.set(
			instrument,
			(point.clientX - rect.left) / rect.width,
			1 - (point.clientY - rect.top) / rect.height
		);
		render();
	};
	const pointerMove = event => {
		if (pointers.has(event.pointerId)) move(event);
	};
	const unwatch = () => {
		if (!watching) return;
		outside.removeEventListener('pointermove', pointerMove);
		outside.removeEventListener('pointerup', pointerStop);
		outside.removeEventListener('pointercancel', pointerStop);
		outside.removeEventListener('blur', clear);
		watching = false;
	};
	const clear = () => {
		pointers.clear();
		touches.clear();
		unwatch();
	};
	const pointerStop = event => {
		pointers.delete(event.pointerId);
		if (!pointers.size) unwatch();
	};
	const watch = () => {
		if (!outside || watching) return;
		outside.addEventListener('pointermove', pointerMove);
		outside.addEventListener('pointerup', pointerStop);
		outside.addEventListener('pointercancel', pointerStop);
		outside.addEventListener('blur', clear);
		watching = true;
	};
	element.addEventListener('pointerdown', event => {
		if (event.pointerType !== 'touch' && event.button !== 0) return;
		if (event.pointerType !== 'touch') event.preventDefault();
		pointers.add(event.pointerId);
		move(event);
		try {
			element.setPointerCapture(event.pointerId);
		} catch (error) {
			watch();
		}
	});
	element.addEventListener('pointermove', pointerMove);
	element.addEventListener('pointerup', pointerStop);
	element.addEventListener('pointercancel', pointerStop);
	element.addEventListener('lostpointercapture', pointerStop);
	element.addEventListener(
		'touchstart',
		event => {
			event.preventDefault();
			for (const touch of Array.from(event.changedTouches)) {
				touches.add(touch.identifier);
				move(touch);
			}
		},
		{ passive: false }
	);
	element.addEventListener(
		'touchmove',
		event => {
			event.preventDefault();
			for (const touch of Array.from(event.changedTouches))
				if (touches.has(touch.identifier)) move(touch);
		},
		{ passive: false }
	);
	const touchStop = event => {
		event.preventDefault();
		for (const touch of Array.from(event.changedTouches))
			touches.delete(touch.identifier);
	};
	element.addEventListener('touchend', touchStop, { passive: false });
	element.addEventListener('touchcancel', touchStop, { passive: false });
	element.addEventListener('contextmenu', event => event.preventDefault());
	element.addEventListener('keydown', event => {
		const delta = {
			ArrowLeft: [-0.05, 0],
			ArrowRight: [0.05, 0],
			ArrowUp: [0, 0.05],
			ArrowDown: [0, -0.05]
		}[event.code];
		if (!delta) return;
		event.preventDefault();
		const { x, y } = model.values[instrument];
		model.set(instrument, x + delta[0], y + delta[1]);
		render();
	});
	render();
	return { render, clear };
}
