import {getAllPosts, getPostBySlug, Post} from '../../core/blog';
import {GetStaticPaths, GetStaticProps} from 'next';
import Head from 'next/head';
import {Layout} from '../../layouts/Layout';
import React from 'react';
import hydrate from 'next-mdx-remote/hydrate';
import {data} from 'autoprefixer';
import renderToString from 'next-mdx-remote/render-to-string';
import rehypePrism from '@mapbox/rehype-prism';
import {MdxRemote} from 'next-mdx-remote/types';

import 'prism-themes/themes/prism-coldark-dark.css';
import Link from 'next/link';

type SlugProps = {post: Post; content: MdxRemote.Source};

export default function Slug({post, content: mdxContent}: SlugProps) {
  const content = hydrate(mdxContent);

  return (
    <div className="bg-gray-900 bg-opacity-50 h-full">
      <Layout>
        <Head>
          <title>{post.title}</title>
          <meta name="description" content={post.excerpt} />
          <meta name="twitter:site" content={'@' + post.author.twitter} />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:description" content={post.excerpt} />
          <meta name="twitter:creator" content={'@' + post.author.twitter} />
          <meta name="twitter:image" content={`https://blog.alistair.cloud${post.cover}`} />
          <meta property="og:title" content={post.title} />
          <meta property="og:author" content={post.author.name} />
          <meta property="og:url" content={`https://blog.alistair.cloud/post/${post.slug}`} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:image" content={`https://blog.alistair.cloud${post.cover}`} />
          <meta name="keywords" content={post.tags} />
          <meta property="og:type" content="website" />
        </Head>
        <Link href="/blog">Back</Link>
        <div className="mt-20">
          <h1 className="text-6xl text-center md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-5">
            {post.title}
          </h1>

          <div className="mt-44 max-w-3xl p-10 mx-auto prose prose-dark glass rounded-lg">{content}</div>
        </div>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticProps<SlugProps> = async (ctx) => {
  const post = getPostBySlug(ctx.params?.slug as string, ['title', 'excerpt', 'author', 'content', 'cover', 'slug', 'tags']);

  const mdxSource = await renderToString(post.content, {
    scope: data,
    mdxOptions: {
      remarkPlugins: [require('remark-autolink-headings'), require('remark-slug'), require('remark-code-titles')],
      rehypePlugins: [rehypePrism],
    },
  });

  return {
    props: {
      post,
      content: mdxSource,
    },
    revalidate: 120,
  };
};

export const getStaticPaths: GetStaticPaths = async function () {
  const posts = getAllPosts(['slug']);

  return {
    paths: posts.map((post) => {
      return {params: {slug: post.slug}};
    }),
    fallback: 'blocking',
  };
};
