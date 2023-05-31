import {APIResponse} from 'nextkit';

export interface PartialBlogPost {
	name: string;
	slug: string;
	date: string;
	hidden: boolean;
	excerpt: string;
	keywords: string[];
}

export async function getRecentBlogPosts() {
	const response = await fetch('https://alistair.blog/api/posts');

	const json = (await response.json()) as APIResponse<PartialBlogPost[]>;

	if (!json.success) {
		throw new Error(json.message);
	}

	return json.data;
}
