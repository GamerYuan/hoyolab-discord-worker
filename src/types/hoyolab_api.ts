export interface HoyolabList {
    retcode: number
    message: string
    data: Data
  }
  
  export interface Data {
    list: PostSummary[]
    is_last: boolean
    next_offset: string
  }
  
  export interface PostSummary {
    post: Post
    forum: any
    topics: Topic[]
    user: User
    self_operation: SelfOperation
    stat: Stat
    help_sys: HelpSys
    cover: any
    image_list: ImageList[]
    is_official_master: boolean
    is_user_master: boolean
    hot_reply_exist: boolean
    vote_count: number
    last_modify_time: number
    contribution: any
    classification: any
    video: any
    game: Game
    data_box: string
    is_top_icon: boolean
    tags: Tags
    hot_reply: any
    collection?: Collection
    is_rich_text: boolean
    catalog_style_hint: number
    cover_list: CoverList[]
    cut_type: number
    shows_game_classification: boolean
    vote: any
  }
  
  export interface Post {
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
    topic_ids: number[]
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
    reply_forbid: any
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
  
  export interface MultiLanguageInfo {
    langs: string[]
    future_post_id: string
    lang_subject: LangSubject
  }
  
  export interface LangSubject {
    "en-us": string
    "it-it"?: string
    "th-th"?: string
    "zh-cn"?: string
    "ko-kr"?: string
    "tr-tr"?: string
    "vi-vn": string
    "de-de"?: string
    "ru-ru"?: string
    "fr-fr"?: string
    "pt-pt"?: string
    "es-es"?: string
    "zh-tw"?: string
    "id-id": string
  }
  
  export interface Topic {
    id: number
    name: string
    cover: string
    is_top: boolean
    is_good: boolean
    is_interactive: boolean
    game_id: number
    add_by: number
    entry_style: number
    can_bind_all_game: boolean
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
  
  export interface HelpSys {
    top_up: any
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
  
  export interface Collection {
    id: string
    title: string
    current_index: number
    post_num: number
    last_id: string
    next_id: string
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
  