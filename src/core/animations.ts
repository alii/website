import {MotionProps} from 'framer-motion';

export const animations: Pick<MotionProps, 'initial' | 'animate' | 'exit'> = {
  initial: {
    opacity: 0,
    y: 500,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
  },
};
