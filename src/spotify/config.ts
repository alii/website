import {pathcat} from 'pathcat';

export function getSpotifyRedirectURL() {
	return pathcat('https://accounts.spotify.com/authorize', {
		client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? '6f3940561cf34ffb83ae4ce64c429dcb',
		redirect_uri: window.location.href,
		response_type: 'token',
		scope: [
			'user-read-private',
			'streaming',
			'user-read-playback-state',
			'user-modify-playback-state',
			'user-read-currently-playing',
		].join(' '),
	});
}

export function parseAccessTokenFromURL(href: string): string | null {
	const hash = href.split('#')[1];
	if (!hash) return null;

	const querystring = hash.split('&').map(part => {
		const [key, value] = part.split('=');
		return {key, value};
	});

	return querystring.find(({key}) => key === 'access_token')?.value || null;
}
