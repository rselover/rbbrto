import { drumPatterns, synthPatterns } from './patterns.js';
import MIDI, { whiteKeys, idxToMidi } from './midi.js';
import PatternInput from './input.js';
import AudioUnlock from './audio-unlock.js';
import Expression, { bindExpression } from './expression.js';
import PerformanceDrawer from './drawer.js';
import Scene, { sceneMarkup } from './scene.js';
import css from './rbbrto.css.js';
import { asArrayLike, stringBool } from './utils.js';

// Private symbols to not expose every variable to the outside
const [
	$playback,
	$timer,
	$displayInstrument,
	$bpm,
	$stepDuration,
	$midi,
	$controlChannel,
	$noteScheduled
] = [
	Symbol('playback'),
	Symbol('timer'),
	Symbol('displayInstrument'),
	Symbol('bpm'),
	Symbol('stepDuration'),
	Symbol('midi'),
	Symbol('controlChannel'),
	Symbol('noteScheduled')
];

const [
	$drumPlayback,
	$drumPlayhead,
	$drumPattern,
	$activeDrumNotes,
	$drumChannel
] = [
	Symbol('drumPlayback'),
	Symbol('drumPlayhead'),
	Symbol('drumPattern'),
	Symbol('activeDrumNotes'),
	Symbol('drumChannel')
];

const [
	$synthPlayback,
	$synthPlayhead,
	$synthPattern,
	$activeSynthNotes,
	$synthChannel
] = [
	Symbol('synthPlayback'),
	Symbol('synthPlayhead'),
	Symbol('synthPattern'),
	Symbol('activeSynthNotes'),
	Symbol('synthChannel')
];

class Rbbrto extends HTMLElement {
	static get observedAttributes() {
		return ['control-channel', 'drum-channel', 'synth-channel', 'bpm'];
	}
	constructor() {
		super();

		this._printWelcomeText();

		// Set some defaults
		this[$playback] = false;
		this[$drumPlayback] = false;
		this[$synthPlayback] = false;
		this[$bpm] = parseFloat(40);
		this[$drumPattern] = 0;
		this[$synthPattern] = 0;
		this[$activeDrumNotes] = null;
		this[$activeSynthNotes] = null;
		this[$controlChannel] = 16;
		this[$drumChannel] = 1;
		this[$synthChannel] = 2;
		this[$displayInstrument] = 'drum';

		// Look for MIDI devices
		this._initMIDI();

		// Show the SVG
		this.shadow = this.attachShadow({ mode: 'open' });

		this.shadow.innerHTML = `<style>${css}</style>${sceneMarkup}`;
        this._scene = new Scene(this.shadow);
        this._drawer = new PerformanceDrawer(this.shadow);
		this._expression = new Expression();
		this._expressionBindings = ['drum', 'synth'].map(instrument => {
			const binding = bindExpression(
				this.shadow.querySelector(`[data-expression="${instrument}"]`),
				this._expression,
				instrument,
				({ x, y }) => {
					const rhythm =
						Math.abs(x - 0.5) < 0.02
							? 'Original rhythm'
							: x < 0.5
							? `Sparse ${Math.round((0.5 - x) * 200)}%`
							: `Fill ${Math.round((x - 0.5) * 200)}%`;
					this.shadow.querySelector(
						`[data-expression-output="${instrument}"]`
					).textContent = `${rhythm} · Expression ${Math.round(y * 100)}%`;
				}
			);
			this.shadow
				.querySelector(`[data-reset="${instrument}"]`)
				.addEventListener('click', () => {
					this._expression.set(instrument, 0.5, 0.65);
					binding.render();
				});
			return binding;
		});
		this.shadow.querySelector('#lock-toggle').addEventListener('click', () => {
			this._input.setLocked(!this._input.locked);
			this._renderLock();
		});
		this.shadow
			.querySelector('#stop-all')
			.addEventListener('click', () => this._input.stopAll());
		this.shadow
			.querySelector('#motion-toggle')
			.addEventListener('click', () =>
				this._scene.setMotionEnabled(!this._scene.motionEnabled)
			);
		this._audio = new AudioUnlock(
			async () => {
				const Tone = await import('https://cdn.jsdelivr.net/npm/tone@14.8.49/+esm');
				this._Tone = Tone;
				this._toneSynth = new Tone.PolySynth().toDestination();
				this._toneDrum = new Tone.MembraneSynth().toDestination();
				return Tone;
			},
			phase => this._renderAudioState(phase)
		);
		this.shadow.querySelector('#audio-start').addEventListener('click', () => {
			if (this._audio.phase === 'error') this._audio.load();
			else this._unlockAudio();
		});
		this._audio.load();

		this.shadow.querySelector('#tempo').addEventListener('change', event => {
			const value = Number(event.target.value);
			if (Number.isFinite(value) && value >= 30 && value <= 240)
				this.bpm = value;
			event.target.value = this.bpm;
		});
	}

