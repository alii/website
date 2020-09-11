import React from 'react';
import styled from 'styled-components';

import discord from './assets/discord.png';
import email from './assets/email.png';
import { Store } from './core/store';

import { Hero } from './components/Hero';

const GetInTouchOuter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;

  transition: all 1s;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);

  h1 {
    z-index: 10;
  }
`;

const ContactsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 10;

  padding: 20px;
  background: black;
  border-radius: 5px;
  border: 1px solid #323232;
  margin-top: 20px;

  p {
    display: flex;

    align-items: center;

    height: 20px;

    img {
      height: auto;
      max-width: 20px;
      margin-right: 5px;
    }
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const App = () => {
  const store = Store.useStore();
  const showGetInTouch = store.get('showGetInTouch');

  return (
    <MainContainer>
      <Hero />
      <GetInTouchOuter
        style={{
          opacity: !showGetInTouch ? '0' : '1',
          clipPath: showGetInTouch ? 'circle(100% at 50% 50%)' : 'circle(0% at 50% 50%)',
        }}
      >
        <h1>Get in touch</h1>
        <ContactsWrapper>
          <p>
            <img src={email} alt="Email" /> alistairsmith01@gmail.com
          </p>
          <p>
            <img src={discord} alt="Discord" /> alistair#9999
          </p>
          <button
            style={{
              cursor: 'pointer',
              background: 'transparent',
              padding: '10px 20px',
              borderRadius: '5px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginTop: '10px',
              color: 'white',
              outlineColor: 'white',
            }}
            onClick={() => store.set('showGetInTouch')(false)}
          >
            Close
          </button>
        </ContactsWrapper>
      </GetInTouchOuter>
    </MainContainer>
  );
};

export default App;
