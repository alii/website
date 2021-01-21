import styled from 'styled-components';
import {useAtom} from 'jotai';
import {background} from '../core/atoms';
import React, {ReactNode} from 'react';

export const Container = ({children}: {children: ReactNode}) => {
  const [url] = useAtom(background);

  return (
    <StyledContainer background={url}>
      <div>{children}</div>
    </StyledContainer>
  );
};

export const Content = styled.div`
  display: flex;

  div:first-child {
    flex: 1;
  }
`;

const StyledContainer = styled.div<{background: string}>`
  height: 100%;
  width: 100%;

  background: black;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${(props) => props.background}) no-repeat center center;
  background-size: cover;
  transition: all 1s;
  display: flex;

  > div {
    flex: 1;
    backdrop-filter: blur(4px);
    padding: 30px;
    display: flex;
    flex-direction: column;
  }
`;
