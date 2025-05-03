export interface PostData {
	retcode: number;
	message: string;
	data: Data;
}

export interface Data {
	post: Post;
	post_detail_redirection_info: any;
}

export interface Post {
	post: PostDetail;
	forum: any;
	topics: Topic[];
	user: User;
	self_operation: SelfOperation;
	stat: Stat;
	help_sys: any;
	cover: any;
	image_list: ImageList[];
	is_official_master: boolean;
	is_user_master: boolean;
	hot_reply_exist: boolean;
	vote_count: number;
	last_modify_time: number;
	contribution: any;
	classification: Classification;
	video: VideoDetails;
	game: Game;
	data_box: string;
	is_top_icon: boolean;
	tags: Tags;
	hot_reply: any;
	collection: Collection;
	is_rich_text: boolean;
	catalog_style_hint: number;
	cover_list: CoverList[];
	cut_type: number;
	shows_game_classification: boolean;
	vote: VoteSummary;
	hot_reply_v2: any;
	feedback: any;
	reply_quick_source: any[];
	trans_source: string;
}

export interface PostDetail {
	game_id: number;
	post_id: string;
	f_forum_id: number;
	uid: string;
	subject: string;
	content: string;
	cover: string;
	view_type: number;
	created_at: number;
	images: any[];
	post_status: PostStatus;
	topic_ids: number[];
	view_status: number;
	max_floor: number;
	is_original: number;
	republish_authorization: number;
	reply_time: string;
	is_deleted: number;
	is_interactive: boolean;
	structured_content: string;
	structured_content_rows: any[];
	lang: string;
	official_type: number;
	reply_forbid: ReplyForbid;
	video: string;
	contribution_id: string;
	event_start_date: string;
	event_end_date: string;
	classification_id: string;
	is_audit: boolean;
	is_multi_language: boolean;
	origin_lang: string;
	sub_type: number;
	reprint_source: string;
	can_edit: boolean;
	last_modify_time: number;
	multi_language_info: any;
	visible_level: number;
	has_cover: boolean;
	suid: string;
	desc: string;
}

export interface PostStatus {
	is_top: boolean;
	is_good: boolean;
	is_official: boolean;
	is_vote: boolean;
	is_quiz_vote: boolean;
	is_demoted: boolean;
	is_hot: boolean;
}

export interface ReplyForbid {
	date_type: number;
	start_date: string;
	cur_date: string;
	level: number;
}

export interface Topic {
	id: number;
	name: string;
	cover: string;
	is_top: boolean;
	is_good: boolean;
	is_interactive: boolean;
	game_id: number;
	add_by: number;
	entry_style: number;
	can_bind_all_game: boolean;
	entry_style_start_at: string;
	detail_style: string;
}

export interface User {
	uid: string;
	nickname: string;
	introduce: string;
	avatar: string;
	gender: number;
	certification: Certification;
	level_exp: LevelExp;
	is_following: boolean;
	is_followed: boolean;
	avatar_url: string;
	auth: any;
	is_logoff: boolean;
	pendant: string;
	was_following: boolean;
	post_num: number;
	suid: string;
	black_relation: BlackRelation;
	badge: Badge;
	lantern: Lantern;
	otaku_devotion_title: OtakuDevotionTitle;
}

export interface Certification {
	type: number;
	icon_url: string;
	desc: string;
}

export interface LevelExp {
	level: number;
	exp: number;
}

export interface BlackRelation {
	is_blacking: boolean;
	is_blacked: boolean;
}

export interface Badge {
	id: string;
	level: number;
	icon_url: string;
	badge_app_path: string;
	badge_web_path: string;
	center_app_path: string;
	center_web_path: string;
	total: number;
}

export interface Lantern {
	id: string;
	light_url: string;
	dark_url: string;
	app_path: string;
	web_path: string;
	pendant_type: number;
}

export interface OtakuDevotionTitle {
	icon: string;
	name: string;
	desc: string;
	otaku_identity: string;
	accompany_title: string;
	role_id: string;
}

export interface SelfOperation {
	attitude: number;
	is_collected: boolean;
}

