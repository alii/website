import {env} from '@/server/env';

export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const defaultLocation = () => env.DEFAULT_LOCATION;
export const turnstileSecretKey = () => env.TURNSTILE_SECRET_KEY;
export const discordWebhook = () => env.DISCORD_WEBHOOK;
export const appleTeamId = () => env.APPLE_TEAM_ID;
export const appleKeyId = () => env.APPLE_KEY_ID;
export const applePrivateKey = () => env.APPLE_PRIV_KEY;
export const discordDemoClientId = () => env.DISCORD_DEMO_DISCORD_CLIENT_ID;
export const discordDemoClientSecret = () => env.DISCORD_DEMO_DISCORD_CLIENT_SECRET;
export const discordDemoRedirectUri = () => env.DISCORD_DEMO_REDIRECT_URI;
