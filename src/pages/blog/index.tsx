import Link from 'next/link';
import {motion} from 'framer-motion';
import {MessageGroup} from '../../components/message';

const ReturnArrow = () => (
  <Link href="/" className="fixed top-4 left-4 text-2xl text-neutral-600 hover:text-neutral-900 transition-colors">
    ←
  </Link>
);

export default function BlogList() {
  return (
    <>
      <ReturnArrow />
      <main className="mx-auto max-w-xl px-3 pb-16 pt-24">
        <motion.ul
          transition={{
            staggerChildren: 0.3,
            delayChildren: 0.3,
          }}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <MessageGroup
            messages={[
              {
                key: 'blog-intro',
                content: (
                  <>
                    📝 welcome to my blog. here are some of my recent posts:
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'blog-post-1',
                content: (
                  <>
                    <Link href="/blog/post-1" className="font-semibold hover:underline">
                      I am a Placeholder! 안녕 혜수 내 사랑
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      I am a placeholder post.
                    </p>
                  </>
                ),
              },
              {
                key: 'blog-post-2',
                content: (
                  <>
                    <Link href="/blog/post-2" className="font-semibold hover:underline">
                      I am a Placeholder!
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      I am a placeholder post.
                    </p>
                  </>
                ),
              },
              {
                key: 'blog-post-3',
                content: (
                  <>
                    <Link href="/blog/post-3" className="font-semibold hover:underline">
                      I am a Placeholder!
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      I am a placeholder post.
                    </p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'blog-outro',
                content: (
                  <>
                    more coming soon! stay tuned for updates. 🚀
                  </>
                ),
              },
            ]}
          />
        </motion.ul>
      </main>
    </>
  );
}