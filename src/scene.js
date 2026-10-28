const GREEN = '#00ef91';
const BLUE = '#528aff';
const RED = '#ff365b';
// Pattern indexes can be negative for bass notes below MIDI 53.
const wrap = (value, length) => ((value % length) + length) % length;
const toes = [
	{ x: -64, y: 171, rx: 17, ry: 25 },
	{ x: -39, y: 201, rx: 21, ry: 29 },
	{ x: -7, y: 218, rx: 24, ry: 33 },
	{ x: 32, y: 215, rx: 27, ry: 37 },
	{ x: 75, y: 187, rx: 35, ry: 47 }
];

const feet = {
	drum: { x: 287, y: 560, angle: 14, sx: 1.28, sy: -1.28 },
	synth: { x: 1295, y: 560, angle: -13, sx: -1.25, sy: -1.25 }
};

export function toeHome(instrument, index) {
	const f = feet[instrument];
	const toe = toes[index];
	const angle = (f.angle * Math.PI) / 180;
	return {
		x: f.x + toe.x * f.sx * Math.cos(angle) - toe.y * f.sy * Math.sin(angle),
		y: f.y + toe.x * f.sx * Math.sin(angle) + toe.y * f.sy * Math.cos(angle)
	};
}

function footTransform(instrument) {
	const f = feet[instrument];
	return `translate(${f.x} ${f.y}) rotate(${f.angle}) scale(${f.sx} ${f.sy})`;
}

function flyingToes(instrument) {
	const scale = Math.abs(feet[instrument].sx);
	return `<g id="${instrument}-flying-toes" aria-hidden="true">${toes
		.map((toe, index) => {
			const home = toeHome(instrument, index);
			return `<g class="flying-toe" data-flying-toe="${index}" transform="translate(${
				home.x
			} ${home.y})"><ellipse class="toe-outline" rx="${toe.rx *
				scale}" ry="${toe.ry * scale}"/><ellipse class="toe-inset" cy="${2 *
				scale}" rx="${(toe.rx - 8) * scale}" ry="${(toe.ry - 9) *
				scale}"/></g>`;
		})
		.join('')}</g>`;
}

function foot(id, transform) {
	return `<g id="${id}" transform="${transform}" class="foot">
        <path class="sole-outline" d="M-36 0 C-63 38-75 91-61 142 C-53 179-34 190-4 181 C28 171 66 159 69 129 C72 101 42 65 41 38 C41 15 29-13 4-16 C-15-19-28-12-36 0Z"/>
        <path class="sole-inset" d="M-26 7 C-48 45-60 91-47 133 C-39 158-25 169-5 163 C24 155 52 143 54 125 C55 103 29 67 27 40 C25 15 12-7-4-4 C-13-3-20 0-26 7Z"/>
        ${toes
					.map(
						(toe, i) =>
							`<g class="toe" data-toe="${i}"><ellipse cx="${toe.x}" cy="${
								toe.y
							}" rx="${toe.rx}" ry="${
								toe.ry
							}" class="toe-outline"/><ellipse cx="${toe.x}" cy="${toe.y +
								2}" rx="${toe.rx - 8}" ry="${toe.ry -
								9}" class="toe-inset"/></g>`
					)
					.join('')}
    </g>`;
}

function drum(x, y, w, h, id) {
	return `<g class="drum-piece" data-drum="${id}"><path d="M${x -
		w} ${y} v${h} a${w} 19 0 0 0 ${w *
		2} 0 v-${h}"/><ellipse cx="${x}" cy="${y +
		h}" rx="${w}" ry="19"/><ellipse cx="${x}" cy="${y}" rx="${w}" ry="19"/><path d="M${x -
		w +
		8} ${y + 7} v24 M${x + w - 8} ${y + 7} v24"/></g>`;
}

function bank(instrument, keys, offset) {
	return `<div class="bank-wrap ${instrument}-grip"><div class="bank-heading"><span><i></i>${
		instrument === 'drum' ? 'DRUMS' : 'SYNTH'
	}</span><small>HOLD / SLIDE</small></div><div class="pad-bank ${instrument}-bank" role="group" aria-label="${
		instrument === 'drum' ? 'Drum' : 'Synth'
	} patterns">${keys
		.split('')
		.map(
			(key, index) =>
				`<button type="button" data-pattern="${index +
					offset}" aria-label="${instrument} pattern ${index +
					1}, key ${key}" aria-pressed="false"><span>${key}</span><small>0${index +
					1}</small></button>`
		)
		.join('')}</div><span class="grip-caption">${
		instrument === 'drum' ? 'LEFT HAND' : 'RIGHT HAND'
	}</span></div>`;
}