	// Debug
	debugStart({ drum = 0, synth = 7, both = false } = {}) {
		this.drumPattern = drum;
		this.synthPattern = synth;
		this.playback = true;
		if (both) {
			this[$drumPlayback] = true;
			this[$synthPlayback] = true;
			this[$displayInstrument] = 'drum';
		} else {
			this[$drumPlayback] = true;
			this[$synthPlayback] = false;
			this[$displayInstrument] = 'drum';
		}
		this._updatePatternUI();
	}

	// We're in the DOM
	connectedCallback() {
        this._scene.connectLayout();
        this._drawer.connect();
		this._resetDrums();
		this._idleDrums();

		this._resetSynths();
		this._idleSynths();

		this._updatePatternUI();

		// Adjust the MIDI channels if they are sent from the settings
		const settings = this.shadow.querySelector('rbbrto-settings');
		if (!this._settingsBound) {
			settings.addEventListener(
				'drum-channel',
				evt => (this.drumChannel = evt.detail)
			);
			settings.addEventListener(
				'control-channel',
				evt => (this.controlChannel = evt.detail)
			);
			settings.addEventListener(
				'synth-channel',
				evt => (this.synthChannel = evt.detail)
			);
			this._settingsBound = true;
		}

		if (!this._padsInitialized) {
			this._initPads();
			this._padsInitialized = true;
		}
		if (!this._disconnectKeyboard) {
			this._disconnectKeyboard = this._input.keyboard(window, document);
		}
	}

	attributeChangedCallback(name, oldVal, newVal) {
		// Replace `something-name` with `somethingName`
		name = name.replace(/-([a-z])/g, function(g) {
			return g[1].toUpperCase();
		});
		this[name] = newVal;
	}

	/**
	 * Start or stop playback
	 * @param  {boolean} playback
	 */
	set playback(playback) {
		playback = stringBool(playback);
		if (this[$playback] !== playback) {
			// Reset all playheads and start playback
			// (won't do anything unless there's a pattern started on drums or synth)
			if (playback) {
				this[$drumPlayhead] = 0;
				this[$synthPlayhead] = 0;
				this[$timer] = null;
				// Play the first note
				this[$noteScheduled] = true;
				// Start the main loop
				this._beatFrame = requestAnimationFrame(this._playBeat.bind(this));
			} else {
				cancelAnimationFrame(this._beatFrame);
				this._stopInstrument('drum');
				this._stopInstrument('synth');
			}
			this[$playback] = playback;
			if (!playback) {
				this[$drumPlayback] = false;
				this[$synthPlayback] = false;
				this._resetDrums();
				this._idleDrums();
				this._resetSynths();
				this._idleSynths();
				this[$midi].noteTimestamp = 0;
				this[$timer] = null;
				this[$noteScheduled] = false;
			}
			this._updatePatternUI();
		}
	}
	get playback() {
		return this[$playback];
	}

	/**
	 * Set the current drum pattern
	 * @param  {int|string} drumPattern
	 */
	set drumPattern(drumPattern) {
		if (this[$drumPattern] !== parseInt(drumPattern, 10)) {
			this[$drumPattern] = parseInt(drumPattern, 10);
			// Make the drums show up in the middle pattern view
			this[$displayInstrument] = 'drum';
			this._updatePatternUI();
		}
	}
	get drumPattern() {
		return this[$drumPattern];
	}

