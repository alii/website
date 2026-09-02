import type {APIUser} from 'discord-api-types/v10';
import {toOption} from '../js_ffi.ts';

export const id = (user: APIUser) => user.id;
export const username = (user: APIUser) => user.username;
export const discriminator = (user: APIUser) => user.discriminator;
export const avatar = (user: APIUser) => toOption(user.avatar);
export const defaultAvatarIndex = (id: string) => Number((BigInt(id) >> BigInt(22)) % BigInt(6));
