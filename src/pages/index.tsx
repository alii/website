import React from 'react';
import { Song } from '../components/Song';
import { Container } from '../components/Container';
import { ContainerRow } from '../components/ContainerRow';
import { LargeTitle, LargeTitleSubtitle } from '../components/LargeTitle';
import { ContainerContent } from '../components/ContainerContent';
import { ModalContent } from '../content/ModalContent';
import { AboutMeButton } from '../components/AboutMeButton';
import { GetServerSideProps } from 'next';

type IndexProps = { isWin: boolean };

export default function Index({ isWin }: IndexProps) {
  return (
    <>
      <ModalContent />
      <Container>
        <ContainerRow>
          <ContainerContent>
            <div>
              <p>
                <AboutMeButton />
              </p>
            </div>
            <div>
              <p>TypeScript + React + Node.js</p>
            </div>
          </ContainerContent>
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
          <ContainerContent>
            <div>
              <p>
                Currently working at <a href="https://edge.gg">Edge</a>
              </p>
            </div>
            <div>
              <Song />
            </div>
          </ContainerContent>
        </ContainerRow>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<IndexProps> = (ctx) => {
  return Promise.resolve({
    props: { isWin: /Win/i.test(ctx.req.headers['user-agent'] || '') },
  });
};
