import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Store from '../core/store';
import { useWindowSize } from '../core/hooks';

const getTime = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 16) return 'afternoon';
  if (hour >= 17) return 'evening';
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
  setBackground: (url: string) => void;
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
  const [data, setData] = useState<{ loading: boolean; data: any }>({ loading: true, data: {} });

  useEffect(() => {
    const request = () => {
      return fetch(
        '//ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=aabbccsmith&api_key=b6ad96319cd457234c3fc87a03bb0989&format=json&limit=1',
      )
        .then((res) => res.json())
        .then((data) => ({ loading: false, data: data.recenttracks }));
    };

    const load = () => request().then(setData);

    load();
    const interval = setInterval(load, 1000 * 30);

    return () => clearInterval(interval);
  }, []);

  if (data.loading) return <Song>Connecting</Song>;

  if (data.data.track[0]['@attr']?.nowplaying) {
    const art = data.data.track[0].image.find((image: { size: string; '#text': string }) => image.size === 'extralarge')['#text'];
    props.setBackground(art);

    return (
      <Song>
        Listening to <b>{data.data.track[0].name}</b> by <b>{data.data.track[0].artist['#text']}</b> on <b>Spotify</b>
      </Song>
    );
  }

  return <p>Good {getTime()}</p>;
});

const StyledIntro = styled.div<{ background: string; height: number }>`
  box-sizing: border-box;
  padding: 30px;
  display: flex;
  flex-direction: column;
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

  .top,
  .bottom {
    display: flex;

    .fill {
      padding-right: 40px;
      flex: 1;
    }

    > :not(.fill) {
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

const Hero = () => {
  const [, height] = useWindowSize();

  const store = Store.useStore();
  const [background, setBackground] = useState<string>(
    `//source.unsplash.com/ciO5L8pin8A/${window.innerWidth}x${window.innerHeight}`,
  );

  const showGetInTouch = store.get('showGetInTouch');

  return (
    <StyledIntro
      height={height}
      background={background}
      style={{
        transform: `scaleY(${showGetInTouch ? '0' : '1'}) scaleX(${showGetInTouch ? '0.5' : '1'})`,
        borderRadius: showGetInTouch ? '20px' : '0',
        padding: window.innerWidth > 800 ? 30 : 20 + 'px',
        opacity: showGetInTouch ? '0' : '1',
        clipPath: !showGetInTouch
          ? 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
          : 'polygon(30% 100%, 70% 100%, 100% 100%, 0% 100%)',
      }}
    >
      <div className="top">
        <div className="fill">
          <Button
            onClick={() => {
              store.set('showGetInTouch')(true);
            }}
          >
            Get in touch
          </Button>
        </div>
        <p>TypeScript + React + Node.js</p>
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
        <div className="fill">
          Currently working at <a href={'https://edge.gg'}>Edge</a>
        </div>
        <Greeting setBackground={setBackground} />
      </div>
    </StyledIntro>
  );
};

export default Hero;
