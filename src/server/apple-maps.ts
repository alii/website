import jwa from 'jwa';
import {pathcat} from 'pathcat';
import {env} from './env';

const es256 = jwa('ES256');

export function getMapURL(center: string) {
	const completePath = pathcat('/api/v1/snapshot', {
		center,
		teamId: env.APPLE_TEAM_ID,
		keyId: env.APPLE_KEY_ID,
		z: '12',
		size: '340x200',
		scale: '2',
		t: 'satellite',
		poi: '0',
		lang: 'en-GB',

		// disbale all text on the map:
		hideLabels: '1',
	});

	const signature = es256.sign(completePath, env.APPLE_PRIV_KEY);

	return `https://snapshot.apple-mapkit.com${completePath}&signature=${signature}`;
}
