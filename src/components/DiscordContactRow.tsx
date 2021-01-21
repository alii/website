import React, {useState} from 'react';
import {Consts} from '../core/consts';
import {ContactRow} from './ContactRow';
import {Discord} from '../assets/icons';

export const DiscordContactRow = () => {
  const [message, setMessage] = useState(Consts.DiscordUsername);

  const copy = async () => {
    await navigator.clipboard.writeText(Consts.DiscordUsername);
    setMessage('Copied ✔');
    await new Promise((r) => setTimeout(r, 1500));
    setMessage(Consts.DiscordUsername);
  };

  return (
    <ContactRow href={'#'} onClick={copy}>
      <Discord /> {message}
    </ContactRow>
  );
};
