import Link from 'next/link';
import manifest from '../../public/88x31/manifest.json';
import {b88, btnWall} from '../ui';

// Real 88x31 web buttons — animated dithered GIFs generated at build time by
// scripts/generate-88x31.mjs (run `bun run gen:buttons` to regenerate). This
// just lays them out in the classic button wall.

interface Button {
	id: string;
	file: string;
	alt: string;
	href: string | null;
}

const buttons = manifest as Button[];

export function ButtonWall() {
	return (
		<div className={btnWall}>
			{buttons.map(button => {
				const img = (
					<img
						className={b88}
						src={button.file}
						alt={button.alt}
						title={button.alt}
						width={88}
						height={31}
					/>
				);

				if (!button.href) {
					return (
						<span key={button.id} className="inline-block leading-none">
							{img}
						</span>
					);
				}

				const internal = button.href.startsWith('/');

				return (
					<Link
						key={button.id}
						href={button.href}
						className="inline-block leading-none"
						target={internal ? undefined : '_blank'}
						rel={internal ? undefined : 'noreferrer'}
					>
						{img}
					</Link>
				);
			})}
		</div>
	);
}
