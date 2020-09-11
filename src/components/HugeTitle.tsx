import styled from 'styled-components';
import { config } from '../util/app-config';

export const HugeTitle = styled.h1`
  padding: 20px;
  -webkit-text-fill-color: black;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;
  font-size: 11vw;
  word-spacing: 100px;
  text-shadow: 5px 10px 0 rgba(0, 0, 0, 0.1);

  @supports (-webkit-text-stroke: 1px black) {
    -webkit-text-stroke: 1px white;
    -webkit-text-fill-color: transparent;
  }

  @media only screen and (max-width: ${config.standard_breakpoint}) {
    font-size: 20vw;
  }
`;
