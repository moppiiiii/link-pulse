export interface Article {
	id: string;
	title: string;
	description: string;
	url: string;
	source: string;
	publishedAt: string;
	category: string;
	isFavorite: boolean;
	isRead: boolean;
}

export interface Category {
	id: string;
	name: string;
	label: string;
	enabled: boolean;
}

export interface FeedSource {
	id: string;
	name: string;
	url: string;
	category: string;
	enabled: boolean;
}
