export interface UnfurledMediaItem {
	url: string;
}

export interface Component {
	/** The type of the component */
	type: number;
	/** 32 bit integer used as an optional identifier for component */
	id?: number;
}

export interface Button extends Component {
	type: 2;
	/** 1 - Primary, 2 - Secondary, 3 - Success, 4 - Danger, 5 - Link, 6 - Premium */
	style: 1 | 2 | 3 | 4 | 5 | 6;
	label?: string;
	sku_id?: string;
	url?: string;
	disabled?: boolean;
}

export interface Section extends Component {
	type: 9;
	/** Up to 3 Text Displays */
	components: TextDisplay[];
	accessory?: Thumbnail | Button;
}

export interface TextDisplay extends Component {
	type: 10;
	content: string;
}

export interface Thumbnail extends Component {
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

export interface MediaGallery extends Component {
	type: 12;
	items: MediaGalleryItem[];
}

export interface Separator extends Component {
	type: 14;
	/** Whether a visual divider should be displayed in the component. Defaults to true */
	divider?: boolean;
	/** 1 for small padding, 2 for large padding. Defaults to 1 */
	spacing?: number;
}

export interface Container extends Component {
	type: 17;
	/** Up to 10 components */
	components: Component[];
	/** Whether the container should be a spoiler (or blurred out). Defaults to false */
	spoiler?: boolean;
}
