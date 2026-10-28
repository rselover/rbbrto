const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const read = path => readFileSync(`${__dirname}/../${path}`, 'utf8');

function midiContext(navigator) {
	const context = vm.createContext({ navigator, console });
	vm.runInContext(
		read('src/midi.js')
			.replace(/export default class MIDI/, 'class MIDI')
			.replace(/export const /g, 'const ') + '\nthis.MIDI = MIDI;',
		context
	);
	return context;
}

test('MIDI sends safely before access resolves, and sends normally afterward', () => {
	const context = midiContext({
		requestMIDIAccess: () => new Promise(() => {})
	});
	const midi = new context.MIDI();
	assert.doesNotThrow(() => midi.send(1, 'noteon', 60, 127));
	const sent = [];
	midi.success({
		inputs: new Map(),
		outputs: new Map([['out', { send: (...args) => sent.push(args) }]])
	});
	midi.noteTimestamp = 123;
	midi.send(2, 'noteon', 60, 127);
	assert.deepEqual(Array.from(sent[0][0]), [0x91, 60, 127]);
	assert.equal(sent[0][1], 123);
});

test('MIDI supports local playback when unavailable or denied', async () => {
	const unsupported = new (midiContext({})).MIDI();
	assert.doesNotThrow(() => unsupported.send(1, 'noteoff', 60));
	const denied = new (midiContext({
		requestMIDIAccess: () => Promise.reject(new Error('denied'))
	})).MIDI();
	await new Promise(resolve => setImmediate(resolve));
	assert.doesNotThrow(() => denied.send(1, 'noteon', 60));
});

test('settings ignore background clicks, wrap channels, and reconnect once', () => {
	let Settings;
	const context = vm.createContext({
		HTMLElement: class {
			attachShadow() {
				return { innerHTML: '', getElementById: () => ({ innerHTML: '' }) };
			}
			dispatchEvent(event) {
				this.lastEvent = event;
			}
		},
		CustomEvent: class {
			constructor(type, options) {
				this.type = type;
				this.detail = options.detail;
			}
		},
		customElements: {
			define: (_, value) => {
				Settings = value;
			}
		},
		css: ''
	});
	vm.runInContext(
		read('src/settings.js').replace("import css from './settings.css.js';", ''),
		context
	);
	const settings = new Settings();
	settings.connectedCallback();
	settings.connectedCallback();
	assert.doesNotThrow(() => settings.onclick({ composedPath: () => [{}] }));
	settings.drum = 16;
	settings.onclick({
		composedPath: () => [
			{ classList: { contains: value => ['drum', 'extra'].includes(value) } }
		]
	});
	assert.equal(settings.drum, 1);
	assert.equal(settings.lastEvent.type, 'drum-channel');
	assert.equal(settings.lastEvent.detail, 1);
});

function worker(fetch, cache) {
	const handlers = {};
	vm.runInNewContext(read('sw.js'), {
		self: {
			addEventListener: (name, fn) => {
				handlers[name] = fn;
			}
		},
		fetch,
		caches: { open: async () => cache },
		console
	});
	return request => {
		let response;
		const waits = [];
		handlers.fetch({
			request,
			respondWith: p => {
				response = p;
			},
			waitUntil: p => waits.push(p)
		});
		return { response, done: () => Promise.all(waits) };
	};
}

test('worker fetches once, caches a clone, and returns the network response', async () => {
	let calls = 0;
	const response = new Response('fresh');
	let cached;
	const dispatch = worker(
		async (_, options) => {
			assert.equal(options.cache, 'no-cache');
			calls++;
			return response;
		},
		{
			put: async (_, value) => {
				cached = await value.text();
			}
		}
	);
	const event = dispatch({ method: 'GET' });
	assert.equal(await (await event.response).text(), 'fresh');
	await event.done();
	assert.equal(calls, 1);
	assert.equal(cached, 'fresh');
});

test('worker uses offline cache and preserves network response if caching fails', async () => {
	const offline = worker(
		async () => {
			throw new Error('offline');
		},
		{ match: async () => new Response('cached') }
	);
	const event = offline({ method: 'GET' });
	assert.equal(await (await event.response).text(), 'cached');
	await event.done();
	const brokenCache = worker(async () => new Response('fresh'), {
		put: async () => {
			throw new Error('quota');
		}
	});
	const fresh = brokenCache({ method: 'GET' });
	assert.equal(await (await fresh.response).text(), 'fresh');
	await fresh.done();
});

test('worker ignores non-GET requests and does not cache errors', async () => {
	let calls = 0;
	let puts = 0;
	const dispatch = worker(
		async () => {
			calls++;
			return new Response('error', { status: 500 });
		},
		{
			put: async () => {
				puts++;
			}
		}
	);
	assert.equal(dispatch({ method: 'POST' }).response, undefined);
	const event = dispatch({ method: 'GET' });
	assert.equal((await event.response).status, 500);
	await event.done();
	assert.equal(calls, 1);
	assert.equal(puts, 0);
});

test('visible pattern banks select all supported drum and synth patterns', () => {
	let Rbbrto;
	const midi = midiContext({});
	const context = vm.createContext({
		HTMLElement: class {},
		customElements: {
			define: (_, value) => {
				Rbbrto = value;
			}
		},
		document: { createElement: () => ({ classList: { add() {} } }) },
		whiteKeys: vm.runInContext('whiteKeys', midi)
	});
	vm.runInContext(
		read('src/rbbrto.js').replace(
			/^import[\s\S]*?from ['"][^'"]+['"];\n/gm,
			''
		),
		context
	);
	const pads = [];
	Rbbrto.prototype._initPads.call({
		shadow: { querySelector: selector => selector, querySelectorAll: () => [] },
		_setupPad: (_, notes) => pads.push(Array.from(notes))
	});
	assert.deepEqual(pads, [
		[53, 55, 57, 59, 60, 62, 64],
		[65, 67, 69, 71, 72, 74, 76]
	]);
	const bindings = [];
	Rbbrto.prototype._setupPad.call(
		{ _input: { pad: (...args) => bindings.push(args) } },
		'pad',
		pads[1]
	);
	assert.equal(bindings[0][0], 'pad');
	assert.deepEqual(bindings[0][1], pads[1]);
});
