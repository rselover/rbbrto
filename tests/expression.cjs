const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(
	readFileSync(`${__dirname}/../src/expression.js`, 'utf8')
		.replace('export default class Expression', 'class Expression')
		.replace('export function bindExpression', 'function bindExpression') +
		'\nthis.Expression=Expression;this.bindExpression=bindExpression;',
	context
);
test('center preserves original patterns, left thins notes, and right fills rests without mutating the pattern', () => {
	const model = new context.Expression(),
		pattern = [[0], null, [2], null, [0], null, [4], null];
	const original = JSON.stringify(pattern);
	const notes = () => pattern.map((_, i) => model.notes('drum', pattern, i));
	assert.deepEqual(notes(), pattern);
	model.set('drum', 0, 0.65);
	assert(notes().filter(Boolean).length < 4);
	assert.deepEqual(notes()[0], [0]);
	model.set('drum', 1, 0.65);
	assert(notes().every(Boolean));
	assert.equal(JSON.stringify(pattern), original);
	assert.deepEqual(model.notes('synth', pattern, 1), null);
	assert.equal(model.notes('drum', [null, null], 0), null);
});
test('expression changes velocity and gate within usable ranges and clamps both axes', () => {
	const model = new context.Expression();
	model.set('synth', -4, -2);
	const soft = model.velocity('synth'),
		long = model.gate('synth');
	model.set('synth', 5, 7);
	assert.equal(model.values.synth.x, 1);
	assert.equal(model.values.synth.y, 1);
	assert(model.velocity('synth') > soft);
	assert(model.gate('synth') < long);
	assert.equal(model.velocity('synth'), 127);
});
test('native XY touch and arrow keys change the selected instrument independently', () => {
	const model = new context.Expression(),
		handlers = {},
		style = {},
		attrs = {};
	let updates = 0;
	const pad = {
		style: {
			setProperty: (k, v) => {
				style[k] = v;
			}
		},
		setAttribute: (k, v) => {
			attrs[k] = v;
		},
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
		addEventListener: (name, fn) => {
			handlers[name] = fn;
		},
		setPointerCapture() {}
	};
	context.bindExpression(pad, model, 'drum', () => updates++);
	handlers.touchstart({
		preventDefault() {},
		changedTouches: [{ identifier: 1, clientX: 100, clientY: 0 }]
	});
	assert.equal(model.values.drum.x, 1);
	assert.equal(model.values.drum.y, 1);
	assert.equal(model.values.synth.x, 0.5);
	handlers.keydown({ code: 'ArrowLeft', preventDefault() {} });
	assert.equal(model.values.drum.x, 0.95);
	assert(updates >= 3);
	assert.equal(style['--x'], '95%');
});
