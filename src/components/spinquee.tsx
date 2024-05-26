import {MotionValue, motion, useSpring, useTransform} from 'framer-motion';
import {useEffect, useState, type PropsWithChildren} from 'react';

export interface SpinqueeProps {
	children: React.ReactNode[];
	size: number;
}

function duplicateChildren(children: React.ReactNode[], multiplier: number) {
	return [...Array(multiplier)].flatMap(() => children);
}

function Item({
	children,
	index,
	angle,
	total,
	size,
}: PropsWithChildren<{index: number; angle: MotionValue<number>; total: number; size: number}>) {
	return (
		<motion.div
			className="absolute top-1/2"
			style={{
				rotate: useTransform(angle, value => value + index * (360 / total)),
			}}
		>
			<div
				className="block -rotate-[180deg]"
				style={{
					marginLeft: -size,
					paddingLeft: size,
				}}
			>
				{children}
			</div>
		</motion.div>
	);
}

export function Spinquee({children, size}: SpinqueeProps) {
	const angle = useSpring(0, {
		stiffness: 1200,
		damping: 30,
		mass: 0.05,
	});

	const [container, setContainer] = useState<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!container) return;

		const wheel = (e: WheelEvent) => {
			angle.set(angle.get() + e.deltaY / 10);
		};

		container.addEventListener('wheel', wheel);

		return () => {
			container.removeEventListener('wheel', wheel);
		};
	}, [container, angle]);

	const duplicatedChildren = duplicateChildren(children, 10);

	return (
		<div ref={setContainer} className="h-full w-full">
			<div className="absolute inset-0 top-1/2 w-full -translate-y-1/2">
				{duplicatedChildren.map((child, index) => (
					<Item
						key={index}
						size={size}
						index={index}
						angle={angle}
						total={duplicatedChildren.length}
					>
						{child}
					</Item>
				))}
			</div>
		</div>
	);
}