export const sceneMarkup = `
<header class="masthead"><a class="wordmark" href="https://github.com/rselover/rbbrto" aria-label="Rbbrto source on GitHub">rbbrto</a><div class="audio-controls"><button id="audio-start" type="button" disabled>Loading sound…</button><span id="audio-message" role="status" aria-live="polite">Preparing instruments…</span></div><span class="live-status"><i></i> <span id="status">READY TO PLAY</span></span><button id="lock-toggle" type="button" aria-pressed="false" aria-label="Lock playback off"><span class="lock-icon" aria-hidden="true"></span><span id="lock-label">Unlocked</span></button></header>
<section class="cockpit" aria-label="Yoke pattern controls">
${bank('drum', 'ASDFGHJ', 0)}
<main class="stage">
<svg viewBox="0 0 1600 850" role="img" aria-labelledby="scene-title scene-desc">
<title id="scene-title">The Rbbrto foot orchestra</title><desc id="scene-desc">Upright neon feet send their toes down to strike a drum kit and synthesizer. A flower-crowned hula foot dances between them while patterns play.</desc>
<defs><filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<g id="sequence" transform="translate(584 44)">${Array.from(
	{ length: 32 },
	(_, i) =>
		`<g data-step="${i}" transform="translate(${(i % 8) * 55} ${Math.floor(
			i / 8
		) *
			48})"><rect class="step-box" width="47" height="40" rx="11"/><text class="step-note" x="23.5" y="29" text-anchor="middle">♪</text></g>`
).join('')}</g>
<text x="800" y="260" text-anchor="middle" class="micro-label" id="pattern-label">DRUM PATTERN 01</text>
<g id="drum-foot-position">${foot('drum-foot', footTransform('drum'))}</g>
<g id="synth-foot-position">${foot('synth-foot', footTransform('synth'))}</g>
<g class="kit" stroke="${GREEN}" fill="#070b09" stroke-width="7" stroke-linejoin="round">
<g class="hardware" fill="none" stroke="#eee6ff" stroke-width="6"><path d="M115 589 v192 m0-32-50 42 m50-42 50 42 M468 584 v196 m0-31-50 42 m50-42 50 42 M300 660 v96"/></g>
<g class="drum-piece" data-drum="0"><ellipse cx="127" cy="581" rx="82" ry="17"/><path d="M109 581 q18-10 36 0" fill="none"/></g>
<g class="drum-piece" data-drum="4"><path d="M414 592 h116 l-58-17Z M414 603 h116 l-58 17Z"/></g>
${drum(155, 682, 55, 80, 1)}${drum(255, 626, 50, 60, 2)}${drum(
	383,
	643,
	57,
	72,
	3
)}
<g class="drum-piece" data-drum="5"><ellipse cx="300" cy="742" rx="103" ry="89"/><path d="M269 657 C139 654 158 823 269 829" fill="none"/><ellipse cx="348" cy="769" rx="20" ry="23"/></g>
</g>
<g class="keyboard" stroke="${GREEN}" stroke-width="7" fill="#060a08"><path d="M1095 645 H1520 L1502 730 H1113Z"/><g stroke="#eae1ff" stroke-width="6">${Array.from(
	{ length: 12 },
	(_, i) =>
		`<path class="synth-key" data-key="${i}" d="M${1108 + i * 33} 618 h25"/>`
).join(
	''
)}</g><text x="1305" y="706" text-anchor="middle" fill="${RED}" stroke="none" class="synth-letter">B</text><path d="M1144 748 h330" stroke="${BLUE}" stroke-width="2" opacity=".35"/></g>
${flyingToes('drum')}${flyingToes('synth')}
<g id="hula-position" transform="translate(800 438)"><g id="hula-dancer">
${foot('hula-foot', 'translate(0 24) rotate(174) scale(.62)')}
<g class="skirt" stroke="${GREEN}" fill="none" stroke-width="5" stroke-linecap="round">${Array.from(
	{ length: 15 },
	(_, i) => {
		const x = -57 + i * 8;
		return `<path d="M${x * 0.64} 11 Q${x} 66 ${x * 1.5} ${99 -
			Math.abs(x) * 0.2}"/>`;
	}
).join('')}</g>
<g class="flowers">${[-43, -22, 0, 22, 43]
	.map(
		(x, i) =>
			`<g transform="translate(${x} ${9 + Math.abs(x) * -0.13})" fill="${
				i % 2 ? '#f2eaff' : RED
			}" stroke="#090909" stroke-width="1.5">${Array.from(
				{ length: 5 },
				(_, p) =>
					`<ellipse rx="7" ry="11" cy="-6" transform="rotate(${p * 72})"/>`
			).join('')}<circle r="3" fill="${GREEN}"/></g>`
	)
	.join('')}</g>
