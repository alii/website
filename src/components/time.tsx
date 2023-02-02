'use client';

import {useEffect, useState} from 'react';
import {UKTimeFormatter, daysUntilBirthday, timeInUK} from '../utils/constants';

export function Time() {
	const [time, setTime] = useState(() => timeInUK);

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(UKTimeFormatter.format(new Date()));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="col-span-2 grid grid-cols-1 gap-6 md:col-span-1">
			<div className="flex items-center justify-center rounded-2xl bg-sky-900 text-white dark:bg-sky-100 dark:text-sky-900">
				<div className="text-center">
					<h2 className="font-title text-2xl glow-sky-200 dark:glow-sky-500">{time}</h2>
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
