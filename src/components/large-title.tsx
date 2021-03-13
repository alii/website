import {ReactNode} from 'react';

export function LargeTitle({children}: {children: ReactNode}) {
  return <h1 className="title text-6xl font-bold">{children}</h1>;
}
