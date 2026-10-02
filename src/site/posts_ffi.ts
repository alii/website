import type {Post} from '@/blog/Post';
import {posts} from '@/blog/posts';

export const all = (): readonly Post[] => posts;
export const name = (post: Post) => post.name;
export const slug = (post: Post) => post.slug;
export const date = (post: Post) => post.date.getTime();
export const hidden = (post: Post) => post.hidden;
export const excerpt = (post: Post) => post.excerpt;
export const keywords = (post: Post) => post.keywords;
