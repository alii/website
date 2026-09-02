import {Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';
import type {List} from '@gleam/prelude.mjs';
import {get as fetchPresence, useLanyard as useLanyardHook, type Types} from 'use-lanyard';
import {toOption} from '../js_ffi.ts';

type PresenceMap = Partial<Record<Types.Snowflake, Types.Presence>>;

export const get = (id: Types.Snowflake) => fetchPresence(id).catch(() => null);

export function useLanyard(
	ids: List<Types.Snowflake>,
	initial: List<[Types.Snowflake, Option$<Types.Presence>]>,
): PresenceMap | undefined {
	const initialData: PresenceMap = {};
	for (const [id, presence] of initial) {
		if (presence instanceof Some) initialData[id] = presence[0];
	}
	return useLanyardHook(ids.toArray(), {initialData});
}

export const presence = (map: PresenceMap | undefined, id: Types.Snowflake) => toOption(map?.[id]);

export const spotify = (presence: Types.Presence) => toOption(presence.spotify);
export const location = (presence: Types.Presence) => toOption(presence.kv.location);
export const trackId = (spotify: Types.Spotify) => spotify.track_id;
export const song = (spotify: Types.Spotify) => spotify.song;
export const artist = (spotify: Types.Spotify) => toOption(spotify.artist);
