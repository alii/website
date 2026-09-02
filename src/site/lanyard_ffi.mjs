import { get as fetchPresence, useLanyard as useLanyardHook } from "use-lanyard";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";

export const get = (id) => fetchPresence(id).catch(() => null);

export function useLanyard(ids, initial) {
  const initialData = {};
  for (const [id, presence] of initial) {
    initialData[id] = presence instanceof Some ? presence[0] : undefined;
  }
  return useLanyardHook(ids.toArray(), { initialData });
}

export const presence = (map, id) => (map?.[id] ? new Some(map[id]) : new None());
