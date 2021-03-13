import {useLastFM} from 'use-last-fm';
import {Consts} from '../core/consts';
import Link from 'next/link';
import {FC} from 'react';

export const Song = () => {
  const lastFM = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);

  if (lastFM.status !== 'playing') {
    return (
      <p>
        <Link href="/blog">Read my blog</Link>
      </p>
    );
  }

  return (
    <p>
      <a href={lastFM.song.url} className="hover:underline">
        Listening to <Segment>{lastFM.song.name}</Segment> by <Segment>{lastFM.song.artist}</Segment> on{' '}
        <Segment>Spotify</Segment>
        <Pulse />
      </a>
    </p>
  );
};

const Segment: FC = (props) => <span className="font-bold">{props.children}</span>;
const Pulse = () => <span className="bg-green-500 h-2 w-2 animate-pulse ml-2 rounded-full inline-block" />;
