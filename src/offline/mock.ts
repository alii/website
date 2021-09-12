import {PinnedRepo} from '../hooks/github';

function getMock(_: never, index: number): PinnedRepo {
	return {
		repo: `mock-${index}`,
		owner: 'alii',
		description: 'This is a mock repo',
		language: 'TypeScript',
		languageColor: '#123456',
		stars: Math.floor(Math.random() * 100),
		forks: Math.floor(Math.random() * 100),
	};
}

export const mockPinnedRepos = [...new Array<never>(6)].map(getMock);
