import {useEffect} from 'react';
import {createTranslations} from 'react-text-translator';

export const translator = createTranslations({
	'a trip to london with some friends': {
		'en-gb': 'a trip to london with some friends',
		'kitty': 'awe twip to ludwun wiwh somw fwends',
	},
	'Software Engineer': {
		'en-gb': 'Software Engineer',
		'kitty': 'swoftware enginweer',
	},
	"Hey, I'm Alistair": {
		'en-gb': "Hey, I'm Alistair ✌️",
		'kitty': "HAIII i'm alistrr",
	},
	'intro.para-1': {
		'en-gb':
			"I'm a 16 year old software engineer from the United Kingdom. I'm interested in large scale frontend applications, performant and responsive serverside code. I've recently delved into lower level languages with the help of some friends 😃",
		'kitty':
			"yaii hai i'm a 16 yeaw owd softwawe engineew fwom the united kingdom. I'm intewested in wawge scawe fwontend appwications, pewfowmant awnd wesponsive sewvewside code. I've wecentwy dewved intwo wowew wevew wanguages with the hewp of sowme fwiends 😃",
	},
});

export const languages = translator.getLanguages();
export type Languages = typeof languages[number];

export const T = translator.Text;

export function getInitialLanguage(): Languages {
	if (typeof window === 'undefined') {
		return languages[0];
	}

	const inLocalStorage = window.localStorage.getItem('applang');

	if (!inLocalStorage || !languages.includes(inLocalStorage as Languages)) {
		window.localStorage.setItem('applang', languages[0]);
		return languages[0];
	}

	return inLocalStorage as Languages;
}

export function useDetectLanguageChange() {
	const {activeLang} = translator.useTextTranslateContext();

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		window.localStorage.setItem('applang', activeLang);
	}, [activeLang]);
}
