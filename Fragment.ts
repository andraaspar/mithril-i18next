import * as m from 'mithril'
import { MithrilTsxComponent } from 'mithril-tsx-component'

export interface IFragmentAttrs { }

export type Vnode = m.Vnode<IFragmentAttrs, Fragment>
export type VnodeDOM = m.VnodeDOM<IFragmentAttrs, Fragment>

export class Fragment extends MithrilTsxComponent<IFragmentAttrs> {
	__compName = __filename

	// oninit(v: Vnode) {}
	// onbeforeupdate(v: Vnode, o: VnodeDOM) {}
	view(v: Vnode) {
		return (
			v.children
		)
	}
	// oncreate(v: VnodeDOM) {}
	// onupdate(v: VnodeDOM) {}
	// onbeforeremove(v: VnodeDOM) {}
	// onremove(v: VnodeDOM) {}
}