const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({ console });
vm.runInContext(
	readFileSync(`${__dirname}/../src/audio-unlock.js`, 'utf8').replace(
		'export default class AudioUnlock',
		'class AudioUnlock'
	) + '\nthis.AudioUnlock=AudioUnlock;',
	context
);
const AudioUnlock = context.AudioUnlock;

test('early touches do not defer an unlock until after the gesture expires', async () => {
	let finish;
	let starts = 0;
	const tone = {
		context: { state: 'suspended' },
		start() {
			starts++;
			this.context.state = 'running';
			return Promise.resolve();
		}
	};
	const gate = new AudioUnlock(
		() =>
			new Promise(resolve => {
				finish = resolve;
			})
	);
	const loading = gate.load();
	await Promise.resolve();
	assert.equal(await gate.unlock(), false);
	finish(tone);
	await loading;
	assert.equal(starts, 0);
	assert.equal(gate.phase, 'ready');
	const result = gate.unlock();
	assert.equal(starts, 1, 'start is invoked before unlock returns its promise');
	assert.equal(await result, true);
	assert.equal(gate.phase, 'running');
});

test('a pending blocked resume does not prevent a later tap from enabling sound', async () => {
	let starts = 0;
	const tone = {
		context: { state: 'suspended' },
		start() {
			starts++;
			if (starts === 1) return new Promise(() => {});
			this.context.state = 'running';
			return Promise.resolve();
		}
	};
	const gate = new AudioUnlock(async () => tone);
	await gate.load();
	gate.unlock();
	assert.equal(gate.phase, 'starting');
	assert.equal(await gate.unlock(), true);
	assert.equal(starts, 2);
	assert.equal(gate.phase, 'running');
});

test('failed resumes and interrupted audio expose a retryable state', async () => {
	let changed;
	const tone = {
		context: {
			state: 'suspended',
			rawContext: {
				addEventListener: (_, fn) => {
					changed = fn;
				}
			}
		},
		start() {
			return Promise.reject(new Error('activation required'));
		}
	};
	const gate = new AudioUnlock(async () => tone);
	await gate.load();
	assert.equal(await gate.unlock(), false);
	assert.equal(gate.phase, 'blocked');
	tone.context.state = 'running';
	changed();
	assert.equal(gate.phase, 'running');
	tone.context.state = 'interrupted';
	changed();
	assert.equal(gate.phase, 'ready');
});

test('failed dependency loads can be retried without replaying stale touches', async () => {
	let attempts = 0;
	const gate = new AudioUnlock(async () => {
		if (!attempts++) throw new Error('offline');
		return { context: { state: 'suspended' } };
	});
	assert.equal(await gate.load(), null);
	assert.equal(gate.phase, 'error');
	await gate.load();
	assert.equal(gate.phase, 'ready');
	assert.equal(attempts, 2);
});
