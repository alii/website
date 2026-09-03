// Gleam owns the posts; this is the view of them for the TS API routes.
import type {Post} from '@gleam/website/blog/post.mjs';
import {all} from '@gleam/website/blog/posts.mjs';

export type {Post};

export const posts: Post[] = all().toArray();

export const sortPosts = (list: Post[]) => list.toSorted((a, b) => b.date - a.date);
