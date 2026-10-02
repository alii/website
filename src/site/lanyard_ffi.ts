import {get as fetchPresence, type Types} from 'use-lanyard';

export const get = (id: Types.Snowflake) => fetchPresence(id);
export const location = (presence: Types.Presence) => presence.kv.location;
