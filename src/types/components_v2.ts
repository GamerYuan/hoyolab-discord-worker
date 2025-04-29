export interface UnfurledMediaItem {
	url: string;
}

export interface Component {
	/** The type of the component */
	type: number;
	/** 32 bit integer used as an optional identifier for component */
	id?: number;
}

export class Button implements Component {
	type = 2;
	/** 1 - Primary, 2 - Secondary, 3 - Success, 4 - Danger, 5 - Link, 6 - Premium */
	style: number = 1;
	label?: string;
	sku_id?: string;
	url?: string;
	disabled?: boolean;

	constructor(label?: string, style?: number, disabled?: boolean) {
		this.label = label;
		this.style = style ?? 1;
		this.disabled = disabled ?? false;
	}
}

export class Section implements Component {
	type = 9;
	/** Up to 3 Text Displays */
	components: TextDisplay[] = [];
	accessory?: Thumbnail | Button;
}

export class TextDisplay implements Component {
	type = 10;
	content: string;

	constructor(content: string) {
		this.content = content;
	}
}

export class Thumbnail implements Component {
	type = 11;
	media: UnfurledMediaItem = { url: '' };
	description?: string;
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;

	constructor(media: UnfurledMediaItem, description?: string) {
		this.media = media;
		this.description = description;
	}
}

export interface MediaGalleryItem {
	media: UnfurledMediaItem;
	description?: string;
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;
}

export class MediaGallery implements Component {
	type = 12;
	items: MediaGalleryItem[] = [];
}

export class Separator implements Component {
	type = 14;
	/** Whether a visual divider should be displayed in the component. Defaults to true */
	divider?: boolean;
	/** 1 for small padding, 2 for large padding. Defaults to 1 */
	spacing?: number;

	constructor(spacing?: number, divider?: boolean) {
		this.spacing = spacing ?? 1;
		this.divider = divider ?? true;
	}
}

export class Container implements Component {
	type = 17;
	/** Up to 10 components */
	components: Component[] = [];
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;
}
