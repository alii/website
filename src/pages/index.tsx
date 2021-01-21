import React, {useState} from 'react';
import {Song} from '../components/Song';
import {Container, Content} from '../components/Container';
import {ContainerRow} from '../components/ContainerRow';
import {LargeTitle, LargeTitleSubtitle} from '../components/LargeTitle';
import {AboutMeButton} from '../components/AboutMeButton';
import {GetServerSideProps} from 'next';
import {Email, Github} from '../assets/icons';
import {toWords} from 'number-to-words';
import {ContactContainer, ContactRow} from '../components/ContactRow';
import {DiscordContactRow} from '../components/DiscordContactRow';
import {BottomModal} from 'react-spring-modal';
import day from 'dayjs';
import styled from 'styled-components';

const birthday = day('2 November 2004').toDate();
const age = Math.abs(new Date(Date.now() - birthday.getTime()).getUTCFullYear() - 1970);

type IndexProps = {isWin: boolean};

export default function Index({isWin}: IndexProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Container>
        <ContainerRow>
          <Content>
            <div>
              <p>
                <AboutMeButton setOpen={setOpen} />
              </p>
            </div>
            <div>
              <p>TypeScript + React + Node.js</p>
            </div>
          </Content>
        </ContainerRow>
        <ContainerRow large>
          <LargeTitle>Alistair Smith</LargeTitle>
          <LargeTitleSubtitle>
            Full-stack TypeScript engineer from the UK{' '}
            {!isWin && (
              <span role="img" aria-label="GB Flag">
                🇬🇧
              </span>
            )}
          </LargeTitleSubtitle>
        </ContainerRow>
        <ContainerRow>
          <Content>
            <div>
              <p>
                Currently working at <a href="https://edge.gg">Edge</a>
              </p>
            </div>
            <div>
              <Song />
            </div>
          </Content>
        </ContainerRow>
      </Container>

      <BottomModal isOpen={open} onRequestClose={() => setOpen(false)}>
        <ModalTitle>Alistair Smith</ModalTitle>
        <ModalParagraph>
          Hey, I'm a {toWords(age)} year old full-stack TypeScript engineer from the United Kingdom. I have a huge passion for
          creating and supporting open-source software, desktop & mobile applications, and responsive, performant code.
          Programming since seven, I've learned a lot about programming principles, scaling, and systems architecture. I consider
          myself forward-thinking and I always love to have a joke around.
        </ModalParagraph>
        <ContactContainer>
          <img src={'/me.png'} alt="Me" />
          <div>
            <DiscordContactRow />
            <ContactRow href={'mailto:inbox@alistair.cloud'}>
              <Email /> inbox@alistair.cloud
            </ContactRow>
            <ContactRow href={'https://github.com/alii'}>
              <Github /> alii
            </ContactRow>
          </div>
        </ContactContainer>
      </BottomModal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<IndexProps> = (ctx) => {
  return Promise.resolve({
    props: {isWin: /Win/i.test(ctx.req.headers['user-agent'] || '')},
  });
};

const ModalTitle = styled.h1`
  line-height: 18px;
`;

const ModalParagraph = styled.p`
  margin: 15px 0;
`;
