import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Store } from '../core/store';
import { useWindowSize } from '../core/hooks';
import { useLastFM } from 'use-last-fm';

const INITIAL_BACKGROUND = `//source.unsplash.com/ciO5L8pin8A/${window.innerWidth}x${window.innerHeight}`;

const getTime = () => {
  const hour = new Date().getHours();
  if (hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 16) return 'afternoon';
  if (hour >= 18) return 'evening';
};

const Button = styled.button`
  background: transparent;
  font-size: inherit;
  font-family: 'Inter', sans-serif;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  color: white;
  outline-color: wheat;
`;

type GreetingProps = {
  setBackground: (url: string | null) => void;
};

const pulse = keyframes`
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
`;

const Song = styled.p`
  &::after {
    content: '';
    height: 10px;
    margin-left: 5px;
    width: 10px;
    background: #1db954;
    display: inline-block;
    border-radius: 50%;
    animation: ${pulse} 2s infinite linear;
  }
`;

const Greeting = React.memo((props: GreetingProps) => {
  const song = useLastFM('aabbccsmith', 'b6ad96319cd457234c3fc87a03bb0989');

  if (song === 'connecting') {
    return <Song>Connecting</Song>;
  }

  if (typeof song === 'object' && song.art !== 'n/a') {
    props.setBackground(song.art);

    return (
      <Song>
        Listening to <b>{song.name}</b> by <b>{song.artist}</b> on <b>Spotify</b>
      </Song>
    );
  }

  if (song === 'idle') {
    props.setBackground(null);
  }

  return <p>Good {getTime()}</p>;
});

const StyledIntro = styled.div<{ background: string; height: number }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: black;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${(props) => props.background}) no-repeat center center;
  top: 0;
  position: sticky;
  width: 100%;
  transition: all 1s;
  z-index: 10;
  opacity: 1;

  height: ${(props) => props.height}px;

  background-size: cover;
  overflow: hidden;

  > div {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(4px);
  }

  .hero-container {
    padding: 30px;
  }

  .top,
  .bottom {
    display: flex;

    .fill {
      flex: 1;
      text-align: right;
    }
  }

  .center {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;

    h1 {
      font-size: 450%;
      letter-spacing: 3px;
      color: black;
      text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;

      @supports (-webkit-text-stroke: 1px white) {
        color: transparent;
        text-shadow: none;
        text-stroke: 2px white;
        -webkit-text-stroke: 2px white;
      }
    }
  }
`;

export const Hero = () => {
  const [, height] = useWindowSize();

  const store = Store.useStore();

  const [background, setBackground] = useState<string>(INITIAL_BACKGROUND);

  const showGetInTouch = store.get('showGetInTouch');

  return (
    <StyledIntro
      height={height}
      background={background}
      style={{
        transform: `scale(${showGetInTouch ? '1.5' : '1'}) translateY(${showGetInTouch ? 100 : 0}px)`,
        borderRadius: showGetInTouch ? '20px' : '0',
        clipPath: !showGetInTouch
          ? 'polygon(20% 0, 80% 0%, 100% 0, 100% 100%, 80% 100%, 20% 100%, 0 100%, 0 0)'
          : 'polygon(20% 0%, 80% 0%, 100% 0, 100% 100%, 80% 100%, 20% 100%, 100% 100%, 100% 0)',
      }}
    >
      <div className={'hero-container'}>
        <div className="top">
          <Button
            onClick={() => {
              store.set('showGetInTouch')(true);
            }}
          >
            Get in touch
          </Button>
          <div className="fill">
            <p>TypeScript + React + Node.js</p>
          </div>
        </div>
        <div className="center">
          <h1>Alistair Smith</h1>
          <h3>
            Full-stack TypeScript engineer from the UK{' '}
            <span role="img" aria-label="GB Flag">
              🇬🇧
            </span>
          </h3>
        </div>
        <div className="bottom">
          Currently working at <a href={'https://edge.gg'}>Edge</a>
          <div className="fill">
            <Greeting
              setBackground={(newBackground) => {
                if (!newBackground) {
                  setBackground(INITIAL_BACKGROUND);
                  return;
                }

                setBackground(newBackground);
              }}
            />
          </div>
        </div>
      </div>
    </StyledIntro>
  );
};