	/**
	 * Set the current synth pattern
	 * @param  {int|string} synthPattern
	 */
	set synthPattern(synthPattern) {
		if (this[$synthPattern] !== parseInt(synthPattern, 10)) {
			this[$synthPattern] = parseInt(synthPattern, 10);
			// Make the synth show up in the middle pattern view
			this[$displayInstrument] = 'synth';
			this._updatePatternUI();
		}
	}
	get synthPattern() {
		return this[$synthPattern];
	}

	/**
	 * Set the BPM
	 * @param  {int|string} bpm
	 */

	set bpm(bpm) {
		if (Math.abs(parseFloat(this[$bpm]) - parseFloat(bpm)) > Number.EPSILON) {
			this[$bpm] = parseFloat(bpm);
			this[$stepDuration] = 60.0 / this[$bpm] / 4.0;
			this.setAttribute('bpm', parseFloat(bpm));
			this.shadow.querySelector('#tempo').value = this[$bpm];
			const svg = this.shadow.querySelector('svg');
			if (svg) {
				svg.style.setProperty('--beat-s', this[$stepDuration] + 's');
			}
			const settings = this.shadow.querySelector('rbbrto-settings');
			if (settings) {
				settings.setAttribute('step-duration', this[$stepDuration]);
			}
		}
	}

	get bpm() {
		return this[$bpm];
	}

	/**
	 * Set the channel of the control input
	 * @param  {int|string} controlChannel
	 */
	set controlChannel(controlChannel) {
		if (this[$controlChannel] !== parseInt(controlChannel, 10)) {
			this[$controlChannel] = parseInt(controlChannel, 10);
			this.setAttribute('control-channel', controlChannel);
		}
	}
	get controlChannel() {
		return this[$controlChannel];
	}

	/**
	 * Set the channel of the drum output
	 * @param  {int|string} drumChannel
	 */
	set drumChannel(drumChannel) {
		if (this[$drumChannel] !== parseInt(drumChannel, 10)) {
			this[$drumChannel] = parseInt(drumChannel, 10);
			this.setAttribute('drum-channel', drumChannel);
		}
	}
	get drumChannel() {
		return this[$drumChannel];
	}

	/**
	 * Set the channel of the synth output
	 * @param  {int|string} synthChannel
	 */
	set synthChannel(synthChannel) {
		if (this[$synthChannel] !== parseInt(synthChannel, 10)) {
			this[$synthChannel] = parseInt(synthChannel, 10);
			this.setAttribute('synth-channel', synthChannel);
		}
	}
	get synthChannel() {
		return this[$synthChannel];
	}

	/**
	 * The main loop to play the patterns
	 * @param  {DOMHighResTimeStamp} timestamp Passed by requestAnimationFrame()
	 */
	_playBeat(timestamp) {
		let drumPattern = drumPatterns[this[$drumPattern]];
		let synthPattern = synthPatterns[this[$synthPattern]];

		// If there's a note scheduled to play, we'll play it
		if (this[$noteScheduled]) {
			// Timer is adjusted to be in line with the beat
			// (not all BPM's can be divided into 1000/60 ms intervals)
			this[$timer] = this[$midi].noteTimestamp || timestamp;
			this[$noteScheduled] = false;

			// Time to play a note, because the timer has been reset
			if (this[$drumPlayback]) {
				this._playDrumNotes(
					this._patternNotes('drum', drumPattern, this[$drumPlayhead])
				);
			} else {
				this._resetDrums();
				this._idleDrums();
			}

			if (this[$synthPlayback]) {
				this._playSynthNotes(
					this._patternNotes('synth', synthPattern, this[$synthPlayhead])
				);
			} else {
				this._resetSynths();
				this._idleSynths();
			}
		}

		// In case we don't know when the loop started, we save it here
		if (this[$timer] === null) {
			this[$timer] = timestamp;
		}

		// This is the main logic of the note scheduler
		const frameTime = 1000.0 / 60.0;
		const progress = timestamp - this[$timer];
		// We look ahead 2 frames (2*16.66ms) to schedule notes
		if (progress + 2 * frameTime >= this[$stepDuration] * 1000.0) {
			// Because the timer is being constantly adjusted, we can use it to schedule the next MIDI notes getting sent
			this[$midi].noteTimestamp = this[$timer] + this[$stepDuration] * 1000.0;
			this[$noteScheduled] = true;

			this[$drumPlayhead] = ++this[$drumPlayhead] % drumPattern.length;
			this[$synthPlayhead] = ++this[$synthPlayhead] % synthPattern.length;
		}

		this._scene.tick(timestamp);
		if (this[$playback]) {
			// Continue playback
			this._beatFrame = requestAnimationFrame(this._playBeat.bind(this));
		} else {
			// Reset the UI if we're not playing
			this._resetDrums();
			this._idleDrums();

			this._resetSynths();
			this._idleSynths();
			this[$midi].noteTimestamp = 0;
			this[$timer] = null;
		}
	}

