import React, { useEffect } from 'react';
import { useLastFM } from 'use-last-fm';
import { Consts } from '../core/consts';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { background, initialBackground } from '../core/atoms';
import { animations } from '../assets/animations';

export const Song = () => {
  const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);
  const [, setBackground] = useAtom(background);

  useEffect(() => {
    if (lastFm.status === 'playing') {
      setBackground(lastFm.song.art);
    } else {
      setBackground(initialBackground);
    }
  }, [lastFm, setBackground]);

  if (lastFm.status !== 'playing') {
    return <p>Not listening to anything</p>;
  }

  return (
    <Styled>
      Listening to <span>{lastFm.song.name}</span> by <span>{lastFm.song.artist}</span> on <span>Spotify</span>
    </Styled>
  );
};

const Styled = styled.p`
  span {
    font-weight: bold;
  }

  &::after {
    content: '';
    height: 10px;
    margin-left: 5px;
    width: 10px;
    background: #1db954;
    display: inline-block;
    border-radius: 50%;
    animation: 2s linear 0s infinite normal none running ${animations.Pulse};
  }
`;
