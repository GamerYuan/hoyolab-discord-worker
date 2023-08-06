export interface Message {
    content?: string
    username?: string
    avatar_url?: string
    tts?: boolean
    embeds?: Embed[]
    allowed_mentions?: {
      parse?: ('roles' | 'users' | 'everyone')[]
      roles?: string[]
      users?: string[]
    }
}

export interface Embed {
    title? : string;
    description? : string;
    author? : Author;
    color? : number;
    url? : string;
    fields? : Field[];
    footer? : Footer;
    timestamp? : Date;
    image? : Image;
}

export interface Field {
    name : string;
    value : string;
    inline : boolean;
}

export interface Footer {
    text? : string;
    icon_url? : string;
}

export interface Image {
    url : string;
}

export interface Attachments {
    text : string;
}

export interface Author {
    name : string;
    url? : string;
    icon_url? : string;
}