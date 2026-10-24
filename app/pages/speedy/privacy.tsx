import {Head} from '../../../src/components/head';
import {Layout} from '../../../src/components/layout';
import {pageTitle} from '../../../src/ui';

export default function SpeedyPrivacy() {
	return (
		<Layout>
			<Head>
				<title>Speedy Privacy Policy</title>
				<meta name="description" content="Privacy policy for Speedy, the GPS speedometer for iPhone." />
			</Head>

			<h1 className={`mb-4 ${pageTitle}`}>Speedy Privacy Policy</h1>

			<p className="mb-4">Speedy uses your device&apos;s location only to show your current speed on screen.</p>

			<ul className="mb-4 list-disc space-y-1 pl-5">
				<li>Your location never leaves your device. It is not stored, sent, or shared.</li>
				<li>
					The only thing Speedy saves is your top speed and your mph/km/h choice, kept on your device.
				</li>
				<li>Speedy has no accounts, analytics, ads, or tracking.</li>
			</ul>
		</Layout>
	);
}
