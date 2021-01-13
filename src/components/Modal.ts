import styled from 'styled-components';

export const Modal = styled.div`
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);

  max-height: 90vh;
  overflow-y: auto;

  background: black;

  background: rgba(15, 17, 21, 0.35);
  padding: 35px;
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  transition: all 1s;

  @media only screen and (min-width: 830px) {
    max-width: 350px;
  }

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
  width: 350px;
  color: white;
  display: flex;
  align-items: center;

  span {
    flex: 1;
  }

  @media only screen and (max-width: 830px) {
    width: 80vw;
  }
`;

export const ModalProfile = styled.img`
  height: 120px;
  width: 120px;
  object-fit: cover;
  border-radius: 10px;
  margin-right: 15px;
`;