</g><g class="dance-lines" stroke="${GREEN}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-96-13 q-23 21-7 43 M-118-28 q-28 29-12 63 M95-13 q23 21 7 43 M118-28 q28 29 12 63"/></g></g>
<g class="pattern-lamps" transform="translate(582 650)" stroke="${BLUE}" stroke-width="6" fill="none"><rect width="436" height="103" rx="27"/>${Array.from(
	{ length: 7 },
	(_, i) =>
		`<ellipse data-lamp="${i}" cx="${40 +
			i * 59}" cy="51" rx="23" ry="29" stroke="${GREEN}"/>`
).join('')}</g>
<text x="290" y="235" text-anchor="middle" class="instrument-label">01 / PERCUSSION</text><text x="1305" y="235" text-anchor="middle" class="instrument-label">02 / SYNTHESIZER</text>
<text x="800" y="597" text-anchor="middle" class="micro-label hula-caption">GOOD VIBRATIONS ONLY</text>
</svg>
</main>
${bank('synth', 'QWERTYU', 7)}
<div class="transport"><span class="tempo-label">TEMPO</span><label><input id="tempo" type="number" min="30" max="240" value="125" aria-label="Tempo in beats per minute"/><span>BPM</span></label><span class="transport-note" id="play-hint">HOLD BOTH GRIPS TO DUET</span><button id="stop-all" type="button">Stop</button></div>
</section>
<section class="performance-drawer" aria-label="Performance panel"><button id="drawer-toggle" type="button" aria-controls="drawer-content" aria-expanded="false">Rhythm + expression ↑</button><div id="drawer-content" class="drawer-content"><section class="expression-controls" aria-label="Live rhythm and expression">
${['drum', 'synth']
	.map(
		instrument =>
			`<div class="expression-panel ${instrument}-expression"><div class="expression-heading"><span>${
				instrument === 'drum' ? 'DRUM' : 'SYNTH'
			} / PLAY THE FEEL</span><button type="button" data-reset="${instrument}" aria-label="Reset ${instrument} rhythm and expression">Reset</button></div><div class="expression-pad" data-expression="${instrument}" role="group" tabindex="0"><span class="axis top">STRONG</span><span class="axis bottom">SOFT</span><span class="axis left">SPARSE</span><span class="axis right">FILL</span><i class="expression-cursor" aria-hidden="true"></i></div><output data-expression-output="${instrument}">Original rhythm · Expression 65%</output><p>Drag ↔ rhythm · ↕ expression. Lock a pattern to play hands-free.</p></div>`
	)
	.join('')}
