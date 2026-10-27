const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const read = path => readFileSync(`${__dirname}/../${path}`, 'utf8');
const context = vm.createContext({});
vm.runInContext(
	read('src/input.js')
		.replace('export const ', 'const ')
		.replace('export default class ', 'class ') +
		'\nthis.PatternInput = PatternInput;',
	context
);
const PatternInput = context.PatternInput;
const notes = [53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
function surface(extra = {}) {
	const handlers = {};
	return Object.assign(
		{
			handlers,
			addEventListener: (name, fn) => {
				handlers[name] = fn;
			},
			removeEventListener: name => {
				delete handlers[name];
			}
		},
		extra
	);
}
function setup() {
	const events = [];
	let unlocked = 0;
	const input = new PatternInput(
		notes,
		n => events.push(['on', n]),
		n => events.push(['off', n]),
		() => unlocked++
	);
	return { input, events, unlocked: () => unlocked };
}
const key = (code, extra = {}) => ({
	code,
	preventDefault() {},
	composedPath: () => [],
	...extra
});

test('keyboard exposes all fourteen patterns and ignores repeat, shortcuts and editing', () => {
	const { input, events, unlocked } = setup();
	const win = surface(),
		page = surface();
	input.keyboard(win, page);
	const codes = [
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
	codes.forEach((code, i) => {
		win.handlers.keydown(key(code));
		win.handlers.keydown(key(code, { repeat: true }));
		win.handlers.keyup(key(code));
		assert.deepEqual(events.slice(-2), [['on', notes[i]], ['off', notes[i]]]);
	});
	const count = events.length;
	win.handlers.keydown(key('KeyA', { ctrlKey: true }));
	win.handlers.keydown(
		key('KeyA', { composedPath: () => [{ tagName: 'INPUT' }] })
	);
	assert.equal(events.length, count);
	assert.equal(unlocked(), 14);
});

test('blur, hidden page and disconnect release held inputs; reconnect has one handler', () => {
	const { input, events } = setup();
	const win = surface(),
		page = surface();
	const disconnect = input.keyboard(win, page);
	win.handlers.keydown(key('KeyA'));
	win.handlers.blur();
	win.handlers.keydown(key('KeyQ'));
	page.hidden = true;
	page.handlers.visibilitychange();
	win.handlers.keydown(key('KeyS'));
	disconnect();
	assert.deepEqual(events, [
		['on', 53],
		['off', 53],
		['on', 65],
		['off', 65],
		['on', 55],
		['off', 55]
	]);
	assert.deepEqual(Object.keys(win.handlers), []);
	input.keyboard(win, page);
	assert.equal(Object.keys(win.handlers).length, 3);
});

test('touch tracks independent pointers, slides press-before-release, and shares keyboard notes', () => {
	const { input, events } = setup();
	const pad = surface({
		getBoundingClientRect: () => ({ left: 0, width: 700 }),
		setPointerCapture() {}
	});
	input.pad(pad, notes.slice(0, 7));
	const pointer = (pointerId, clientX) => ({
		pointerId,
		clientX,
		button: 0,
		preventDefault() {}
	});
	pad.handlers.pointerdown(pointer(1, 1));
	pad.handlers.pointermove(pointer(1, 101));
	assert.deepEqual(events, [['on', 53], ['on', 55], ['off', 53]]);
	input.start('KeyS', 55);
	pad.handlers.pointercancel(pointer(1));
	assert.equal(events.length, 3);
	input.stop('KeyS');
	assert.deepEqual(events.at(-1), ['off', 55]);
	pad.handlers.pointerdown(pointer(2, 1));
	pad.handlers.pointerdown(pointer(3, 201));
	pad.handlers.lostpointercapture(pointer(2));
	assert.equal(input.held.size, 1);
	pad.handlers.pointerup(pointer(3));
	assert.equal(input.held.size, 0);
});

test('real sequencer callbacks keep drums and synth together and restore held patterns', () => {
	let Sequencer;
	const frames = [];
	const ctx = vm.createContext({
		HTMLElement: class {},
		MIDI: class {
			send() {}
		},
		whiteKeys: Object.fromEntries(notes.map((n, i) => [n, i])),
		stringBool: Boolean,
		requestAnimationFrame: fn => frames.push(fn),
		cancelAnimationFrame() {},
		customElements: {
			define: (_, value) => {
				Sequencer = value;
			}
		}
	});
	vm.runInContext(
		read('src/rbbrto.js').replace(
			/^import[\s\S]*?from ['"][^'"]+['"];\n/gm,
			''
		) +
			'\nthis.symbols = { $playback, $drumPlayback, $synthPlayback, $activeDrumNotes, $activeSynthNotes, $controlChannel, $midi, $drumPlayhead, $synthPlayhead };',
		ctx
	);
	const seq = Object.create(Sequencer.prototype);
	for (const [name, symbol] of Object.entries(ctx.symbols)) {
		seq[symbol] = name.includes('active')
			? null
			: name === '$controlChannel'
			? 14
			: false;
	}
	for (const name of [
		'_updatePatternUI',
		'_resetDrums',
		'_idleDrums',
		'_resetSynths',
		'_idleSynths'
	])
		seq[name] = () => {};
	seq._initMIDI();
	const midi = seq[ctx.symbols.$midi];
	const input = new PatternInput(
		notes,
		n => midi.noteon(14, n),
		n => midi.noteoff(14, n)
	);
	input.start('a', 53);
	input.start('q', 65);
	seq[ctx.symbols.$drumPlayhead] = 5;
	seq[ctx.symbols.$synthPlayhead] = 3;
	input.start('s', 55);
	assert.equal(seq[ctx.symbols.$drumPlayhead], 5);
	assert.equal(seq[ctx.symbols.$synthPlayhead], 3);
	assert.equal(seq.drumPattern, 1);
	input.stop('s');
	assert.equal(seq.drumPattern, 0);
	input.start('a', 57); // slide without restarting the main loop
	assert.equal(frames.length, 1);
	assert.equal(seq[ctx.symbols.$synthPlayback], true);
	input.stop('a');
	assert.equal(seq.playback, true);
	input.stop('q');
	assert.equal(seq.playback, false);
	const offs = [];
	midi.send = (...args) => offs.push([...args, midi.noteTimestamp]);
	midi.noteon(14, 53);
	midi.noteon(14, 65);
	seq[ctx.symbols.$activeSynthNotes] = [60, 64];
	midi.noteTimestamp = 999;
	let releases = 0;
	seq._toneSynth = { releaseAll: () => releases++ };
	midi.noteoff(14, 65);
	assert.equal(seq.playback, true);
	assert.equal(releases, 1);
	assert(offs.every(args => args.at(-1) === 0));
	assert.equal(seq[ctx.symbols.$activeSynthNotes], null);
	midi.noteoff(14, 65); // Unmatched release must not stop the other instrument.
	assert.equal(seq.playback, true);
	midi.noteoff(14, 53);
	midi.noteon(14, 53);
	midi.noteon(14, 53);
	midi.noteoff(14, 53);
	assert.equal(seq.playback, false);
});

test('two-note drum steps trigger the monophonic preview once; rests stay silent', () => {
	let Sequencer;
	const ctx = vm.createContext({
		HTMLElement: class {},
		customElements: {
			define: (_, value) => {
				Sequencer = value;
			}
		},
		asArrayLike: value => (Array.isArray(value) ? value : [value]),
		idxToMidi: value => value + 53,
		drum: [{ face: 0, hands: 'lr', layer: '#drum' }],
		FACE: () => '#face',
		c: {
			SIDE_LEFT: 'l',
			SIDE_RIGHT: 'r',
			CLASS_HIDDEN: 'hidden',
			CLASS_HIT: 'hit'
		},
		DRUM_HAND_LEFT: '#left',
		DRUM_HAND_RIGHT: '#right',
		COWBELL: '#bell'
	});
	vm.runInContext(
		read('src/rbbrto.js').replace(
			/^import[\s\S]*?from ['"][^'"]+['"];\n/gm,
			''
		) + '\nthis.active = $activeDrumNotes; this.midi = $midi;',
		ctx
	);
	const seq = Object.create(Sequencer.prototype);
	seq[ctx.active] = null;
	const messages=[];
	seq[ctx.midi] = { send: (...args)=>messages.push(args) };
	for (const name of [
		'_updatePatternUI',
		'_resetDrums',
		'_show',
		'_toggle',
		'_idleDrums'
	])
		seq[name] = () => {};
	const attacks = [];
	seq._Tone = { context: { state: 'running' } };
	seq._toneDrum = { triggerAttackRelease: (...args) => attacks.push(args) };
	const visuals = [];
	seq._scene = { drum: notes => visuals.push(notes) };
	seq._playDrumNotes([1, 0]);
	assert.equal(attacks.length, 1);
	assert.deepEqual(visuals, [[1, 0]]);
	assert.deepEqual(messages.filter(args=>args[1]==='noteon').map(args=>args[2]),[54,53]);
	seq._playDrumNotes(null);
	assert.equal(attacks.length, 1);
});

test('two-column touch grips hit rows by geometry, support duet, and discard canceled pointers', () => {
	const { input, events } = setup();
	const buttons = Array.from({ length: 7 }, (_, i) => ({
		getBoundingClientRect: () => ({
			left: (i % 2) * 60,
			right: (i % 2) * 60 + 50,
			top: Math.floor(i / 2) * 60,
			bottom: Math.floor(i / 2) * 60 + 50
		})
	}));
	const grip = surface({
		querySelectorAll: () => buttons,
		setPointerCapture() {}
	});
	input.pad(grip, notes.slice(0, 7));
	const p = (id, x, y) => ({
		pointerId: id,
		clientX: x,
		clientY: y,
		button: 0,
		preventDefault() {}
	});
	grip.handlers.pointerdown(p(1, 20, 20));
	grip.handlers.pointermove(p(1, 20, 140));
	assert.deepEqual(events, [['on', 53], ['on', 60], ['off', 53]]);
	grip.handlers.pointerdown(p(2, 80, 80));
	assert.equal(input.held.size, 2);
	grip.handlers.pointercancel(p(1, 20, 140));
	assert.equal(input.held.size, 1);
	input.stopAll();
	const count = events.length;
	grip.handlers.pointermove(p(2, 80, 20));
	assert.equal(events.length, count);
	assert.equal(input.held.size, 0);
});

test('letter controls still play when a pattern button has focus', () => {
	const { input, events } = setup();
	const win = surface(),
		page = surface();
	input.keyboard(win, page);
	win.handlers.keydown(
		key('KeyA', { composedPath: () => [{ tagName: 'BUTTON' }] })
	);
	win.handlers.keyup(key('KeyA'));
	assert.deepEqual(events, [['on', 53], ['off', 53]]);
});
