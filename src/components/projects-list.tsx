export interface GitHubRepo {
	name: string;
	description: string;
	language: string | null;
	stars: number;
	url: string;
}

export const projectNames = [
	'oven-sh/bun',
	'alii/arc',
	'alii/al',
	'valtyr/prisma-kysely',
	'kaito-http/kaito',
	'alii/use-lanyard',
	'alii/nextkit',
	'alii/use-last-fm',
	'alii/discord-jsx',
	'alii/poimandres-terminal',
	'alii/linear-style',
	'alii/azs',
	'alii/searchy',
	'alii/permer',
	'alii/trisma',
	'alii/typestr',
];

const languageColors: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Zig: '#ec915c',
	Rust: '#dea584',
	Go: '#00add8',
	Python: '#3572a5',
	Gleam: '#ffaff3',
	V: '#4f87c4',
	CSS: '#563d7c',
	HTML: '#e34c26',
	Shell: '#89e051',
	C: '#555555',
	'C++': '#f34b7d',
};

export interface ProjectsListProps {
	repos: GitHubRepo[];
}

export function ProjectsList({repos}: ProjectsListProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{repos.map(repo => {
				const name = repo.name.split('/')[1];
				const langColor = repo.language ? languageColors[repo.language] ?? '#888' : null;

				return (
					<a
						key={repo.name}
						href={repo.url}
						target="_blank"
						rel="noopener noreferrer"
						title={repo.description}
						className="group flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
					>
						{langColor && (
							<span
								className="inline-block size-2 shrink-0 rounded-full"
								style={{backgroundColor: langColor}}
							/>
						)}
						<span className="text-zinc-700 dark:text-zinc-300">{name}</span>
					</a>
				);
			})}
		</div>
	);
}
