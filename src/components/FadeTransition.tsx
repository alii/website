import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface FadeTransitionProps {
  children: ReactNode;
}

export default function FadeTransition({ children }: FadeTransitionProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => setIsExiting(true);
    const handleRouteChangeComplete = () => setIsExiting(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}