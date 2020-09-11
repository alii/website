import React from 'react';
import styled from 'styled-components';
import { Song } from './components/Song';
import { HugeTitle } from './components/HugeTitle';
import { TSong, useLastFM } from 'use-last-fm';
import { config } from './util/app-config';

export const App = () => {
  const song = useLastFM(config.username, config.token);

  return (
    // @ts-ignore
    <Styled.Container song={song}>
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
  Container: styled.div<{ song?: TSong }>`
    padding: 50px;
    border-radius: 20px;
    position: relative;
    background: rgba(33, 33, 33, 0.8);
    border: 2px solid rgba(44, 44, 44, 0.9);

    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);

    transition: all 1s;

    display: inline-flex;
    justify-content: center;
    align-items: center;

    max-width: 30vw;
    flex-direction: column;
    overflow: hidden;
    margin-left: 10%;

    @media only screen and (max-width: ${config.standard_breakpoint}) {
      max-width: 100%;
      height: var(--app-height);
      border-radius: 0;
      margin-left: 0;
    }

    &::before {
      filter: blur(10px);
      background: ${(props) => {
        if (props.song && props.song !== 'connecting' && props.song !== 'idle') {
          return `url(${props.song?.art}) no-repeat center center fixed`;
        }
        return `url("//source.unsplash.com/random") no-repeat center center fixed`;
      }};

      background-size: cover;
      width: 100%;
      height: 100%;
      content: '';
      position: fixed;
      left: 0;
      right: 0;
      z-index: -1;
    }
  `,
};
