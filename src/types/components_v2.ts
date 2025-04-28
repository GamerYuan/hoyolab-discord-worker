export interface UnfurledMediaItem {
	url: string;
}

export interface ComponentV2 {
	/** The type of the component */
	type: number;
	/** 32 bit integer used as an optional identifier for component */
	id?: number;
}

export interface TextDisplay extends ComponentV2 {
	type: 10;
	content: string;
}

export interface Thumbnail extends ComponentV2 {
	type: 11;
	media: UnfurledMediaItem;
	description?: string;
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;
}

export interface MediaGalleryItem {
	media: UnfurledMediaItem;
	description?: string;
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;
}

export interface MediaGallery extends ComponentV2 {
	type: 12;
	items: MediaGalleryItem[];
}

export interface Separator extends ComponentV2 {
	type: 14;
	/** Whether a visual divider should be displayed in the component. Defaults to true */
	divider?: boolean;
	/** 1 for small padding, 2 for large padding. Defaults to 1 */
	spacing?: number;
}

export interface Container extends ComponentV2 {
	type: 17;
	/** Up to 10 components */
	components: ComponentV2[];
	/** Color for the accent on the container as RGB from 0x000000 to 0xFFFFFF */
	accent_color?: number;
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;
}
