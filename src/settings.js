import css from './settings.css.js';

class Settings extends HTMLElement {
	static get observedAttributes() {
		return ['step-duration'];
	}
	constructor() {
		super();

		this.drum = 1;
		this.control = 4;
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
			const element = evt.composedPath().find(
				e => e.classList && channels.some(channel => e.classList.contains(channel))
			);
			if (!element) {
				return;
			}
			const target = channels.find(channel => element.classList.contains(channel));
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
		this.shadow.getElementById('root').innerHTML = `
			<div class="drum">
				<span class="i">y</span>
				${this._numToSpans(this.drum)}
			</div>
			<div class="control">
				<span class="i">z</span>
				${this._numToSpans(this.control)}
			</div>
			<div class="synth">
				<span class="i">x</span>
				${this._numToSpans(this.synth)}
			</div>
		`;
	}
	_numToSpans(num) {
		if (num < 10) {
			num = `0${num}`;
		} else {
			num = num.toString();
		}
		return num
			.split('')
			.map(n => `<span class="n${n}">${n}</span>`)
			.join('');
	}
}

customElements.define('rbbrto-settings', Settings);

