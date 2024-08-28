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
                      안녕 혜수 내 사랑
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      hellooo i am a placeholder description
                    </p>
                  </>
                ),
              },
              {
                key: 'blog-post-2',
                content: (
                  <>
                    <Link href="/blog/post-2" className="font-semibold hover:underline">
                      south korea - my second home 🇰🇷
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      my life in south korea
                    </p>
                  </>
                ),
              },
              {
                key: 'blog-post-3',
                content: (
                  <>
                    <Link href="/blog/post-3" className="font-semibold hover:underline">
                      gallium ai - my first failed startup (WIP)
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      marina bay sands will make you try to start random companies
                    </p>
                  </>
                ),
              },
              {
                key: 'blog-post-4',
                content: (
                  <>
                    <Link href="/blog/post-4" className="font-semibold hover:underline">
                      why i chose to study engineering - my why of life
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      i don't know what i want to do with my life, and i don't know if i will ever figure it out - and that's okay
                    </p>
                  </>
                ),
              },
              {
                key: 'blog-post-5',
                content: (
                  <>
                    <Link href="/blog/post-5" className="font-semibold hover:underline">
                      exploring busan 🌊
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      discovering the charm of korea's second-largest city
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
                    more coming soon! stay tuned for updates. 🚀 (this page is a WIP)
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