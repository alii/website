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
  margin-top: 15px;
`;
