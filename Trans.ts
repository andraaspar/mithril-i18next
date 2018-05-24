import * as m from 'mithril'
import { MithrilTsxComponent } from 'mithril-tsx-component'
import * as i18n from 'i18next'
import * as HTML from 'html-parse-stringify2'
import { t, TranslationOptions } from 'i18next';
import { Fragment, IFragmentAttrs } from './Fragment'

export interface ITransAttrs {
	i18nKey: string
	count?: number
	ns?: string
	tOptions?: TranslationOptions
}

export type Vnode = m.Vnode<ITransAttrs, Trans>
export type VnodeDOM = m.VnodeDOM<ITransAttrs, Trans>

export class Trans extends MithrilTsxComponent<ITransAttrs> {
	__compName = 'Trans'

	// oninit(v: Vnode) {}
	// onbeforeupdate(v: Vnode, o: VnodeDOM) {}
	view(v: Vnode) {
		return m(Fragment, {},
			...renderNodes(
				v.children,
				t(v.attrs.i18nKey, {
					...v.attrs.tOptions,
					...{
						interpolation: { prefix: '#$?', suffix: '?$#' },
						defaultValue: nodesToString('', v.children, 0),
						count: v.attrs.count,
						ns: v.attrs.ns,
					},
				})
			)
		)
	}
	// oncreate(v: VnodeDOM) {}
	// onupdate(v: VnodeDOM) {}
	// onbeforeremove(v: VnodeDOM) {}
	// onremove(v: VnodeDOM) {}
}

export interface ChildArray extends Array<Children> { }
export type Children = ChildArray | Child
export type Child = m.Child | { format: string }
export interface Dummy {
	dummy?: boolean
	children?: Children
	text?: string
}

function isTextNode(o: any): o is m.Vnode {
	return o && typeof o === 'object' && (o as m.Vnode).tag === '#'
}

function getText(node: Dummy | Child): string {
	let c = node && ((node as any).children || (node as any).text)
	if (!c) return ''
	if (Array.isArray(c)) return c.join('')
	return c
}

function hasChildren(node: Dummy | Child): boolean {
	return getChildren(node).length > 0
}

function getChildren(node: Dummy | Child) {
	let c = node && ((node as any).children || (node as any).text)
	if (!c) return []
	if (!Array.isArray(c)) return [c]
	return c
}

function isDummy(o: any): o is Dummy {
	return !!(o && typeof o === 'object' && (o as Dummy).dummy)
}

function isComponent(o: any): o is m.Component {
	return o && (typeof o === 'object' || typeof o === 'function') && typeof o.view === 'function'
}

function isComponentNode(o: any): o is m.Vnode {
	return isComponent(o && typeof o === 'object' && (o as m.Vnode).tag || undefined)
}

function isVnode(o: any): o is m.Vnode {
	return !!(o && typeof o === 'object' && (o as m.Vnode).tag)
}

export function nodesToString(mem: string, children: Children, index: number) {
	if (!children) return ''
	if (!Array.isArray(children)) children = [children]

	children.forEach((child, i) => {
		const elementKey = `${i}`

		if (Array.isArray(child)) {
			mem += nodesToString('', child, i + 1)
		} else if (typeof child === 'string') {
			mem += `${child}`
		} else if (isTextNode(child)) {
			mem += `${getText(child)}`
		} else if (hasChildren(child)) {
			mem += `<${elementKey}>${nodesToString('', getChildren(child), i + 1)}</${elementKey}>`
		} else if (isComponentNode(child)) {
			mem += `<${elementKey}></${elementKey}>`
		} else if (typeof child === 'object' && child) {
			const clone = { ...(child as any as { format: string }) }
			const format = clone.format
			delete clone.format

			const keys = Object.keys(clone)
			if (format && keys.length === 1) {
				mem += `<${elementKey}>{{${keys[0]}, ${format}}}</${elementKey}>`
			} else if (keys.length === 1) {
				mem += `<${elementKey}>{{${keys[0]}}}</${elementKey}>`
			} else if (console && console.warn) {
				// not a valid interpolation object (can only contain one value plus format)
				console.warn(`mithril-i18next: the passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.`, child)
			}
		} else if (console && console.warn) {
			console.warn(`mithril-i18next: the passed in value is invalid - seems you passed in a variable like {number} - please pass in variables for interpolation as full objects like {{number}}.`, child)
		}
	})

	return mem
}

export function renderNodes(children: Children, targetString: string): m.ChildArray {
	if (targetString === "") return []
	if (!children) return [targetString]

	// parse ast from string with additional wrapper tag
	// -> avoids issues in parser removing prepending text nodes
	const ast = HTML.parse(`<0>${targetString}</0>`)

	function mapAST(mNodes: (Child | { dummy: boolean, children: Children })[], astNodes: HTML.ITag[]) {
		if (!Array.isArray(mNodes)) mNodes = [mNodes]
		if (!Array.isArray(astNodes)) astNodes = [astNodes]

		return astNodes.reduce((mem, node, i) => {
			if (node.type === 'tag') {
				const child: Dummy | Child = mNodes[parseInt(node.name, 10)] || {}

				if (typeof child === 'string') {
					mem.push(child)
				} else if (hasChildren(child)) {
					const inner = mapAST(getChildren(child as m.Vnode), node.children)

					if (isVnode(child)) {
						mem.push(
							m(
								child.tag as any,
								{ ...child.attrs },
								inner as any,
							)
						)
					} else if (isDummy(child)) {
						mem.push(
							m(Fragment, {}, inner as any)
						)
					}
				} else if (typeof child === 'object' && !isVnode(child)) {
					const interpolated = (i18n as any).services.interpolator.interpolate(node.children[0].content, child, i18n.language)
					mem.push(interpolated)
				} else {
					mem.push(child)
				}
			} else if (node.type === 'text') {
				mem.push(node.content)
			}
			return mem
		}, [] as m.ChildArray)
	}

	// call mapAST with having vnodes nested into additional node like
	// we did for the string ast from translation
	// return the children of that extra node to get expected result
	const result = mapAST([{ dummy: true, children }], ast)
	return getChildren(result[0] as Child)
}