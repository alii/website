import styled from 'styled-components';

export const Modal = styled.div`
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);

  background: black;
  border-radius: 20px;
  padding: 35px 25px;
  max-width: 350px;

  transition: all 1s;

  z-index: 10;
  color: rgba(255, 255, 255, 0.75);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

  p {
    line-height: 23px;
    margin-top: 20px;
  }

  &.open {
    top: 50%;
  }
`;

export const ModalTitle = styled.h2`
  min-width: 150px;
  color: white;
`;
