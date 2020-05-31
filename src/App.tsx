import React from 'react';
import styled from 'styled-components';
import Hero from './components/Hero';

import discord from './assets/discord.png';
import email from './assets/email.png';
import Store from './core/store';

const GetInTouchOuter = styled.div`
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  flex-direction: column;
  align-items: center;
  padding: 50px;

  transform: translateX(-50%) translateY(-50%);

  h1 {
    z-index: 10;
  }
`;

const ContactsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 10;
  transition: all 1s;

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
  min-height: 100vh;
`;

const App = () => {
  const store = Store.useStore();
  const showGetInTouch = store.get('showGetInTouch');

  return (
    <MainContainer>
      <Hero />
      <GetInTouchOuter>
        <h1>Get in touch</h1>
        <ContactsWrapper
          style={{
            transform: `scaleY(${!showGetInTouch ? '0' : '1'}) scaleX(${!showGetInTouch ? '0.2' : '1'})`,
            opacity: !showGetInTouch ? '0' : '1',
            clipPath: showGetInTouch
              ? 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
              : 'polygon(30% 100%, 70% 100%, 100% 100%, 0% 100%)',
          }}
        >
          <button
            style={{
              cursor: 'pointer',
              background: 'transparent',
              padding: '10px 20px',
              borderRadius: '5px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '10px',
              color: 'white',
              outlineColor: 'white',
            }}
            onClick={() => store.set('showGetInTouch')(false)}
          >
            Close
          </button>
          <p>
            <img src={email} alt="Email" /> alistairsmith01@gmail.com
          </p>
          <p>
            <img src={discord} alt="Discord" /> aabbccsmith#9999
          </p>
        </ContactsWrapper>
      </GetInTouchOuter>
    </MainContainer>
  );
};

export default App;
