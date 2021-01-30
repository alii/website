import React, {ReactNode} from 'react';

export const ContainerRow = ({children, large = false}: {children: ReactNode; large?: boolean}) => {
  if (large) {
    return <div className="flex flex-1 justify-center flex-col">{children}</div>;
  }

  return <div>{children}</div>;
};
