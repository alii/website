import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { TSong, updateBackground } from './util/update-background';

const defaultBackground: string = '#121212';

export const App = () => {
  const [song, setSong] = useState<TSong>('connecting');

  useEffect(() => {
    const interval = setInterval(updateBackground(setSong), 15 * 1000);
    updateBackground(setSong)();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (song === 'connecting' || song === 'idle') {
      document.body.style.background = defaultBackground;
    }
  }, [song]);

  if (song !== 'connecting' && song !== 'idle') {
    return (
      <Styled.Container>
        <Styled.Song>
          Listening to <b>{song.name}</b> by <b>{song.artist}</b> on <b>Spotify</b>
        </Styled.Song>
      </Styled.Container>
    );
  }

  if (song === 'idle') {
    return (
      <Styled.Container>
        <p>alistair#9999</p>
      </Styled.Container>
    );
  }

  if (song === 'connecting') {
    return (
      <Styled.Container>
        <Styled.Song>Connecting</Styled.Song>
      </Styled.Container>
    );
  }

  return null;
};

const Animations = {
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

const Styled = {
  Container: styled.div`
    padding: 10px;
    backdrop-filter: blur(5px);
    background: rgba(0, 0, 0, 0.8);
    height: var(--app-height);
  `,
  Song: styled.p`
    &::after {
      content: '';
      height: 10px;
      margin-left: 5px;
      width: 10px;
      background: #1db954;
      display: inline-block;
      border-radius: 50%;
      animation: ${Animations.Pulse} 2s infinite linear;
    }
  `,
};
