export function PosterizedImage(props: JSX.IntrinsicElements['img'] & {amount: number}) {
	return (
		<>
			<svg viewBox="0 0 338 450" className="hidden">
				<filter id="posterize">
					<feComponentTransfer>
						<feFuncR
							type="discrete"
							tableValues={Array.from({length: props.amount}, (_, i) => i / props.amount).join(' ')}
						/>
						<feFuncG
							type="discrete"
							tableValues={Array.from({length: props.amount}, (_, i) => i / props.amount).join(' ')}
						/>
						<feFuncB
							type="discrete"
							tableValues={Array.from({length: props.amount}, (_, i) => i / props.amount).join(' ')}
						/>
					</feComponentTransfer>
				</filter>
			</svg>

			<img {...props} style={{filter: 'url(#posterize) blur(0.2px)'}} />
		</>
	);
}
