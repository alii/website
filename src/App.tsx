import React from 'react';
import styled from 'styled-components';
import Hero from './components/Hero';

import discord from './assets/discord.png';
import email from './assets/email.png';

const GetInTouchOuter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
  padding-top: 10px;

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

const App = () => (
  <>
    <Hero />
    <div>
      <GetInTouchOuter>
        <h1>Get in touch</h1>
        <ContactsWrapper>
          <h4
            style={{ cursor: 'pointer' }}
            onClick={() => window.scrollBy({ top: -document.body.scrollHeight, behavior: 'smooth' })}
          >
            Close
          </h4>
          <p>
            <img src={email} alt="Email" /> alistairsmith01@gmail.com
          </p>
          <p>
            <img src={discord} alt="Discord" /> aabbccsmith#9999
          </p>
        </ContactsWrapper>
      </GetInTouchOuter>
    </div>
  </>
);

export default App;
