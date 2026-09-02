import {get as fetchPresence, useLanyard as useLanyardHook, type Types} from 'use-lanyard';

type PresenceMap = Partial<Record<Types.Snowflake, Types.Presence>>;

export const get = (id: Types.Snowflake) => fetchPresence(id);

export const useLanyard = (
	ids: Types.Snowflake[],
	initialData: PresenceMap,
): PresenceMap | undefined => useLanyardHook(ids, {initialData});

export const presence = (map: PresenceMap | undefined, id: Types.Snowflake) => map?.[id];
export const spotify = (presence: Types.Presence) => presence.spotify;
export const location = (presence: Types.Presence) => presence.kv.location;
export const trackId = (spotify: Types.Spotify) => spotify.track_id;
export const song = (spotify: Types.Spotify) => spotify.song;
export const artist = (spotify: Types.Spotify) => spotify.artist;
