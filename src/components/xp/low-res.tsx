import type {PropsWithChildren} from 'react';

export function LowResEffect({
	children,
	scale = 0.25,
	imageSmoothingEnabled = false,
	className = '',
}: PropsWithChildren<{
	scale?: number;
	imageSmoothingEnabled?: boolean;
	className?: string;
}>) {
	const scaleStyle = {
		transform: `scale(${scale}) scale(${1 / scale})`,
		imageRendering: imageSmoothingEnabled ? 'auto' : 'pixelated',
	} as const;

	return (
		<div className={`overflow-hidden ${className}`}>
			<div className="transform-gpu" style={scaleStyle}>
				{children}
			</div>
		</div>
	);
}
