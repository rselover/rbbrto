export default class PerformanceDrawer {
	constructor(
		root,
		query = typeof matchMedia === 'function'
			? matchMedia('(max-height: 550px) and (orientation: landscape)')
			: null
	) {
		this.root = root;
		this.query = query;
		this.open = false;
		this.startY = null;
		this.suppressClick = 0;
		this.panel = root.querySelector('.performance-drawer');
		this.button = root.querySelector('#drawer-toggle');
		this.content = root.querySelector('#drawer-content');
		this.change = () => this.update();
		this.button.addEventListener('click', () => {
			if (Date.now() >= this.suppressClick) this.setOpen(!this.open);
		});
		const begin = point => {
			this.startY = point.clientY;
		};
		const end = point => {
			if (this.startY === null) return false;
			const delta = point.clientY - this.startY;
			this.startY = null;
			if (Math.abs(delta) < 24) return false;
			this.suppressClick = Date.now() + 500;
			this.setOpen(delta < 0);
			return true;
		};
		this.button.addEventListener('pointerdown', event => {
			if (event.pointerType !== 'touch' && event.button !== 0) return;
			begin(event);
			try {
				this.button.setPointerCapture(event.pointerId);
			} catch (error) {}
		});
		this.button.addEventListener('pointerup', event => {
			if (end(event)) event.preventDefault();
		});
		this.button.addEventListener('pointercancel', () => {
			this.startY = null;
		});
		this.button.addEventListener(
			'touchstart',
			event => {
				if (event.changedTouches.length) begin(event.changedTouches[0]);
			},
			{ passive: true }
		);
		this.button.addEventListener(
			'touchmove',
			event => {
				if (
					this.startY !== null &&
					event.changedTouches.length &&
					Math.abs(event.changedTouches[0].clientY - this.startY) > 12
				)
					event.preventDefault();
			},
			{ passive: false }
		);
		this.button.addEventListener(
			'touchend',
			event => {
				if (event.changedTouches.length && end(event.changedTouches[0]))
					event.preventDefault();
			},
			{ passive: false }
		);
		this.button.addEventListener('touchcancel', () => {
			this.startY = null;
		});
		this.panel.addEventListener('keydown', event => {
			if (event.code === 'Escape') this.setOpen(false);
		});
		this.connect();
	}
	connect() {
		if (this.connected) return;
		this.query?.addEventListener?.('change', this.change);
		this.connected = true;
		this.update();
	}
	disconnect() {
		this.query?.removeEventListener?.('change', this.change);
		this.connected = false;
		this.startY = null;
	}
	setOpen(open) {
		this.open = Boolean(open);
		this.update();
		if (
			this.query?.matches &&
			!this.open &&
			this.content.contains?.(this.root.activeElement)
		)
			this.button.focus();
	}
	update() {
		const compact = Boolean(this.query?.matches),
			hidden = compact && !this.open;
		this.panel.classList.toggle('is-open', compact && this.open);
		this.panel.setAttribute('data-mode', compact ? 'drawer' : 'inline');
		this.button.setAttribute('aria-expanded', String(!hidden));
		this.button.textContent = this.open
			? 'Hide pads ↓'
			: 'Rhythm + expression ↑';
		this.content.inert = hidden;
		this.content.setAttribute('aria-hidden', String(hidden));
	}
}
