import styled from 'styled-components';

export const HugeTitle = styled.h1`
  padding: 20px;
  -webkit-text-fill-color: black;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;
  font-size: 10vw;

  @supports (-webkit-text-stroke: 1px black) {
    -webkit-text-stroke: 1px white;
    -webkit-text-fill-color: transparent;
  }
`;
