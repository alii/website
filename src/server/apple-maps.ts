import jwa from 'jwa';
import {env} from './env';

const es256 = jwa('ES256');

export function getMapURL(center: string) {
	const params = new URLSearchParams({
		center,
		teamId: env.APPLE_TEAM_ID,
		keyId: env.APPLE_KEY_ID,
		z: '13',
		colorScheme: 'dark',
		size: '340x200',
		scale: '2',
		t: 'mutedStandard',
		poi: '0',
	});

	const completePath = `/api/v1/snapshot?${params.toString()}`;

	const signature = es256.sign(completePath, env.APPLE_PRIV_KEY);

	return `https://snapshot.apple-mapkit.com${completePath}&signature=${signature}`;
}
