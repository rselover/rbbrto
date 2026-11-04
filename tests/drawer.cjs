const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
let time = 1000;
const context = vm.createContext({ Date: { now: () => time } });
vm.runInContext(
	readFileSync(`${__dirname}/../src/drawer.js`, 'utf8').replace(
		'export default class PerformanceDrawer',
		'class PerformanceDrawer'
	) + '\nthis.PerformanceDrawer=PerformanceDrawer;',
	context
);
function node() {
	const classes = new Set(),
		handlers = {};
	return {
		classes,
		handlers,
		attrs: {},
		classList: {
			toggle: (name, on) => (on ? classes.add(name) : classes.delete(name))
		},
		addEventListener: (name, fn) => {
			handlers[name] = fn;
		},
		setAttribute(name, value) {
			this.attrs[name] = value;
		},
		setPointerCapture() {},
		focus() {
			this.focused = true;
		}
	};
}
function setup(matches = true) {
	const panel = node(),
		button = node(),
		content = node();
	const elements = {
		'.performance-drawer': panel,
		'#drawer-toggle': button,
		'#drawer-content': content
	};
	let changed,
		adds = 0,
		removes = 0;
	const query = {
		matches,
		addEventListener: (_, fn) => {
			changed = fn;
			adds++;
		},
		removeEventListener: () => removes++
	};
	const root = { querySelector: selector => elements[selector] };
	const drawer = new context.PerformanceDrawer(root, query);
	return {
		drawer,
		panel,
		button,
		content,
		root,
		query,
		change: () => changed(),
		counts: () => ({ adds, removes })
	};
}
const touch = y => ({ changedTouches: [{ clientY: y }], preventDefault() {} });
test('compact drawer starts closed and inert; tap opens and Escape closes', () => {
	const { drawer, button, content, panel } = setup();
	assert.equal(content.inert, true);
	assert.equal(button.attrs['aria-expanded'], 'false');
	button.handlers.click();
	assert.equal(content.inert, false);
	assert(panel.classes.has('is-open'));
	panel.handlers.keydown({ code: 'Escape' });
	assert.equal(drawer.open, false);
	assert.equal(content.inert, true);
});
test('touch swipes open/close the handle and suppress compatibility clicks', () => {
	const { drawer, button } = setup();
	button.handlers.touchstart(touch(250));
	button.handlers.touchmove(touch(100));
	button.handlers.touchend(touch(100));
	assert.equal(drawer.open, true);
	button.handlers.click();
	assert.equal(drawer.open, true);
	time += 600;
	button.handlers.touchstart(touch(100));
	button.handlers.touchend(touch(250));
	assert.equal(drawer.open, false);
	assert.equal(button.handlers.touchcancel !== undefined, true);
	time += 600;
});
test('desktop stays inline and orientation changes correctly restore focusability', () => {
	const { drawer, query, change, content, button } = setup(false);
	assert.equal(content.inert, false);
	assert.equal(button.attrs['aria-expanded'], 'true');
	query.matches = true;
	change();
	assert.equal(content.inert, true);
	drawer.setOpen(true);
	query.matches = false;
	change();
	assert.equal(content.inert, false);
	assert.equal(button.attrs['aria-expanded'], 'true');
});
test('closing returns focus to the handle and media listeners are not duplicated', () => {
	const { drawer, content, button, counts, root } = setup();
	drawer.connect();
	assert.equal(counts().adds, 1);
	root.activeElement = {};
	content.contains = element => element === root.activeElement;
	drawer.setOpen(true);
	drawer.setOpen(false);
	assert.equal(button.focused, true);
	drawer.disconnect();
	assert.equal(counts().removes, 1);
	drawer.connect();
	assert.equal(counts().adds, 2);
});
