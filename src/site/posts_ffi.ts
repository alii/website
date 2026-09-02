import type {Post} from '@/blog/Post';
import {posts} from '@/blog/posts';
import {PostListing} from '@/components/post-listing';
import {toList, type List} from '@gleam/prelude.mjs';
import {createElement} from 'react';

export const all = () => toList<Post>([...posts]);
export const name = (post: Post) => post.name;
export const slug = (post: Post) => post.slug;
export const hidden = (post: Post) => post.hidden;
export const excerpt = (post: Post) => post.excerpt;
export const keywords = (post: Post) => toList(post.keywords);
export const dateMs = (post: Post) => post.date.getTime();
export const render = (post: Post) => post.render();
export const postListing = (list: List<Post>) =>
	createElement(PostListing, {posts: list.toArray()});
