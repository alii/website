import useSWR from 'swr';

type User = {
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
};

/**
 * SWR wrapper that retusn a full github user object from the public api
 * @param username The github username to fetch data for
 * @returns An SWRREsponse fulfilled with the github user
 */
export function useGitHubUser(username: string) {
	return useSWR<User, Error>(`https://api.github.com/users/${username}`);
}

export type PinnedRepo = {
	owner: string;
	repo: string;
	description: string;
	language: string;
	languageColor: string;
	stars: string;
	forks: string;
};

/**
 * SWR wrapper that returns github repositories for a user
 * @param username The github username to fetch pinned repos for
 * @returns An SWRResponse fulfilled with an array of pinned github repos
 */
export function useGitHubPinnedRepos(username: string) {
	const resp = useSWR<PinnedRepo[], Error>(
		`https://gh-pinned.nxl.sh/api/user/${username}`,
	);

	return {
		...resp,
		data: resp.data?.map(item => {
			const data: PinnedRepo & {url: string} = {
				...item,
				url: `https://github.com/${item.owner}/${item.repo}`,
			};

			return data;
		}),
	};
}
