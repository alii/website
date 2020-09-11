import styled from 'styled-components';
import theme from '../core/theme';

const Title = styled.h1`
  position: relative;
  overflow: hidden;
  display: inline-block;
  padding: 0;
  transition: all 1s;
  margin: 0;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;

    height: 2px;
    width: 70%;
    left: -100%;
    background: ${theme.ACCENT};
    transition: all 1s;
  }

  &::after {
    content: '';
    position: absolute;
    z-index: -1;
    left: 0;

    height: 50%;
    width: 2px;
    bottom: -50%;
    background: ${theme.ACCENT};
    transition: all 1s;
  }

  &:hover {
    padding-left: 10px;

    &::before {
      left: 0;
    }

    &::after {
      bottom: 0;
    }
  }
`;

export default Title;
