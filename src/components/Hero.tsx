import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

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

  if (data.loading) return <p>_____________</p>;

  if (data.data.track[0]['@attr']?.nowplaying) {
    const art = data.data.track[0].image.find((image: { size: string; '#text': string }) => image.size === 'extralarge')['#text'];
    props.setBackground(art);

    return (
      <p>
        Listening to <b>{data.data.track[0].name}</b> by <b>{data.data.track[0].artist['#text']}</b> on <b>Spotify</b>
      </p>
    );
  }

  return <p>Good {getTime()}</p>;
});

const getScale = (height: number): number => -(height / 1000) + 1;
const getMaximum = (a: number, b: number) => (a > b ? b : a);

const StyledIntro = styled.div<{ position: number; background: string }>`
  min-height: 100%;
  box-sizing: border-box;
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${(props) => props.background}) no-repeat center center;
  top: 0;
  position: sticky;
  transition: all 1s;

  background-size: cover;
  overflow: hidden;

  .top,
  .bottom {
    display: flex;

    .fill {
      flex: 1;
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
        -webkit-text-stroke: 2px white;
        text-stroke: 2px white;
      }
    }
  }
`;

const Hero = () => {
  const [height, setHeight] = useState(window.scrollY);
  const [background, setBackground] = useState<string>(
    `//source.unsplash.com/ciO5L8pin8A/${window.innerWidth}x${window.innerHeight}`,
  );

  useEffect(() => {
    const listener = () => {
      setHeight(window.scrollY);
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  });

  return (
    <StyledIntro
      background={background}
      position={height}
      style={{
        transform: `scale(${getScale(height)})`,
        borderRadius: height > 5 ? '20px' : '0',
        padding: getMaximum(height * 2 + 30, window.innerWidth > 800 ? 150 : 30) + 'px',
      }}
    >
      <div className="top">
        <div className="fill">
          <Button
            onClick={() => {
              window.scrollBy({
                top: document.body.scrollHeight,
                behavior: 'smooth',
              });
            }}
          >
            Get in touch
          </Button>
        </div>
        <p>TypeScript + React + Node.js</p>
      </div>
      <div className="center">
        <h1>Alistair Smith</h1>
        <h3>Full-stack TypeScript engineer from the UK 🇬🇧</h3>
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
