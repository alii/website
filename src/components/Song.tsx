import React from 'react';
import styled, { keyframes } from 'styled-components';
import { TSong } from 'use-last-fm';

export const Song = ({song}: {song: TSong}) => {
  if (song !== 'connecting' && song !== 'idle') {
    return (
      <Styled.Song>
        Listening to <b>{song.name}</b> by <b>{song.artist}</b> on <b>Spotify</b>
      </Styled.Song>
    );
  }

  if (song === 'idle') {
    return <p>alistair#9999</p>;
  }

  // Connecting
  return <Styled.Song>Connecting</Styled.Song>;
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

export const Styled = {
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
