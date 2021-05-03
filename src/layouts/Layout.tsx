import {ReactNode} from 'react';

export const Layout = (props: {children: ReactNode}) => {
  return (
    <div className="flex rounded-xl h-full flex-col p-6 md:p-14 bg-green-900 bg-opacity-5 border border-green-800 border-opacity-10">
      {props.children}
    </div>
  );
};
