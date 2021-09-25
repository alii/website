import {useEffect} from 'react';
import {createTranslations} from 'react-text-translator';
import {useGitHubPinnedRepos} from '../hooks/github';

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
	'intro.para-2': {
		'en-gb': function ENGBPara2() {
			const {data: projects} = useGitHubPinnedRepos('alii');

			return (
				<>
					Honestly, a few too many things to count on one hand... I'm currently
					having a fantastic time working with{' '}
					<a href="https://twitter.com/gigglapp">Giggl</a> - we're building a
					way to watch &amp; browse the web, together. Below are some of the
					more popular open source projects I've worked on. In total, the
					following repos have earnt me{' '}
					{projects?.reduce((stars, repo) => stars + parseInt(repo.stars), 0)}{' '}
					stars! Thank you! 💖
				</>
			);
		},
		'kitty': function KittyPara2() {
			const {data: projects} = useGitHubPinnedRepos('alii');

			return (
				<>
					honestwy-.- a f-few t-too many t-things to c-count on one hand... i'm
					cuwwentwy having a fantastic time wowking with{' '}
					<a href="https://twitter.com/gigglapp">giwggl</a> - we're buiwding a-a
					way to watch &amp; bwowse t-the web-.- together-.- bewow are s-some of
					the more popuwaw open souwce pwojects i've wowked o-on〜☆ in totaw,
					the fowwowing wepos have eawnt me{' '}
					{projects?.reduce((stars, repo) => stars + parseInt(repo.stars), 0)}{' '}
					staws (* ^ ω ^) t-thank you! 💖
				</>
			);
		},
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
