const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(
	readFileSync(`${__dirname}/../src/scene.js`, 'utf8')
		.replace('export const sceneMarkup', 'const sceneMarkup')
		.replace('export default class Scene', 'class Scene')
		.replace('export function toeHome', 'function toeHome') +
		'\nthis.Scene=Scene; this.markup=sceneMarkup; this.toeHome=toeHome;',
	context
);
function element(dataset = {}) {
	const classes = new Set();
	return {
		dataset,
		style: {
			setProperty(name, value) {
				this[name] = value;
			}
		},
		textContent: '',
		attributes: {},
		classes,
		classList: {
			add: v => classes.add(v),
			remove: v => classes.delete(v),
			toggle: (v, on) => (on ? classes.add(v) : classes.delete(v))
		},
		setAttribute(name, value) {
			this.attributes[name] = value;
		}
	};
}
function setup() {
	const single = new Map();
	const groups = new Map();
	const root = {
		querySelector(selector) {
			if (!single.has(selector)) single.set(selector, element());
			return single.get(selector);
		},
		querySelectorAll(selector) {
			return groups.get(selector) || [];
		}
	};
	for (const [selector, count] of [
		['[data-step]', 32],
		['[data-lamp]', 7],
		['[data-pattern]', 14]
	]) {
		groups.set(
			selector,
			Array.from({ length: count }, (_, i) => element({ pattern: String(i) }))
		);
	}
	return { scene: new context.Scene(root), root, groups };
}

test('note animation presses toes and highlights the corresponding instruments', () => {
	const { scene, root } = setup();
	scene.drum([0, 3]);
	assert(root.querySelector('#drum-foot [data-toe="0"]').classes.has('struck'));
	assert(root.querySelector('[data-drum="3"]').classes.has('struck'));
	scene.synth([0, 7]);
	assert(
		root.querySelector('#synth-foot [data-toe="2"]').classes.has('struck')
	);
	assert(root.querySelector('[data-key="5"]').classes.has('struck'));
	assert(root.querySelector('[data-key="0"]').classes.has('struck'));
});

test('duet state activates both banks, the hula dancer and the current sequencer step', () => {
	const { scene, root, groups } = setup();
	const state = {
		pattern: [null, [0], null, [1]],
		step: 3,
		patternIndex: 9,
		playing: true,
		drumPlaying: true,
		synthPlaying: true,
		drumPattern: 1,
		synthPattern: 9
	};
	scene.update(state);
	assert(root.querySelector('svg').classes.has('playing'));
	assert.equal(root.querySelector('#status').textContent, 'SOLE IN SESSION');
	assert(groups.get('[data-step]')[3].classes.has('current'));
	assert(!groups.get('[data-step]')[0].classes.has('has-note'));
	assert.equal(groups.get('[data-step]')[4].style.display, 'none');
	assert.equal(
		groups.get('[data-pattern]')[1].attributes['aria-pressed'],
		'true'
	);
	assert.equal(
		groups.get('[data-pattern]')[9].attributes['aria-pressed'],
		'true'
	);
	scene.update({
		...state,
		playing: false,
		drumPlaying: false,
		synthPlaying: false
	});
	assert(!root.querySelector('svg').classes.has('playing'));
	assert.equal(root.querySelector('#status').textContent, 'READY TO PLAY');
	assert(
		groups
			.get('[data-pattern]')
			.every(el => el.attributes['aria-pressed'] === 'false')
	);
});

test('scene contains two articulated feet, hula skirt, 32 steps and 14 labeled controls', () => {
	const markup = context.markup;
	assert.equal((markup.match(/class="toe"/g) || []).length, 15);
	assert.equal((markup.match(/data-step=/g) || []).length, 32);
	assert.equal((markup.match(/data-pattern=/g) || []).length, 14);
	assert(markup.includes('id="hula-dancer"'));
	assert(markup.includes('class="skirt"'));
	assert(!markup.includes('gorilla'));
});

test('upright toes start above the heel and travel to the played instrument', () => {
	for (const instrument of ['drum', 'synth']) {
		for (let i = 0; i < 5; i++) assert(context.toeHome(instrument, i).y < 400);
	}
	const { scene, root, groups } = setup();
	scene.synth([0]);
	const source = root.querySelector('#synth-foot [data-toe="0"]');
	const flying = root.querySelector('#synth-flying-toes [data-flying-toe="0"]');
	assert(source.classes.has('struck'));
	assert(flying.classes.has('flying'));
	scene.tick(0);
	scene.tick(60);
	assert.equal(flying.attributes.transform, 'translate(1285 593.75)');
	groups.set('#synth-foot .toe, #synth-flying-toes .flying-toe, [data-key]', [
		source,
		flying
	]);
	scene.clear('synth');
	assert(!source.classes.has('struck'));
	assert(!flying.classes.has('flying'));
});

test('toe flight changes SVG positions frame by frame and returns to the foot', () => {
	const { scene, root } = setup();
	scene.synth([0]);
	const flying = root.querySelector('#synth-flying-toes [data-flying-toe="0"]');
	const source = root.querySelector('#synth-foot [data-toe="0"]');
	const home = flying.attributes.transform;
	scene.tick(1000);
	scene.tick(1030);
	const outbound = flying.attributes.transform;
	assert.notEqual(outbound, home);
	scene.tick(1060);
	const contact = flying.attributes.transform;
	assert.notEqual(contact, outbound);
	scene.tick(1090);
	assert.notEqual(flying.attributes.transform, contact);
	scene.tick(1120);
	assert.equal(flying.attributes.transform, home);
	assert(!source.classes.has('struck'));
	assert(!flying.classes.has('flying'));
	assert.equal(scene.motions.size, 0);
});

test('motion control respects reduced motion and can explicitly enable toe flight', () => {
	context.matchMedia = () => ({ matches: true });
	const { scene, root } = setup();
	delete context.matchMedia;
	assert.equal(scene.motionEnabled, false);
	scene.synth([0]);
	assert.equal(scene.motions.size, 0);
	assert.equal(root.querySelector('#motion-toggle').textContent, 'Motion off');
	scene.setMotionEnabled(true);
	scene.synth([0]);
	scene.tick(0);
	scene.tick(40);
	assert.equal(scene.motions.size, 1);
	assert.equal(root.querySelector('#motion-toggle').textContent, 'Motion on');
	scene.setMotionEnabled(false);
	assert.equal(scene.motions.size, 0);
	assert(
		!root.querySelector('#synth-foot [data-toe="0"]').classes.has('struck')
	);
});
