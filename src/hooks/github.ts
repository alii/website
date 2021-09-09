import useSWR from 'swr';

interface User {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string;
	company: string;
	blog: string;
	location: string;
	email: string | null;
	hireable: boolean;
	bio: string;
	twitter_username: string;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

export function useGitHubUser(username: string) {
	return useSWR<User, Error>(`https://api.github.com/users/${username}`);
}

export interface PinnedRepo {
	owner: string;
	repo: string;
	description: string;
	language: string;
	languageColor: string;
	stars: number;
	forks: number;
}

export function useGitHubPinnedRepos(username: string) {
	return useSWR<PinnedRepo[], Error>(
		`https://gh-pinned-repos.egoist.sh/?username=${username}`,
	);
}
