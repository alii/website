import Link from 'next/link';
import {motion} from 'framer-motion';
import {MessageGroup} from '../../components/message';

const ReturnArrow = () => (
  <Link href="/blog" className="fixed top-4 left-4 text-2xl text-neutral-600 hover:text-neutral-900 transition-colors">
    ←
  </Link>
);

export default function BusanBlogPost() {
  return (
    <>
      <ReturnArrow />
      <main className="mx-auto max-w-xl px-3 pb-16 pt-24">
        <motion.div
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
                key: 'blog-title',
                content: (
                  <h1 className="text-3xl font-bold">exploring busan 🌊</h1>
                ),
              },
              {
                key: 'blog-date',
                content: (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    aug 26-28, 2024
                  </p>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'intro',
                content: (
                  <>
                    <p>혜수 and i went to busan for a short trip!</p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'image-1',
                content: (
                  <div className="space-y-2">
                    <img
                      src="/placeholder-image-1.jpg"
                      alt="Busan cityscape"
                      className="w-full rounded-lg shadow-md"
                    />
                    <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                      Caption: Breathtaking view of Busan's skyline
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'day-1',
                content: (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">Day 1: Arrival and First Impressions</h2>
                    <p>[Write about your arrival in Busan, first impressions, and what you did on the first day]</p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'image-2',
                content: (
                  <div className="space-y-2">
                    <img
                      src="/placeholder-image-2.jpg"
                      alt="Haeundae Beach"
                      className="w-full rounded-lg shadow-md"
                    />
                    <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                      Caption: Enjoying the sun at Haeundae Beach
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'day-2',
                content: (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">Day 2: Exploring Busan's Landmarks</h2>
                    <p>[Describe your visits to famous landmarks, such as Gamcheon Culture Village or Busan Tower]</p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'image-3',
                content: (
                  <div className="space-y-2">
                    <img
                      src="/placeholder-image-3.jpg"
                      alt="Gamcheon Culture Village"
                      className="w-full rounded-lg shadow-md"
                    />
                    <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                      Caption: Colorful houses of Gamcheon Culture Village
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'food-experience',
                content: (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">Busan's Culinary Delights</h2>
                    <p>[Share your experiences with Busan's local cuisine, favorite dishes, and restaurant recommendations]</p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'image-4',
                content: (
                  <div className="space-y-2">
                    <img
                      src="/placeholder-image-4.jpg"
                      alt="Local Busan cuisine"
                      className="w-full rounded-lg shadow-md"
                    />
                    <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                      Caption: Mouthwatering local seafood dish
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'conclusion',
                content: (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">Final Thoughts</h2>
                    <p>[Summarize your Busan experience, highlights of the trip, and why others should visit]</p>
                  </>
                ),
              },
            ]}
          />

          <MessageGroup
            messages={[
              {
                key: 'outro',
                content: (
                  <>
                    <p>Thanks for reading about my Busan adventure! Have you been to Busan or planning to visit? Let me know in the comments below or reach out to me on social media.</p>
                  </>
                ),
              },
            ]}
          />
        </motion.div>
      </main>
    </>
  );
}
