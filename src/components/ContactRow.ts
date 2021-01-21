import styled from 'styled-components';

export const ContactRow = styled.a`
  display: flex;
  margin-top: 3px;
  text-decoration: none;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }

  img,
  svg {
    height: 24px;
    width: 24px;
    margin-right: 5px;
  }
`;

export const ContactContainer = styled.div`
  display: flex;
  align-items: center;

  > img {
    max-height: 80px;
    border-radius: 10px;
  }

  div {
    flex: 1;

    img,
    svg,
    p {
      margin-left: 15px;
    }

    p {
      margin-top: 0;
    }
  }
`;
