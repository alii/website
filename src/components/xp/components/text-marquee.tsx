import {useEffect, useRef, useState} from 'react';
import Marquee from 'react-fast-marquee';

export function TextMarquee({children}: {children: string}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [needsMarquee, setNeedsMarquee] = useState(false);

	useEffect(() => {
		if (!containerRef.current || !contentRef.current) {
			return;
		}

		const calculate = () => {
			() => {
				if (!containerRef.current || !contentRef.current) return;
				const containerWidth = containerRef.current.clientWidth;
				const contentWidth = contentRef.current.scrollWidth;

				setNeedsMarquee(contentWidth > containerWidth);
			};
		};

		const resizeObserver = new ResizeObserver(calculate);

		resizeObserver.observe(containerRef.current);
		resizeObserver.observe(contentRef.current);

		calculate();

		return () => resizeObserver.disconnect();
	}, [children]);

	if (!needsMarquee) {
		return (
			<div ref={containerRef} className="overflow-hidden">
				<div ref={contentRef} className="whitespace-nowrap">
					{children}
				</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="w-full overflow-hidden">
			<Marquee>{children}</Marquee>
		</div>
	);
}
