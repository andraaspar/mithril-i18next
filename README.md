# mithril-i18next
> [i18next](https://www.i18next.com) integration for Mithril.

The only thing this adds currently, is a `Trans` component, inspired by the similar component in [react-i18next](https://react.i18next.com). Please check the docs there for more details.

The main difference from react-i18next is that there is no `I18nextProvider` here. It simply uses the global i18next.

## Trans component

### Example use:

```JS
m(Trans, { i18nKey: 'foo' },
	'Please ',
	m(a, { href: '#' },
		'click here'
	),
	' to follow the link.'
)
```

## Changelog

**0.4.1** Fixed should not alter children of non-fragments.

**0.4.0** Fixed recursing inside fragments.

**0.3.0** Fixed recursing inside component children.

**0.2.1** Fixed isComponent check.

**0.2.0** Fixed text node handling.