import urlcat from 'urlcat';

// Method is the "RPC call" to request for, e.g. `user.gettoptracks`
export type LastFMParams = {method: string} & Record<string, string>;

export class LastFM {
	private readonly apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async getTopTracks(
		user: string,
		period:
			| 'overall'
			| '7day'
			| '1month'
			| '3month'
			| '6month'
			| '12month' = 'overall',
	): Promise<LastFMGetTrack[]> {
		return this.req<GetTopTracks>('get', {
			user,
			method: 'user.gettoptracks',
			period,
		}).then(res => res.toptracks.track);
	}

	protected async req<T>(method: string, params: LastFMParams) {
		const url = urlcat('https://ws.audioscrobbler.com/2.0/', {
			api_key: this.apiKey,
			format: 'json',
			...params,
		});

		const request = await fetch(url);
		const response = (await request.json()) as T;

		if (request.status >= 400) {
			throw new Error(`Last.fm API error failed with status ${request.status}`);
		}

		return response;
	}
}

export type LastFMGetTrack = {
	'streamable': {
		'fulltrack': string;
		'#text': string;
	};
	'mbid': string;
	'name': string;
	'image': Array<{
		'size': string;
		'#text': string;
	}>;
	'artist': {
		url: string;
		name: string;
		mbid: string;
	};
	'url': string;
	'duration': string;
	'@attr': {
		rank: string;
	};
	'playcount': string;
};

export type GetTopTracks = {
	toptracks: {
		'track': LastFMGetTrack[];
		'@attr': {
			user: string;
			totalPages: string;
			page: string;
			perPage: string;
			total: string;
		};
	};
};
