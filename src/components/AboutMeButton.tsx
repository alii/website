import React from 'react';
import styled from 'styled-components';

export const AboutMeButton = ({setOpen}: {setOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
  return <GhostButton onClick={() => setOpen(true)}>About me</GhostButton>;
};

export const GhostButton = styled.button`
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  border: none;
  cursor: pointer;
  outline-color: lightpink;
  color: white;
`;
