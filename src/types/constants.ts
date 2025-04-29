export const LANG_ABBR: string[] = [
	'en-us',
	'zh-cn',
	'zh-tw',
	'de-de',
	'es-es',
	'fr-fr',
	'id-id',
	'it-it',
	'ja-jp',
	'ko-kr',
	'pt-pt',
	'ru-ru',
	'th-th',
	'tr-tr',
	'vi-vn',
];

// Define a type for localisation strings
export type LocalisationStrings = {
	details: string;
	footer: string;
	video: string;
	video_button: string;
	vote_button: string;
};

// Consolidate localisation strings into a single object
export const LOCALISATION_STRINGS: Record<string, LocalisationStrings> = {
	'en-us': {
		details: 'Read more details in the post!',
		footer: 'Translated',
		video: 'Video',
		video_button: 'Watch Video Here!',
		vote_button: 'Vote Here!',
	},
	'zh-cn': {
		details: '更多详情阅读原文',
		footer: '已翻译',
		video: '视频',
		video_button: '在此观看视频！',
		vote_button: '在此投票！',
	},
	'zh-tw': {
		details: '更多詳情閱讀原文',
		footer: '已翻譯',
		video: '影片',
		video_button: '在此觀看影片！',
		vote_button: '在此投票！',
	},
	'de-de': {
		details: 'Weitere Details lesen Sie im Beitrag',
		footer: 'Übersetzt',
		video: 'Video',
		video_button: 'Video hier ansehen!',
		vote_button: 'Hier abstimmen!',
	},
	'es-es': {
		details: 'Lea más detalles en la publicación',
		footer: 'Traducido',
		video: 'Vídeo',
		video_button: '¡Ver vídeo aquí!',
		vote_button: '¡Vota aquí!',
	},
	'fr-fr': {
		details: 'Lire plus de détails dans le post',
		footer: 'Traduit',
		video: 'Vidéo',
		video_button: 'Regarder la vidéo ici !',
		vote_button: 'Votez ici !',
	},
	'id-id': {
		details: 'Baca lebih detail di postingan',
		footer: 'Diterjemahkan',
		video: 'Video',
		video_button: 'Tonton Video Di Sini!',
		vote_button: 'Vote Di Sini!',
	},
	'it-it': {
		details: 'Leggi maggiori dettagli nel post',
		footer: 'Tradotto',
		video: 'Video',
		video_button: 'Guarda il video qui!',
		vote_button: 'Vota qui!',
	},
	'ja-jp': {
		details: '詳細については投稿をご覧ください',
		footer: '翻訳しました',
		video: '動画',
		video_button: 'ここで動画を見る！',
		vote_button: 'ここで投票！',
	},
	'ko-kr': {
		details: '게시물에서 자세한 내용 읽기',
		footer: '번역됨',
		video: '비디오',
		video_button: '여기서 비디오 보기!',
		vote_button: '여기서 투표하세요!',
	},
	'pt-pt': {
		details: 'Leia mais detalhes no post',
		footer: 'Traduzido',
		video: 'Vídeo',
		video_button: 'Assista ao vídeo aqui!',
		vote_button: 'Vote aqui!',
	},
	'ru-ru': {
		details: 'Подробнее читайте в посте',
		footer: 'Переведено',
		video: 'Видео',
		video_button: 'Смотреть видео здесь!',
		vote_button: 'Голосовать здесь!',
	},
	'th-th': {
		details: 'อ่านรายละเอียดเพิ่มเติมในโพสต์',
		footer: 'แปลแล้ว',
		video: 'วิดีโอ',
		video_button: 'ดูวิดีโอที่นี่!',
		vote_button: 'โหวตที่นี่!',
	},
	'tr-tr': {
		details: 'Gönderide daha fazla ayrıntı okuyun',
		footer: 'Çevrildi',
		video: 'Video',
		video_button: 'Videoyu Buradan İzleyin!',
		vote_button: 'Buradan Oy Verin!',
	},
	'vi-vn': {
		details: 'Đọc thêm chi tiết trong bài viết',
		footer: 'Đã dịch',
		video: 'Video',
		video_button: 'Xem Video Tại Đây!',
		vote_button: 'Bình Chọn Tại Đây!',
	},
};

export const DEFAULT_HEADER_DICT = {
	Accept: 'application/json',
	'X-Rpc-Language': 'en-us',
	'X-Rpc-Show-Translated': 'true',
	'X-Rpc-App_version': '3.9.0',
	'User-Agent': 'Mozilla/5.0',
};