	_patternNotes(instrument, pattern, step) {
		return this._expression
			? this._expression.notes(instrument, pattern, step)
			: pattern[step % pattern.length];
	}
	_renderLock() {
		const locked = this._input.locked;
		const button = this.shadow.querySelector('#lock-toggle');
		button.setAttribute('aria-pressed', String(locked));
		button.setAttribute('aria-label', `Lock playback ${locked ? 'on' : 'off'}`);
		this.shadow.querySelector('#lock-label').textContent = locked
			? 'Locked'
			: 'Unlocked';
		this.shadow.querySelector('#play-hint').textContent = locked
			? 'RELEASE TO LATCH · STOP TO SILENCE'
			: 'HOLD BOTH GRIPS TO DUET';
	}

	/**
	 * Read notes to play for the synth and show them in the UI
	 * @param  {int|Array} notes
	 */
	_playSynthNotes(notes) {
		// Reset the synth UI
		this._updatePatternUI();
		this._resetSynths();

		const notesArr = asArrayLike(notes);
		const midi = this[$midi];

		// Stop playing the previous notes
		if (this[$activeSynthNotes] !== null) {
			midi.send(
				this[$synthChannel],
				'noteoff',
				this[$activeSynthNotes][0],
				127
			);
			if (this[$activeSynthNotes].length > 1) {
				midi.send(
					this[$synthChannel],
					'noteoff',
					this[$activeSynthNotes][1],
					127
				);
			}
		}

		// Send new notes to MIDI out
		if (notes !== null) {
			midi.send(
				this[$synthChannel],
				'noteon',
				idxToMidi(notesArr[0]),
				this._expression?.velocity('synth') || 127
			);
			if (notesArr.length > 1) {
				midi.send(
					this[$synthChannel],
					'noteon',
					idxToMidi(notesArr[1]),
					this._expression?.velocity('synth') || 127
				);
			}
		} else {
			// Stay idle if no notes should be played
			this[$activeSynthNotes] = null;
			this._toneSynth?.releaseAll?.();
			return this._idleSynths();
		}

		// --- Tone.js synth playback ---
		if (
			this._Tone?.context.state === 'running' &&
			this._toneSynth &&
			notes !== null
		) {
			const midiNotes = notesArr.map(n =>
				this._Tone.Frequency(idxToMidi(n), 'midi').toNote()
			);
			this._toneSynth.triggerAttackRelease(
				midiNotes,
				this._expression?.gate('synth') || 0.3,
				undefined,
				this._expression?.strength('synth') || 1
			);
		}

		// Store played notes, so we can stop them the next time anything is played
		this[$activeSynthNotes] = [idxToMidi(notesArr[0])];
		if (notesArr.length > 1) {
			this[$activeSynthNotes].push(idxToMidi(notesArr[1]));
		}

		this._scene.synth(notesArr);
	}

