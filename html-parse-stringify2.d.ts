declare module "html-parse-stringify2" {
	export interface ITag {
		type: string
		name: string
		attrs: { [k: string]: string }
		voidElement: boolean
		children: ITag[]
		content: string
	}
	export function parse(htmlString: string, options?: any): ITag[]
	export function parse(stringify: ITag[]): string
}