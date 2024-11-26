import { Post } from './hoyolab_post';

export interface HoyolabList {
	retcode: number;
	message: string;
	data: Data;
}

export interface Data {
	list: Post[];
	is_last: boolean;
	next_offset: string;
}
