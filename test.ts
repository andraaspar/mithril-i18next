/* */; (global as any).window = new (require('jsdom').JSDOM)().window
/* */; (global as any).document = window.document
import { test } from 'ava';
import * as i18n from 'i18next';
import * as m from 'mithril';
import { Fragment } from './Fragment';
import { nodesToString, renderNodes, Trans } from './Trans';

i18n.init({
	lng: 'en',
	debug: true,
	resources: {
		en: {
			translation: {
				'foo': 'baz',
				'foo<1>bar</1>baz': 'baz<1>foo</1>bar',
				'foo<1>bar<1></1>baz</1>quux': 'quux<1>foo<1></1>bar</1>baz',
			},
		}
	},
})

class ClassComp {
	view(v: m.Vnode) {
		return m('div', 'ClassComp')
	}
}

const ObjComp = {
	view(v: m.Vnode) {
		return m('div', 'ObjComp')
	}
}

const NoTransFragment = {
	view(v: m.Vnode) {
		return v.children
	}
}

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
	t.is(nodesToString('', [m(ClassComp)], 0), '<0></0>')
})

test(t => {
	t.is(nodesToString('', [m(ObjComp)], 0), '<0></0>')
})

test(t => {
	t.is(nodesToString('', ['foo', m('b', 'bar')], 0), 'foo<1>bar</1>')
})

test(t => {
	t.is(nodesToString('', ['foo', m('b', 'bar'), 'baz'], 0), 'foo<1>bar</1>baz')
})

test(t => {
	t.is(nodesToString('', ['foo', m('b', m('i', 'bar')), 'baz'], 0), 'foo<1><0>bar</0></1>baz')
})

test(t => {
	t.is(nodesToString('', [m(ClassComp, m(ObjComp))], 0), '<0></0>')
})

test(t => {
	t.is(nodesToString('', [m(Fragment, m(ObjComp))], 0), '<0><0></0></0>')
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
	const vnode = m(Trans, { i18nKey: '' }, 'bar', m('b', 'baz'))
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(nodesToString('', vnode.children, 0), 'bar<1>baz</1>')
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
		m('div', { class: 'yay' }, 'bar'),
		'baz',
	)
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(div.innerHTML, 'baz<div class="yay">foo</div>bar')
})

test(t => {
	const vnode = m(Trans, { i18nKey: 'foo<1>bar<1></1>baz</1>quux' },
		'foo',
		m(Fragment, { a: true } as any,
			'bar',
			m(NoTransFragment, { b: true } as any,
				m(ClassComp, { c: true } as any, )
			),
			'baz',
		),
		'quux',
	)
	// t.is((vnode as any).children[1].tag, Fragment)
	// t.is((vnode as any).children[1].children[0].tag, NoTransFragment)
	// t.is((vnode as any).children[1].children[0].children[0].tag, ClassComp)
	// t.deepEqual((vnode as any).children[1].attrs, { a: true })
	// t.deepEqual((vnode as any).children[1].children[0].attrs, { b: true })
	// t.deepEqual((vnode as any).children[1].children[0].children[0].attrs, { c: true })
	const div = document.createElement('div')
	m.render(div, vnode)
	t.is(div.innerHTML, 'quuxfoo<div>ClassComp</div>barbaz')
})