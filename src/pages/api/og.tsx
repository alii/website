import {ImageResponse} from '@vercel/og';
import type {PageConfig} from 'next';
import type {NextRequest} from 'next/server';

export const config: PageConfig = {
	runtime: 'experimental-edge',
};

const font = fetch(
	new URL(
		'../../../public/fonts/general-sans/GeneralSans-Variable.ttf',
		import.meta.url,
	),
).then(async res => res.arrayBuffer());

export default async function handler(req: NextRequest) {
	const {searchParams} = new URL(req.url);

	const hasTitle = searchParams.has('lower');

	const title = hasTitle
		? searchParams.get('lower')?.slice(0, 100)
		: 'hamburger';

	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: 'black',
					color: 'white',
					fontSize: 32,
					fontWeight: 600,
					fontFamily: 'Inter, "Material Icons"',
				}}
			>
				<div style={{marginTop: 40}}>alistair smith</div>
				<div style={{marginTop: 40}}>{title}</div>
			</div>
		),
		{
			fonts: [
				{
					name: 'General Sans',
					data: await font,
					style: 'normal',
				},
			],
		},
	);
}
