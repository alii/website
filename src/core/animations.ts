import {MotionProps} from 'framer-motion';

export const animations: Pick<MotionProps, 'initial' | 'animate' | 'exit'> = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};
