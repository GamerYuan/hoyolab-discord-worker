import { Component } from './components_v2';

export interface Message {
	content?: string;
	username?: string;
	avatar_url?: string;
	tts?: boolean;
	components?: Component[];
	allowed_mentions?: {
		parse?: ('roles' | 'users' | 'everyone')[];
		roles?: string[];
		users?: string[];
	};
	flags?: number;
}
