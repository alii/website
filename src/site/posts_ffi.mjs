import {createElement} from 'react';
import {posts} from '@/blog/posts';
import {PostListing} from '@/components/post-listing';
import {toList} from '../gleam.mjs';

export const all = () => toList(posts);
export const dateMs = post => post.date.getTime();
export const postListing = list => createElement(PostListing, {posts: list.toArray()});
