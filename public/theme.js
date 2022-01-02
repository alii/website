function setMetaThemeColor(color) {
	const meta = document.querySelector('meta[name=theme-color]');

	if (!meta) {
		return;
	}

	meta.setAttribute('content', color);
}

const colors = {
	light: '#ffffff',
	dark: '#000000',
};

if (
	window.matchMedia &&
	window.matchMedia('(prefers-color-scheme: dark)').matches
) {
	setMetaThemeColor(colors.dark);
}

window
	.matchMedia('(prefers-color-scheme: dark)')
	.addEventListener('change', e => {
		const newColorScheme = e.matches ? 'dark' : 'light';
		setMetaThemeColor(colors[newColorScheme]);
	});