	/**
	 * Read notes for the drums to play and show them in the UI
	 * @param  {int|Array} notes
	 */
	_playDrumNotes(notes) {
		// Reset the drums UI
		this._updatePatternUI();
		this._resetDrums();

		const notesArr = asArrayLike(notes);
		const midi = this[$midi];

		// Stop playing the previous notes
		if (this[$activeDrumNotes] !== null) {
			midi.send(this[$drumChannel], 'noteoff', this[$activeDrumNotes][0], 127);
			if (this[$activeDrumNotes].length > 1) {
				midi.send(
					this[$drumChannel],
					'noteoff',
					this[$activeDrumNotes][1],
					127
				);
			}
		}

		// Send new notes to MIDI out
		if (notes !== null) {
			midi.send(
				this[$drumChannel],
				'noteon',
				idxToMidi(notesArr[0]),
				this._expression?.velocity('drum') || 127
			);
			if (notesArr.length > 1) {
				midi.send(
					this[$drumChannel],
					'noteon',
					idxToMidi(notesArr[1]),
					this._expression?.velocity('drum') || 127
				);
			}
		}

		// --- Tone.js drum playback ---
		if (
			this._Tone?.context.state === 'running' &&
			this._toneDrum &&
			notes !== null
		) {
			// Play each drum note as a short "kick" (can be improved for more realism)
			this._toneDrum.triggerAttackRelease(
				'C2',
				Math.min(0.2, this._expression?.gate('drum') || 0.15),
				undefined,
				this._expression?.strength('drum') || 1
			);
		}

		if (notes === null) {
			// Stay idle if no notes should be played
			this[$activeDrumNotes] = null;
			return this._idleDrums();
		}

		// Store played notes, so we can stop them the next time anything is played
		this[$activeDrumNotes] = [idxToMidi(notesArr[0])];
		if (notesArr.length > 1) {
			this[$activeDrumNotes].push(idxToMidi(notesArr[1]));
		}

		this._scene.drum(notesArr);
	}

	_updatePatternUI() {
		const isDrum = this[$displayInstrument] === 'drum';
		const patternIndex = isDrum ? this[$drumPattern] : this[$synthPattern];
		this._scene.update({
			pattern: isDrum
				? drumPatterns[patternIndex]
				: synthPatterns[patternIndex],
			step: (isDrum ? this[$drumPlayhead] : this[$synthPlayhead]) || 0,
			patternIndex,
			playing: this.playback,
			drumPlaying: this[$drumPlayback],
			synthPlaying: this[$synthPlayback],
			drumPattern: this[$drumPattern],
			synthPattern: this[$synthPattern],
			stepDuration: this[$stepDuration]
		});
	}

	_stopInstrument(instrument) {
		const active = instrument === 'drum' ? $activeDrumNotes : $activeSynthNotes;
		const channel =
			instrument === 'drum' ? this[$drumChannel] : this[$synthChannel];
		const scheduled = this[$midi].noteTimestamp;
		this[$midi].noteTimestamp = 0;
		for (const note of this[active] || [])
			this[$midi].send(channel, 'noteoff', note, 127);
		this[$midi].noteTimestamp = scheduled;
		this[active] = null;
		if (instrument === 'synth') this._toneSynth?.releaseAll?.();
		else this._toneDrum?.triggerRelease?.();
		this._scene?.clear(instrument);
	}

	_resetDrums() {
		this._scene.clearHighlights('drum');
	}
	_idleDrums() {
		if (!this[$drumPlayback]) this._scene.clear('drum');
		else this._scene.clearHighlights('drum');
	}
	_resetSynths() {
		this._scene.clearHighlights('synth');
	}
	_idleSynths() {
		if (!this[$synthPlayback]) this._scene.clear('synth');
		else this._scene.clearHighlights('synth');
	}

