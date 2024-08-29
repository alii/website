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
                    📝 welcome to my blog. here are my published posts:
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'blog-post-busan',
                content: (
                  <>
                    <Link href="/blog/busan" className="font-semibold hover:underline">
                      exploring busan 🌊
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      discovering the charm of korea's second-largest city (WIP)
                    </p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'upcoming-intro',
                content: (
                  <>
                    🚀 upcoming posts:
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
                      hellooo i am a work in progress
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
                      why i chose to study engineering
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      i don't know what i want to do with my life, and i don't know if i will ever figure it out - and that's okay
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
                    stay tuned for updates! 🚀
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