export interface Stat {
	view_num: number;
	reply_num: number;
	like_num: number;
	bookmark_num: number;
	share_num: number;
	view_num_unit: string;
	reply_num_unit: string;
	like_num_unit: string;
	bookmark_num_unit: string;
	share_num_unit: string;
	true_view_num: number;
	click_view_num: number;
	summary_for_creator: any;
	multi_upvote_stats: MultiUpvoteStat[];
	self_operation: any;
	expose_view_num: number;
}

export interface MultiUpvoteStat {
	upvote_id: string;
	upvote_num: number;
}

export interface ImageList {
	url: string;
	height: number;
	width: number;
	format: string;
	size: string;
	spoiler: boolean;
	cuts: Cut[];
	tag_info: TagInfo;
	template_info: any;
	image_id: string;
}

export interface Cut {
	ratio: number;
	lt_point: LtPoint;
	rb_point: RbPoint;
}

export interface LtPoint {
	x: number;
	y: number;
}

export interface RbPoint {
	x: number;
	y: number;
}

export interface TagInfo {
	is_long_picture: boolean;
}

export interface Classification {
	id: string;
	name: string;
	icon: string;
}

export interface Game {
	game_id: number;
	game_name: string;
	color: string;
	background_color: string;
	icon: string;
}

export interface Tags {
	is_user_top: boolean;
	is_qualified_post: boolean;
	is_hot_entry_post: boolean;
	hot_topic_idx: number;
	is_doujin_force_post: boolean;
	is_exclusive: boolean;
}

export interface Collection {
	id: string;
	title: string;
	current_index: number;
	post_num: number;
	last_id: string;
	next_id: string;
	cover: string;
}

export interface CoverList {
	url: string;
	height: number;
	width: number;
	format: string;
	size: string;
	spoiler: boolean;
	cuts: Cut[];
	tag_info: TagInfo;
	template_info: any;
	image_id: string;
}

export interface VideoDetails {
	id: string;
	cover: string;
	url: string;
	is_vertical: boolean;
	sub_type: number;
	resolution: Resolution[];
	status: string;
	cover_meta: CoverMeta;
}

export interface Resolution {
	name: string;
	height: string;
	width: string;
	url: string;
	duration: string;
}

export interface CoverMeta {
	url: string;
	height: number;
	width: number;
	format: string;
	size: string;
	spoiler: boolean;
}

export interface VoteSummary {
	score_board: any;
	vote_info_map: any;
	user_post_vote_status: string;
	is_all_vote_publish_answer: boolean;
	is_reminded: boolean;
	first_vote_info: any;
}

export interface StructuredInsert {
	insert: InsertImage | InsertVideo | InsertCard | Vote | Emoji | string;
	attributes?: Attributes;
}

export interface InsertImage {
	image: string;
	describe?: string;
}

export interface InsertVideo {
	video: string;
	describe?: string;
}

export interface Vote {
	vote: VoteDetails;
}

export interface VoteDetails {
	id: string;
	uid: string;
	url: string;
	title: string;
	vote_options: string[];
	vote_limit: number;
	end_time: string;
	end_time_type: string;
	sync_end_time_type: boolean;
	status: string;
}

export interface InsertCard {
	card_group: {
		article_cards: ArticleCard[];
	};
}

export interface ArticleCard {
	meta: Metadata;
	info: ArticleInfo;
	user: ArticleUser;
}

export interface Emoji {
	backup: Backup;
	emoticon: Emoticon;
}

export interface Backup {
	type: string;
	text: string;
}

export interface Emoticon {
	id: string;
	package_id: string;
	url: string;
	type: string;
}

export interface Attributes {
	link?: string;
	header?: number;
	align?: string;
	color?: string;
	background?: string;
	height?: number;
	width?: number;
	size?: string;
}

export interface Metadata {
	type: number;
	meta_id: string;
	origin_url: string;
}

export interface ArticleInfo {
	title: string;
	cover: string;
	has_cover: boolean;
	view_num: string;
	created_at: string;
	status: number;
	tip_msg: string;
	type_desc: string;
	view_type: number;
	sub_type: number;
	jump_url: string;
}

export interface ArticleUser {
	uid: string;
	avatar: string;
	icon_url: string;
	nickname: string;
	is_owner: boolean;
}
