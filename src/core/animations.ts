import {MotionProps} from 'framer-motion';

export const animations: MotionProps = {
  initial: {
    x: '100%',
    // clipPath: 'circle(0% at 100% 100%)',
  },
  animate: {
    x: '0%',
    // clipPath: 'circle(150% at 0% 0%)',
  },
  exit: {
    x: '-100%',
    // clipPath: 'circle(0% at 0% 0%)',
  },
};
