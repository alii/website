import {GetStaticProps} from 'next';
import Link from 'next/link';
import React from 'react';
import {getAllPosts, Post} from '../../core/blog';
import {Layout} from '../../layouts/Layout';

interface Props {
  posts: Pick<Post, 'title' | 'slug' | 'date' | 'cover' | 'excerpt'>[];
}

export default function Blog(props: Props) {
  return (
    <div className="bg-red-900 bg-opacity-50 h-full">
      <Layout>
        <Link href="/">Back</Link>
        <div className="mt-20">
          <h1 className="text-6xl font-bold mb-10">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {props.posts.map((post) => {
              return (
                <Link key={post.title} href={`/blog/${post.slug}`} passHref>
                  <a className="p-10 border border-gray-100 border-opacity-10 bg-black bg-opacity-20 bg-blur rounded-md my-2 block space-y-5">
                    <img src={post.cover} alt="Cover" className="rounded-lg h-72 w-full object-cover" />
                    <h1 className="text-3xl font-bold">{post.title}</h1>
                    <p>{post.excerpt}</p>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      posts: getAllPosts(['title', 'slug', 'date', 'cover', 'excerpt']),
    },
  };
};
