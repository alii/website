import React from 'react';
import { Song } from './components/Song';
import { Container } from './components/Container';
import { ContainerRow } from './components/ContainerRow';
import { LargeTitle } from './components/LargeTitle';
import { ContainerContent } from './components/ContainerContent';
import { ModalContent } from './content/ModalContent';
import { AboutMeButton } from './components/AboutMeButton';

const isWin = /Win/i.test(navigator.userAgent);

export const App = () => {
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
          <h3>
            Full-stack TypeScript engineer from the UK{' '}
            {!isWin && (
              <span role="img" aria-label="GB Flag">
                🇬🇧
              </span>
            )}
          </h3>
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
};
