import React, { useEffect } from 'react';
import { useLastFM } from 'use-last-fm';
import { Consts } from '../core/consts';
import styled from 'styled-components';
import { useAtom } from 'jotai';
import { background } from '../core/atoms';
import { animations } from '../assets/animations';

export const Song = () => {
  const song = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);
  const [, setBackground] = useAtom(background);

  useEffect(() => {
    if (typeof song === 'object') {
      setBackground(song.art);
    }
  }, [song, setBackground]);

  if (song === 'connecting' || song === 'idle') {
    return <Styled>Not listening to anything</Styled>;
  }

  return (
    <Styled>
      Listening to <span>{song.name}</span> by <span>{song.artist}</span> on <span>Spotify</span>
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
