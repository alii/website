import {PinnedRepo} from '../hooks/github';

function getMock(index: number): PinnedRepo {
	return {
		repo: `mock-${index}`,
		owner: 'alii',
		description: 'This is a mock repo',
		language: 'TypeScript',
		languageColor: '#123456',
		stars: Math.floor(Math.random() * 100).toString(),
		forks: Math.floor(Math.random() * 100).toString(),
	};
}

export const mockPinnedRepos = [...Array.from({length: 6})].map((_, index) =>
	getMock(index),
);
