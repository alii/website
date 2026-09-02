import type {Post} from '@/blog/Post';
import {posts} from '@/blog/posts';
import {PostListing} from '@/components/post-listing';
import {toList, type List} from '@gleam/prelude.mjs';
import {createElement} from 'react';

export const all = () => toList<Post>([...posts]);
export const dateMs = (post: Post) => post.date.getTime();
export const postListing = (list: List<Post>) =>
	createElement(PostListing, {posts: list.toArray()});
