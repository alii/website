import type {Post} from '@/blog/Post';
import {posts} from '@/blog/posts';
import {PostListing} from '@/components/post-listing';
import {createElement} from 'react';

export const all = () => posts;
export const name = (post: Post) => post.name;
export const slug = (post: Post) => post.slug;
export const hidden = (post: Post) => post.hidden;
export const excerpt = (post: Post) => post.excerpt;
export const keywords = (post: Post) => post.keywords;
export const dateMs = (post: Post) => post.date.getTime();
export const render = (post: Post) => post.render();
export const postListing = (posts: Post[]) => createElement(PostListing, {posts});
