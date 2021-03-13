import {toWords} from 'number-to-words';
import React, {useState} from 'react';
import {Consts} from '../core/consts';
import day from 'dayjs';
import {AnimatePresence, motion} from 'framer-motion';
import {animations} from '../core/animations';
import Link from 'next/link';
import {Email, GitHub, Discord} from '../components/icons';

const birthday = day('2 November 2004').toDate();
const age = Math.abs(new Date(Date.now() - birthday.getTime()).getUTCFullYear() - 1970);

export default function About() {
  return (
    <div className="glass h-20 w-20 overflow-hidden">
      <h1>Alistair Smith</h1>
      <p>
        Hey, I'm a {toWords(age)} year old full-stack TypeScript engineer from the United Kingdom. I have a huge passion for
        creating and supporting open-source software, desktop & mobile applications, and responsive, performant code. Programming
        since seven, I've learned a lot about programming principles, scaling, and systems architecture. I consider myself
        forward-thinking and I always love to have a joke around.
      </p>
      <div>
        <img src={'/me.png'} alt="Me" />
        <div>
          <DiscordContactRow />
          <a href={'mailto:inbox@alistair.cloud'}>
            <Email /> inbox@alistair.cloud
          </a>
          <a href={'https://github.com/alii'}>
            <GitHub /> alii
          </a>
        </div>
      </div>
      <AnimatePresence>
        <motion.div {...animations} transition={{delay: 0.2}}>
          <Link href="/" passHref>
            <a>Home</a>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export const DiscordContactRow = () => {
  const [message, setMessage] = useState(Consts.DiscordUsername);

  const copy = async () => {
    await navigator.clipboard.writeText(Consts.DiscordUsername);
    setMessage('Copied ✔');
    await new Promise((r) => setTimeout(r, 1500));
    setMessage(Consts.DiscordUsername);
  };

  return (
    <a href={'#'} onClick={copy}>
      <Discord /> {message}
    </a>
  );
};
