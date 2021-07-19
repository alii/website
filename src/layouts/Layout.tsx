import React, {ReactNode} from 'react';

export const Layout = (props: {children: ReactNode; extraClassNames?: string}) => (
	<div className={`flex rounded-xl h-full flex-col p-2 sm:p-6 md:p-14 ${props.extraClassNames ?? ''}`}>{props.children}</div>
);
