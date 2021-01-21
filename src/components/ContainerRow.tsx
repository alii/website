import React, {ReactNode} from 'react';
import styled from 'styled-components';

export const ContainerRow = ({children, large = false}: {children: ReactNode; large?: boolean}) => {
  if (large) {
    return <LargeRow>{children}</LargeRow>;
  }

  return <div>{children}</div>;
};

const LargeRow = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;
