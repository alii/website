import {keyframes} from 'styled-components';

export const animations = {
  Pulse: keyframes`
    0% {
      transform: scale(1);
      opacity: 1;
    }
    
    70% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    
    100% {
      transform: scale(1);
      opacity: 1;
    } 
  `,
};
