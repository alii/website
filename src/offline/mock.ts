import {PinnedRepo} from '../hooks/github';
import {mapper} from '../util/fn';

const repos = mapper<never, PinnedRepo>((_, index) => ({
	repo: `mock-${index}`,
	owner: 'alii',
	description: 'This is a mock repo',
	language: 'TypeScript',
	languageColor: '#123456',
	stars: Math.floor(Math.random() * 100).toString(),
	forks: Math.floor(Math.random() * 100).toString(),
}));

export const mockPinnedRepos = repos([...new Array<never>(6)]);
