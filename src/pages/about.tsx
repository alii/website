import {toWords} from 'number-to-words';
import React, {useState} from 'react';
import {Consts} from '../core/consts';
import day from 'dayjs';
import Link from 'next/link';
import {Layout} from '../layouts/Layout';
import {Activity} from '../components/activity';
import {SiDiscord, SiGithub, SiInstagram, SiMonzo, SiTwitch, SiTwitter, SiGmail} from 'react-icons/si';
import {Tooltip} from 'react-tippy';

const birthday = day('2 November 2004').toDate();
const age = Math.abs(new Date(Date.now() - birthday.getTime()).getUTCFullYear() - 1970);

export default function About() {
  return (
    <Layout>
      <div className="flex-1 flex justify-center items-center">
        <div className="glass h-page overflow-x-hidden overflow-y-auto p-5 w-full md:w-96 space-y-2">
          <Link href="/">
            <a className="text-gray-400 hover:text-gray-200">Back</a>
          </Link>
          <div className="flex items-center space-x-3">
            <Tooltip title="A selfie, unfortunately">
              <img src="/me.png" alt="Me" className="h-8 rounded-full" />
            </Tooltip>
            <h1 className="text-3xl font-bold title">Alistair Smith</h1>
          </div>
          <p className="text-gray-400">
            Yo! I'm a {toWords(age)} year old full-stack TypeScript engineer from the United Kingdom. I care about performant,
            accessible code. I'm a huge fan of open source &amp; you can{' '}
            <a href="https://github.com/sponsors/alii">sponsor me on GitHub</a>. Programming since seven, I've learned a lot about
            programming principles, scaling, and systems architecture. I always love to joke around and I take my{' '}
            <a href="https://twitter.com/aabbccsmith">Twitter</a> presence <i>very seriously</i>... At the moment, I'm picking up
            Java with some friends, and really loving it. Watch this space?
          </p>
          <div className="flex items-center">
            <div className="grid grid-cols-2">
              <DiscordContactRow />
              <a href="mailto:inbox@alistair.cloud" className="flex items-center space-x-3">
                <span>
                  <SiGmail />
                </span>{' '}
                <span>inbox@alistair.cloud</span>
              </a>
              <a href="https://github.com/alii" className="flex items-center space-x-3">
                <SiGithub /> <span>alii</span>
              </a>
              <a href="https://monzo.me/as" className="flex items-center space-x-3">
                <SiMonzo /> <span>as</span>
              </a>
              <a href="https://instagr.am/alistaor" className="flex items-center space-x-3">
                <SiInstagram /> <span>alistaor</span>
              </a>
              <a href="https://twitter.com/aabbccsmith" className="flex items-center space-x-3">
                <SiTwitter /> <span>aabbccsmith</span>
              </a>
              <a href="https://twitch.tv/aabbccsmith" className="flex items-center space-x-3">
                <SiTwitch /> <span>aabbccsmith</span>
              </a>
            </div>
          </div>
          <Activity />
        </div>
      </div>
    </Layout>
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
    <a href="#" onClick={copy} className="flex items-center space-x-3">
      <SiDiscord /> <span>{message}</span>
    </a>
  );
};
