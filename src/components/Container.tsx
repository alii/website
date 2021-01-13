import styled from 'styled-components';
import { useAtom } from 'jotai';
import { background, modalOpen } from '../core/atoms';
import React, { ReactNode } from 'react';

export const Container = ({ children }: { children: ReactNode }) => {
  const [url] = useAtom(background);
  const [open] = useAtom(modalOpen);

  return (
    <StyledContainer background={url} blurred={open}>
      <div>{children}</div>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ background: string; blurred: boolean }>`
  height: 100%;
  width: 100%;

  background: black;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${(props) => props.background}) no-repeat center center;
  background-size: cover;
  transition: all 1s;
  display: flex;

  filter: brightness(${(props) => (props.blurred ? 0.2 : 1)}) invert(${(props) => (props.blurred ? 0.1 : 0)});

  > div {
    flex: 1;
    backdrop-filter: blur(4px);
    padding: 30px;
    display: flex;
    flex-direction: column;
  }
`;