	/**
	 * Connect to all possible MIDI devices and set up message listeners
	 */
	_initMIDI() {
		let drumPatterns = [];
		let synthPatterns = [];

		this[$midi] = new MIDI();
		this[$midi].noteTimestamp = 0;
		/**
		 * Handle incoming MIDI note presses
		 * @param  {int} channel
		 * @param  {int} note
		 */
		this._pressPattern = (channel, note) => {
			// Only handle input on the control channel
			if (channel !== this[$controlChannel]) {
				return;
			}

			// Only handle input of the middle white keys F-E (OP-1/Z style)
			const patternIdx = whiteKeys[note];
			if (patternIdx === undefined) {
				return;
			}

			if (patternIdx < 7) {
				// Left side is for drums
				// Start playback and show pattern
				if (!this[$drumPlayback]) {
					this[$drumPlayhead] = 0;
				}
				this[$displayInstrument] = 'drum';
				this[$drumPlayback] = true;
				this.drumPattern = patternIdx;
				const previous = drumPatterns.indexOf(patternIdx);
				if (previous !== -1) drumPatterns.splice(previous, 1);
				drumPatterns.push(this.drumPattern);
			} else {
				// Right side is for synths
				// Start playback and show pattern
				if (!this[$synthPlayback]) {
					this[$synthPlayhead] = 0;
				}
				this[$displayInstrument] = 'synth';
				this[$synthPlayback] = true;
				this.synthPattern = patternIdx;
				const previous = synthPatterns.indexOf(patternIdx);
				if (previous !== -1) synthPatterns.splice(previous, 1);
				synthPatterns.push(this.synthPattern);
			}

			// Whatever input we get, playback should be started
			this.playback = true;
			this._updatePatternUI();
		};
		/**
		 * Handle incoming MIDI note releases
		 * @param  {int} channel
		 * @param  {int} note
		 */
		this._releasePattern = (channel, note) => {
			// Only handle input on the control channel
			if (channel !== this[$controlChannel]) {
				return;
			}

			// Only handle input of the middle white keys F-E (OP-1/Z style)
			const patternIdx = whiteKeys[note];
			if (patternIdx === undefined) {
				return;
			}

			if (patternIdx < 7) {
				// Left side is for drums
				// Either jump back to another pattern still being held down,
				// or stop playback of drums
				const idx = drumPatterns.lastIndexOf(patternIdx);
				if (idx === -1) return;
				drumPatterns.splice(idx, 1);

				if (drumPatterns.length === 0) {
					this._stopInstrument('drum');
					if (synthPatterns.length === 0) {
						// If there would be no drums and synths played, we stop playback
						this.playback = false;
					} else {
						// If there are still synths playing, we show that pattern
						this[$displayInstrument] = 'synth';
					}
					this[$drumPlayback] = false;
				} else {
					// There is another drum key held down, so we'll start playing that
					this.drumPattern = drumPatterns[drumPatterns.length - 1];
				}
			} else {
				const idx = synthPatterns.lastIndexOf(patternIdx);
				if (idx === -1) return;
				synthPatterns.splice(idx, 1);

				if (synthPatterns.length === 0) {
					this._stopInstrument('synth');
					if (drumPatterns.length === 0) {
						// If there would be no drums and synths played, we stop playback
						this.playback = false;
					} else {
						// If there are still drums playing, we show that pattern
						this[$displayInstrument] = 'drum';
					}
					this[$synthPlayback] = false;
				} else {
					// There is another synth key held down, so we'll start playing that
					this.synthPattern = synthPatterns[synthPatterns.length - 1];
				}
			}
			this._updatePatternUI();
		};
		this._input = new PatternInput(
			Object.keys(whiteKeys).map(Number),
			note => this._pressPattern(this[$controlChannel], note),
			note => this._releasePattern(this[$controlChannel], note),
			() => this._unlockAudio()
		);
		this[$midi].noteon = (channel, note, device = 'default') => {
			if (channel === this[$controlChannel])
				this._input.start(`midi:${device}:${channel}:${note}`, note);
		};
		this[$midi].noteoff = (channel, note, device = 'default') => {
			if (channel === this[$controlChannel])
				this._input.stop(`midi:${device}:${channel}:${note}`);
		};
	}

	_initPads() {
		const notes = Object.keys(whiteKeys).map(Number);
		this._setupPad(this.shadow.querySelector('.drum-bank'), notes.slice(0, 7));
		this._setupPad(this.shadow.querySelector('.synth-bank'), notes.slice(7));
		this.shadow.querySelectorAll('[data-pattern]').forEach(button => {
			const source = {};
			button.addEventListener('keydown', event => {
				if (!['Space', 'Enter'].includes(event.code) || event.repeat) return;
				event.preventDefault();
				this._unlockAudio();
				this._input.start(source, notes[Number(button.dataset.pattern)]);
			});
			const release = () => this._input.stop(source);
			button.addEventListener('keyup', event => {
				if (['Space', 'Enter'].includes(event.code)) {
					event.preventDefault();
					release();
				}
			});
			button.addEventListener('blur', release);
		});
	}

