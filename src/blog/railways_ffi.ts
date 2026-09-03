import {Railways} from '@/blog/2026/railways/railways';

const post = new Railways();

export const name = () => post.name;
export const slug = () => post.slug;
export const date = () => post.date.getTime();
export const hidden = () => post.hidden;
export const excerpt = () => post.excerpt;
export const keywords = () => post.keywords;
export const body = () => post.render();