</section>
<footer><button id="motion-toggle" type="button" aria-pressed="true">Motion on</button><rbbrto-settings></rbbrto-settings><span class="footer-hint">TOUCH · KEYS · MIDI</span></footer></div></section>`;

export default class Scene {
	constructor(root) {
		this.root = root;
		this.motions = new Map();
		this.stepDuration = 0.12;
		this.portrait =
			typeof matchMedia === 'function'
				? matchMedia('(max-width: 600px) and (orientation: portrait)')
				: null;
		this.layout = () =>
			this.root
				.querySelector('svg')
				.setAttribute(
					'viewBox',
					this.portrait?.matches ? '520 0 560 1500' : '0 0 1600 850'
				);
		this.layout();
		this.connectLayout();
		this.setMotionEnabled(
			typeof matchMedia !== 'function' ||
				!matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}
	connectLayout() {
		if (this.layoutListening) return;
		this.portrait?.addEventListener?.('change', this.layout);
		this.layoutListening = true;
		this.layout();
	}
	disconnectLayout() {
		this.portrait?.removeEventListener?.('change', this.layout);
		this.layoutListening = false;
	}
	clearHighlights(instrument) {
		this.root
			.querySelectorAll(instrument === 'drum' ? '[data-drum]' : '[data-key]')
			.forEach(el => el.classList.remove('struck'));
	}

	setMotionEnabled(enabled) {
		this.motionEnabled = enabled;
		for (const motion of this.motions.values()) this.finish(motion);
		this.motions.clear();
		this.root
			.querySelector('svg')
			.classList.toggle('motion-disabled', !enabled);
		const button = this.root.querySelector('#motion-toggle');
		button.textContent = enabled ? 'Motion on' : 'Motion off';
		button.setAttribute('aria-pressed', String(enabled));
	}
	finish(motion) {
		motion.source.classList.remove('struck');
		motion.flying.classList.remove('flying');
		motion.flying.setAttribute(
			'transform',
			`translate(${motion.home.x} ${motion.home.y})`
		);
	}
	tick(timestamp) {
		for (const [key, motion] of this.motions) {
			if (motion.started === null) motion.started = timestamp;
			const progress = Math.min(
				1,
				(timestamp - motion.started) / motion.duration
			);
			if (progress >= 1) {
				this.finish(motion);
				this.motions.delete(key);
				continue;
			}
			const travel =
				progress < 0.45
					? progress / 0.45
					: progress < 0.55
					? 1
					: (1 - progress) / 0.45;
			const eased = travel * travel * (3 - 2 * travel);
			const x =
				(progress < 0.55 ? motion.from.x : motion.home.x) +
				(motion.x - (progress < 0.55 ? motion.from.x : motion.home.x)) * eased;
			const y =
				(progress < 0.55 ? motion.from.y : motion.home.y) +
				(motion.y - (progress < 0.55 ? motion.from.y : motion.home.y)) * eased;
			motion.current = { x, y };
			motion.flying.setAttribute('transform', `translate(${x} ${y})`);
		}
	}
	clear(instrument) {
		for (const [key, motion] of this.motions)
			if (motion.instrument === instrument) {
				this.finish(motion);
				this.motions.delete(key);
			}
		this.root
			.querySelectorAll(
				`#${instrument}-foot .toe, #${instrument}-flying-toes .flying-toe, ${
					instrument === 'drum' ? '[data-drum]' : '[data-key]'
				}`
			)
			.forEach(el => {
				el.classList.remove('struck');
				el.classList.remove('flying');
			});
	}
	strike(instrument, note, x, surfaceY) {
		if (!this.motionEnabled) return;
		const index = wrap(note, 5);
		const toe = this.root.querySelector(
			`#${instrument}-foot [data-toe="${index}"]`
		);
		const flying = this.root.querySelector(
			`#${instrument}-flying-toes [data-flying-toe="${index}"]`
		);
		const scale = Math.abs(feet[instrument].sx);
		toe.classList.add('struck');
		const home = toeHome(instrument, index);
		const y = surfaceY - toes[index].ry * scale + 7;
		const from = this.motions.get(flying)?.current || home;
		flying.setAttribute('transform', `translate(${from.x} ${from.y})`);
		this.motions.set(flying, {
			instrument,
			source: toe,
			flying,
			home,
			x,
			y,
			from,
			current: from,
			duration: Math.max(240, this.stepDuration * 1000),
			started: null
		});
		flying.classList.add('flying');
	}

	drum(notes) {
		this.clearHighlights('drum');
		notes.forEach(note => {
			const targets = [
				[127, 581],
				[155, 682],
				[255, 626],
				[383, 643],
				[472, 592],
				[300, 742]
			];
			const [x, y] = targets[wrap(note, 6)];
			this.strike('drum', note, x, y);
			this.root
				.querySelector(`[data-drum="${wrap(note, 6)}"]`)
				.classList.add('struck');
		});
	}
	synth(notes) {
		this.clearHighlights('synth');
		notes.forEach(note => {
			this.strike('synth', note, 1120 + wrap(note + 53, 12) * 33, 618);
			this.root
				.querySelector(`[data-key="${wrap(note + 53, 12)}"]`)
				.classList.add('struck');
		});
	}
	update({
		pattern,
		step,
		patternIndex,
		playing,
		drumPlaying,
		synthPlaying,
		drumPattern,
		synthPattern,
		stepDuration = 0.12
	}) {
		this.stepDuration = stepDuration;
		const svg = this.root.querySelector('svg');
		svg.classList.toggle('playing', playing);
		this.root.querySelector('#status').textContent = playing
			? 'SOLE IN SESSION'
			: 'READY TO PLAY';
		this.root.querySelector('.live-status').classList.toggle('on', playing);
		this.root.querySelector('#pattern-label').textContent = `${
			patternIndex < 7 ? 'DRUM' : 'SYNTH'
		} PATTERN ${String((patternIndex % 7) + 1).padStart(2, '0')}`;
		this.root.querySelectorAll('[data-step]').forEach((el, i) => {
			el.style.display = i < pattern.length ? '' : 'none';
			el.classList.toggle(
				'has-note',
				pattern[i] !== null && i < pattern.length
			);
			el.classList.toggle('current', playing && i === step % pattern.length);
		});
		this.root
			.querySelectorAll('[data-lamp]')
			.forEach((el, i) => el.classList.toggle('lit', i === patternIndex % 7));
		this.root.querySelectorAll('[data-pattern]').forEach(el => {
			const index = Number(el.dataset.pattern);
			const active =
				index < 7
					? drumPlaying && index === drumPattern
					: synthPlaying && index === synthPattern;
			el.classList.toggle('active', active);
			el.setAttribute('aria-pressed', String(active));
		});
	}
}
