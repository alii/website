import {MotionProps} from 'framer-motion';

export const animations: MotionProps = {
	initial: {
		x: '-100%',
		opacity: 0,
	},
	animate: {
		x: '0%',
		opacity: 1,
	},
	exit: {
		x: '100%',
		opacity: 0,
	},
};
