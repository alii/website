import {MotionProps} from 'framer-motion';

export const animations: Pick<MotionProps, 'initial' | 'animate' | 'exit'> = {
  initial: {
    y: '-100%',
  },
  animate: {
    y: '0%',
  },
  exit: {
    y: '100%',
  },
};
