const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const read = path => readFileSync(`${__dirname}/../src/${path}`, 'utf8');

function sequencer() {
	let Sequencer;
	let id = 0,
		now = 0;
	const frames = new Map(),
		messages = [];
	const context = vm.createContext({
		console,
		NodeList: class {},
		HTMLElement: class {},
		MIDI: class {
			send(channel, command, note) {
				messages.push({ channel, command, note, time: now });
			}
		},
		requestAnimationFrame: callback => {
			frames.set(++id, callback);
			return id;
		},
		cancelAnimationFrame: key => frames.delete(key),
		customElements: {
			define: (_, value) => {
				Sequencer = value;
			}
		}
	});
	vm.runInContext(
		`const n = note => note - 53;\n${read('patterns.js')
			.replace(/^import.*\n/m, '')
			.replace(/export const/g, 'const')}\n${read('utils.js').replace(
			/export function/g,
			'function'
		)}\n${read('scene.js')
			.replace('export const sceneMarkup', 'const sceneMarkup')
			.replace('export function toeHome', 'function toeHome')
			.replace(
				'export default class Scene',
				'class Scene'
			)}\nconst whiteKeys = {53:0,55:1,57:2,59:3,60:4,62:5,64:6,65:7,67:8,69:9,71:10,72:11,74:12,76:13};\nconst idxToMidi = idx => idx+53;\n${read(
			'rbbrto.js'
		).replace(
			/^import[\s\S]*?from ['"][^'"]+['"];\n/gm,
			''
		)}\nthis.Scene=Scene;this.state={ $playback,$drumPlayback,$synthPlayback,$drumPattern,$synthPattern,$activeDrumNotes,$activeSynthNotes,$controlChannel,$drumChannel,$synthChannel,$displayInstrument,$bpm,$stepDuration,$timer,$midi };`,
		context
	);
	const seq = Object.create(Sequencer.prototype);
	const values = {
		$playback: false,
		$drumPlayback: false,
		$synthPlayback: false,
		$drumPattern: 0,
		$synthPattern: 7,
		$activeDrumNotes: null,
		$activeSynthNotes: null,
		$controlChannel: 14,
		$drumChannel: 1,
		$synthChannel: 8,
		$displayInstrument: 'drum',
		$bpm: 125,
		$stepDuration: 60 / 125 / 4,
		$timer: null
	};
	for (const [name, value] of Object.entries(values))
		seq[context.state[name]] = value;
	const node = {
		classList: { add() {}, remove() {}, toggle() {} },
		style: { setProperty() {} },
		setAttribute() {}
	};
	const root = {
		querySelector(selector) {
			const match = selector.match(/data-(toe|flying-toe|key|drum)="(-?\d+)"/);
			if (match) {
				const count = { toe: 5, 'flying-toe': 5, key: 12, drum: 6 }[match[1]];
				if (Number(match[2]) < 0 || Number(match[2]) >= count) return null;
			}
			return node;
		},
		querySelectorAll: () => []
	};
	seq._scene = new context.Scene(root);
	seq._Tone = {
		context: { state: 'running' },
		Frequency: note => ({ toNote: () => String(note) })
	};
	seq._toneSynth = { triggerAttackRelease() {}, releaseAll() {} };
	seq._toneDrum = { triggerAttackRelease() {}, triggerRelease() {} };
	seq._initMIDI();
	const midi = seq[context.state.$midi];
	return {
		seq,
		midi,
		messages,
		run(count) {
			for (let i = 0; i < count; i++) {
				assert.equal(frames.size, 1, 'exactly one live beat loop');
				const [key, callback] = frames.entries().next().value;
				frames.delete(key);
				now += 1000 / 60;
				callback(now);
			}
		}
	};
}

const drums = [53, 55, 57, 59, 60, 62, 64],
	synths = [65, 67, 69, 71, 72, 74, 76];
test('all 49 drum/synth pairs keep both instruments running through multiple full loops', () => {
	for (const drum of drums)
		for (const synth of synths) {
			const { seq, midi, messages, run } = sequencer();
			midi.noteon(14, drum);
			midi.noteon(14, synth);
			assert.doesNotThrow(() => run(900), `drum ${drum}, synth ${synth}`);
			const late = messages.filter(
				message => message.time > 12000 && message.command === 'noteon'
			);
			assert(
				late.some(message => message.channel === 1),
				`drum ${drum} continues`
			);
			assert(
				late.some(message => message.channel === 8),
				`synth ${synth} continues`
			);
			midi.noteoff(14, drum);
			run(120);
			assert.equal(seq.playback, true, 'releasing drums keeps synth running');
			midi.noteoff(14, synth);
			assert.equal(seq.playback, false);
		}
});

test('every synth pattern loops alone, then survives adding and releasing drums', () => {
	for (const synth of synths) {
		const { seq, midi, messages, run } = sequencer();
		midi.noteon(14, synth);
		run(900);
		midi.noteon(14, 53);
		run(180);
		midi.noteoff(14, 53);
		run(180);
		assert.equal(seq.playback, true);
		assert(
			messages.some(
				message =>
					message.time > 19000 &&
					message.channel === 8 &&
					message.command === 'noteon'
			)
		);
		midi.noteoff(14, synth);
		assert.equal(seq.playback, false);
	}
});

test('suspended Safari audio cannot freeze the beat loop and sound joins after unlock', () => {
	const { seq, midi, messages, run } = sequencer();
	seq._Tone.context.state = 'suspended';
	seq._Tone.start = () => {
		throw new Error('audio resume must not run in animation frames');
	};
	seq._toneSynth.triggerAttackRelease = seq._toneDrum.triggerAttackRelease = () => {
		throw new Error('cannot schedule on a suspended audio clock');
	};
	midi.noteon(14, 53);
	midi.noteon(14, 67);
	assert.doesNotThrow(() => run(900));
	assert.equal(seq.playback, true);
	assert(
		messages.some(
			message =>
				message.time > 12000 &&
				message.channel === 8 &&
				message.command === 'noteon'
		)
	);
	let synth = 0,
		drum = 0;
	seq._Tone.context.state = 'running';
	seq._toneSynth.triggerAttackRelease = () => synth++;
	seq._toneDrum.triggerAttackRelease = () => drum++;
	run(180);
	assert(synth > 0 && drum > 0);
	midi.noteoff(14, 53);
	midi.noteoff(14, 67);
	assert.equal(seq.playback, false);
});
