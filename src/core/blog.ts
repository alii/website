import fs from 'fs';
import {join} from 'path';
import matter from 'gray-matter';
import day from 'dayjs';

export interface Post {
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    twitter: string;
  };
  date: Date | string;
  content: string;
  slug: string;
  cover: string;
  tags: string;
}

const directory = join(process.cwd(), 'posts');

export function slugs() {
  return fs.readdirSync(directory);
}

type WithDate<T> = T & {date: Post['date']};

export function getPostBySlug<T extends keyof Post>(slug: string, fields: T[] = []): WithDate<Pick<Post, T>> {
  const realSlug = slug.replace(/\.md$/, '');
  const path = join(directory, `${realSlug}.md`);

  const fileContent = fs.readFileSync(path, 'utf-8');
  const {data, content} = matter(fileContent);

  return [...fields, 'date'].reduce((all, field) => {
    if (field === 'slug') return {...all, [field]: realSlug};
    if (field === 'content') return {...all, [field]: content};
    return {...all, [field]: data[field]};
  }, {} as WithDate<Pick<Post, T>>);
}

export function getAllPosts<T extends keyof Post>(fields: T[] = []): Pick<Post, T>[] {
  return slugs()
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => {
      return day(post1.date).isAfter(post2.date) ? -1 : 1;
    });
}
