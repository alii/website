import type {APIUser} from 'discord-api-types/v10';

export const id = (user: APIUser) => user.id;
export const username = (user: APIUser) => user.username;
export const discriminator = (user: APIUser) => user.discriminator;
export const avatar = (user: APIUser) => user.avatar;
