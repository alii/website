import { useAtom } from 'jotai';
import { modalOpen } from '../core/atoms';
import React from 'react';
import styled from 'styled-components';

export const GetInTouchButton = () => {
  const [, setOpen] = useAtom(modalOpen);
  return <StyledGetInTouchButton onClick={() => setOpen(true)}>Get in touch</StyledGetInTouchButton>;
};

export const StyledGetInTouchButton = styled.button`
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  border: none;
  cursor: pointer;
  outline-color: lightpink;
  color: white;
`;
