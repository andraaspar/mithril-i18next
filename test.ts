/* */; (global as any).window = new (require('jsdom').JSDOM)().window
/* */; (global as any).document = window.document
import { test } from 'ava'
import * as m from 'mithril'
import { Trans, nodesToString, renderNodes, Vnode } from './Trans'
import * as i18n from 'i18next'

i18n.init({
	lng: 'en',
	resources: {
		en: {
			translation: {
				'foo': 'baz',
				'foo<1>bar</1>baz': 'baz<1>foo</1>bar',
			},
		}
	},
})

test(t => {
	t.is(i18n.t('foo'), 'baz')
})

test(t => {
	const vnode = m('div', 'bar')
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(div.innerHTML, '<div>bar</div>')
})

test(t => {
	t.is(nodesToString('', [m('div', 'bar')], 0), '<0>bar</0>')
})

test(t => {
	t.is(nodesToString('', ['foo', m('b', m('i', 'bar')), 'baz'], 0), 'foo<1><0>bar</0></1>baz')
})

test(t => {
	const vnode = m('div', 'bar')
	t.is(nodesToString('', ['foo', vnode, 'baz'], 0), 'foo<1>bar</1>baz')
})

test(t => {
	const vnode = m('div', 'bar')
	const r = renderNodes([vnode], '<0>bar</0>')
	t.deepEqual(r, [vnode])
})

test(t => {
	const frag = m.fragment({}, [
		'foo',
		m('div', 'bar'),
		'baz',
	])
	const r = renderNodes(frag.children, 'foo<1>bar</1>baz')
	t.deepEqual(r, frag.children as any)
})

test(t => {
	const vnode = m(Trans, { i18nKey: 'foo' }, 'bar')
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(div.innerHTML, 'baz')
})

test(t => {
	const vnode = m(Trans, { i18nKey: 'foo<1>bar</1>baz' },
		'foo',
		m('div', 'bar'),
		'baz',
	)
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(div.innerHTML, 'baz<div>foo</div>bar')
})

test(t => {
	const vnode = m(Trans, { i18nKey: 'foo<1>bar</1>baz' },
		'foo',
		m('div', {class: 'yay'}, 'bar'),
		'baz',
	)
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(div.innerHTML, 'baz<div class="yay">foo</div>bar')
})