	_setupPad(el, notes) {
		this._input.pad(el, notes);
	}

	_unlockAudio() {
		return this._audio?.unlock();
	}

	_renderAudioState(phase) {
		const button = this.shadow.querySelector('#audio-start');
		const message = this.shadow.querySelector('#audio-message');
		const labels = {
			loading: 'Loading sound…',
			error: 'Retry sound',
			running: 'Sound on',
			ready: 'Enable sound',
			starting: 'Enable sound',
			blocked: 'Enable sound'
		};
		button.textContent = labels[phase];
		button.disabled = phase === 'loading' || phase === 'running';
		message.textContent =
			phase === 'error'
				? "Sound couldn't load. Tap Retry sound."
				: phase === 'loading'
				? 'Preparing instruments…'
				: phase === 'running'
				? 'Hold the side buttons to play.'
				: 'Tap Enable sound, then hold a pattern.';
	}

	disconnectedCallback() {
        this._scene.disconnectLayout();
        this._drawer.disconnect();
		for (const binding of this._expressionBindings || []) binding.clear();
		if (this._disconnectKeyboard) this._disconnectKeyboard();
		this._disconnectKeyboard = null;
	}

	_printWelcomeText() {
		console.log(
			'%cWelcome to the OP-1 Rbbrto Sequencer simulator',
			'font-size: 18px;'
		);
		console.log('');
		console.log(
			'%cYou can control the sequencer by connecting one or more MIDI devices to your computer.',
			''
		);
		console.log(
			'Input will be taken from every connected MIDI device on the control channel %c(default: MIDI channel 14),',
			'color: gray'
		);
		console.log(
			'Output will be sent to two separate channels for drums %c(default: MIDI channel 1)%c and synths %c(default: MIDI channel 8)%c.',
			'color: gray',
			'color: black',
			'color: gray',
			'color: black'
		);
		console.log('');
		console.log(
			'Best used with an OP-Z, the left half of the musical keyboard will correspond to drum patterns, the right half will control the synth patterns.'
		);
		console.log('');
		console.log('To change the MIDI channels, you can use the UI:');
		console.log(
			'* To change the Drum MIDI output channel: Click on the %cgreen drum icon%c on the bottom left of the screen.',
			'color: #00ED95',
			'color:black'
		);
		console.log(
			'* To change the Control MIDI input channel: Click on the %cwhite piano icon%c on the very bottom of the screen.',
			'color: gray',
			'color:black'
		);
		console.log(
			'* To change the Synth MIDI output channel: Click on the %cblue synth icon%c on the bottom right of the screen.',
			'color: #698EFF',
			'color:black'
		);
		console.log('');
		console.log(
			'Changing settings is possible by changing the attributes of the %c<rbbrto-sequencer>%c element:',
			'color: slate',
			'color: black'
		);
		console.log(
			"* To set the BPM: %cdocument.querySelector('rbbrto-sequencer').setAttribute('bpm', 125);",
			'color: gray'
		);
		console.log('');
		console.log('Have fun playing!');
		console.log('');
		console.log(
			'%cMade by: %cRob Selover - %cgithub.com/rselover',
			'color: grey',
			'color: slate',
			'color: grey'
		);
		console.log('');
		console.log(
			'%cBrowser compatibility: Any browser with support for the Web MIDI API (Google Chrome (desktop & Android), Android Browser, Samsung Internet)',
			'color: gray; font-size: 10px'
		);
		console.log('');
		console.log(
			'%cCopyright notice: All of the visual artwork and sequencer patterns were made by Teenage Engineering, I am just using it for fun here.',
			'color: gray; font-size: 8px'
		);
		console.log('');
	}
}

customElements.define('rbbrto-sequencer', Rbbrto);
