export interface PostData {
    retcode: number
    message: string
    data: Data
  }
  
  export interface Data {
    post: Post
  }
  
  export interface Post {
    post: Post2
    forum: any
    topics: any[]
    user: User
    self_operation: SelfOperation
    stat: Stat
    help_sys: any
    cover: any
    image_list: ImageList[]
    is_official_master: boolean
    is_user_master: boolean
    hot_reply_exist: boolean
    vote_count: number
    last_modify_time: number
    contribution: any
    classification: Classification
    video: any
    game: Game
    data_box: string
    is_top_icon: boolean
    tags: Tags
    hot_reply: HotReply
    collection: any
    is_rich_text: boolean
    catalog_style_hint: number
    cover_list: CoverList[]
    cut_type: number
    shows_game_classification: boolean
    vote: any
  }
  
  export interface Post2 {
    game_id: number
    post_id: string
    f_forum_id: number
    uid: string
    subject: string
    content: string
    cover: string
    view_type: number
    created_at: number
    images: any[]
    post_status: PostStatus
    topic_ids: any[]
    view_status: number
    max_floor: number
    is_original: number
    republish_authorization: number
    reply_time: string
    is_deleted: number
    is_interactive: boolean
    structured_content: string
    structured_content_rows: any[]
    lang: string
    official_type: number
    reply_forbid: ReplyForbid
    video: string
    contribution_id: string
    event_start_date: string
    event_end_date: string
    classification_id: string
    is_audit: boolean
    is_multi_language: boolean
    origin_lang: string
    sub_type: number
    reprint_source: string
    can_edit: boolean
    last_modify_time: number
    multi_language_info: MultiLanguageInfo
    visible_level: number
    has_cover: boolean
    suid: string
  }
  
  export interface PostStatus {
    is_top: boolean
    is_good: boolean
    is_official: boolean
  }
  
  export interface ReplyForbid {
    date_type: number
    start_date: string
    cur_date: string
    level: number
  }
  
  export interface MultiLanguageInfo {
    langs: string[]
    future_post_id: string
    lang_subject: LangSubject
  }
  
  export interface LangSubject {
    "zh-tw": string
    "ru-ru": string
    "tr-tr": string
    "th-th": string
    "fr-fr": string
    "de-de": string
    "ja-jp": string
    "en-us": string
    "id-id": string
    "es-es": string
    "it-it": string
    "zh-cn": string
    "ko-kr": string
    "pt-pt": string
    "vi-vn": string
  }
  
  export interface User {
    uid: string
    nickname: string
    introduce: string
    avatar: string
    gender: number
    certification: Certification
    level_exp: LevelExp
    is_following: boolean
    is_followed: boolean
    avatar_url: string
    auth: any
    is_logoff: boolean
    pendant: string
    was_following: boolean
    post_num: number
    suid: string
  }
  
  export interface Certification {
    type: number
    icon_url: string
    desc: string
  }
  
  export interface LevelExp {
    level: number
    exp: number
  }
  
  export interface SelfOperation {
    attitude: number
    is_collected: boolean
  }
  
  export interface Stat {
    view_num: number
    reply_num: number
    like_num: number
    bookmark_num: number
    share_num: number
    view_num_unit: string
    reply_num_unit: string
    like_num_unit: string
    bookmark_num_unit: string
    share_num_unit: string
    true_view_num: number
    click_view_num: number
    summary_for_creator: any
  }
  
  export interface ImageList {
    url: string
    height: number
    width: number
    format: string
    size: string
    spoiler: boolean
    cuts: any[]
    tag_info: TagInfo
  }
  
  export interface TagInfo {
    is_long_picture: boolean
  }
  
  export interface Classification {
    id: string
    name: string
    icon: string
  }
  
  export interface Game {
    game_id: number
    game_name: string
    color: string
    background_color: string
    icon: string
  }
  
  export interface Tags {
    is_user_top: boolean
    is_qualified_post: boolean
  }
  
  export interface HotReply {
    reply_id: string
    content: string
    uid: string
    nickname: string
    type: string
    floor_id: number
    suid: string
  }
  
  export interface CoverList {
    url: string
    height: number
    width: number
    format: string
    size: string
    spoiler: boolean
    cuts: any[]
    tag_info: TagInfo2
  }
  
  export interface TagInfo2 {
    is_long_picture: boolean
  }
  