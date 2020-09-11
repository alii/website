import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Song } from './components/Song';
import { HugeTitle } from './components/HugeTitle';
import { TSong, useLastFM, TSongObject } from 'use-last-fm';
import { config } from './util/app-config';

const useIsPlaying = (song: TSong): song is TSongObject => {
  switch (song) {
    case 'connecting':
    case 'idle':
      return false;
    default:
      return true;
  }
};

export const App = () => {
  const song = useLastFM(config.username, config.token);
  const isPlaying = useIsPlaying(song);

  useEffect(() => {
    // @ts-ignore
    if (song.art) {
      // @ts-ignore
      document.body.style.backgroundImage = `url(${song.art})`;
    }
  }, [song]);

  return (
    // @ts-ignore
    <Styled.Container art={isPlaying ? song.art : ''}>
      <Song song={song} />
      <HugeTitle>Alistair Smith.</HugeTitle>
      <p>
        Full-Stack TypeScript engineer from the UK{' '}
        <span role="img" aria-label="GB Flag">
          🇬🇧
        </span>
      </p>
    </Styled.Container>
  );
};

const Styled = {
  Container: styled.div<{ art?: string }>`
    padding: 20px;
    border-radius: 30px;
    backdrop-filter: blur(5px);
    background: rgba(0, 0, 0, 0.8);

    display: inline-flex;
    justify-content: center;
    align-items: center;

    max-width: 30%;
    flex-direction: column;
    overflow: hidden;

    @media only screen and (max-width: ${config.standard_breakpoint}) {
      max-width: 80%;
    }
  `,
  Row: styled.div`
    display: flex;
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
  `,
};
