import {None, Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';
import type {List} from '@gleam/prelude.mjs';
import {get as fetchPresence, useLanyard as useLanyardHook, type Types} from 'use-lanyard';

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

export const presence = (
	map: PresenceMap | undefined,
	id: Types.Snowflake,
): Option$<Types.Presence> => {
	const found = map?.[id];
	return found ? new Some(found) : new None();
};
