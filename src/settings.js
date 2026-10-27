import css from './settings.css.js';

class Settings extends HTMLElement {
	static get observedAttributes() {
		return ['step-duration'];
	}
	constructor() {
		super();

		this.drum = 1;
		this.control = 14;
		this.synth = 8;

		this.stepDuration = 0;

		this.shadow = this.attachShadow({ mode: 'open' });
		this.shadow.innerHTML = `
			<style>
				${css}
			</style>
			<section id="root"></section>
		`;
	}

	connectedCallback() {
		this.render();
		this.onclick = evt => {
			const channels = ['drum', 'control', 'synth'];
			const element = evt
				.composedPath()
				.find(
					e =>
						e.classList &&
						channels.some(channel => e.classList.contains(channel))
				);
			if (!element) {
				return;
			}
			const target = channels.find(channel =>
				element.classList.contains(channel)
			);
			this[target] = (this[target] % 16) + 1;
			this.dispatchEvent(
				new CustomEvent(`${target}-channel`, { detail: this[target] })
			);
			this.render();
		};
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (name === 'step-duration') {
			this.stepDuration = parseFloat(newVal);
		}
	}

	render() {
		this.shadow.getElementById('root').innerHTML = ['drum', 'control', 'synth']
			.map(
				channel => `
			<button type="button" class="${channel}" aria-label="${channel} MIDI channel ${
					this[channel]
				}, click to advance">
				<span class="label">${channel.toUpperCase()}</span>${String(
					this[channel]
				).padStart(2, '0')}
			</button>`
			)
			.join('');
	}
}

customElements.define('rbbrto-settings', Settings);
