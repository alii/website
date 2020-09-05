import React from 'react';

const token = 'b6ad96319cd457234c3fc87a03bb0989';
const endpoint = `//ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=aabbccsmith&api_key=${token}&format=json&limit=1`;

export type TSong =
  | {
      name: string;
      artist: string;
    }
  | 'connecting'
  | 'idle';

export const updateBackground = (setSong: React.Dispatch<React.SetStateAction<TSong>>) => async () => {
  const request = await fetch(endpoint);
  const body = (await request.json()) as Body;

  const track = body.recenttracks.track[0];

  if (track['@attr']?.nowplaying) {
    const art = body.recenttracks.track[0].image.find((image) => image.size === 'extralarge')?.['#text'];
    document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), url(${art}) no-repeat center center`;

    setSong({
      name: track.name,
      artist: track.artist['#text'],
    });
  } else {
    setSong('idle');
  }
};

export interface Body {
  recenttracks: Recenttracks;
}

export interface Recenttracks {
  '@attr': Attr;
  track: Track[];
}

export interface Attr {
  page: string;
  total: string;
  user: string;
  perPage: string;
  totalPages: string;
}

export interface Track {
  artist: Artist;
  '@attr'?: Attr2;
  mbid: string;
  album: Album;
  streamable: string;
  url: string;
  name: string;
  image: Image[];
  date?: Date;
}

export interface Artist {
  mbid: string;
  '#text': string;
}

export interface Attr2 {
  nowplaying: string;
}

export interface Album {
  mbid: string;
  '#text': string;
}

export interface Image {
  size: string;
  '#text': string;
}

export interface Date {
  uts: string;
  '#text': string;
}
