'use client';

import {useEffect, useRef, useState} from 'react';
import {UKTimeFormatter, daysUntilBirthday, timeInUK} from '../utils/constants';

export function Time() {
	const [time, setTime] = useState(() => timeInUK);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		// Thx Ana
		// https://github.com/AnaArsonist/anahoward.me/blob/b41ec1a5112526c03f4e09bc4226506ce529523f/src/components/time-components/NightComponent.tsx#L35
		for (let i = 0; i < 100; i++) {
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
			ctx.fill();
		}
	}, [canvasRef]);

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(UKTimeFormatter.format(new Date()));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="col-span-2 grid grid-cols-1 gap-6 md:col-span-1">
			<div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-sky-900 text-white dark:bg-sky-100 dark:text-sky-900">
				<canvas ref={canvasRef} className="absolute inset-0" />

				<div className="text-center">
					<h2 className="font-title text-2xl glow-sky-200 dark:glow-sky-500" suppressHydrationWarning>
						{time}
					</h2>

					<p className="text-xs font-light glow-sky-200 dark:glow-sky-500">in the uk</p>
				</div>
			</div>

			<div className="flex items-center justify-center rounded-2xl border  border-indigo-400 bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-400">
				<div className="text-center">
					<p className="text-xs font-light">
						<span className="font-title text-xl">{daysUntilBirthday}</span> days
						<br />
						until birthday
					</p>
				</div>
			</div>
		</div>
	);
}
