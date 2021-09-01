import React from 'react';
import Image from 'next/image';

export default function Index() {
	return (
		<div className="p-5 flex space-x-4">
			<div>
				<Image src="/me.png" alt="Selfie" width="50px" height="50px" className="object-cover rounded-full" />
			</div>
			<div className="bg-gray-900 flex-1 p-5">
				<div className="flex">
					<div className="flex-1">
						<h1 className="text-3xl font-semibold">alistair smith</h1>
						<p>typescript, java, go, c++</p>
					</div>
					<div className="float-right">listening to spotify</div>
				</div>
			</div>
		</div>
	);
}
