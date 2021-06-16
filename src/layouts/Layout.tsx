import React, {ReactNode} from 'react';

export const Layout = (props: {children: ReactNode}) => (
	<div className="flex rounded-xl h-full flex-col p-2 sm:p-6 md:p-14 bg-gray-900 bg-opacity-5 border border-gray-800 border-opacity-10">
		{props.children}
	</div>
);
