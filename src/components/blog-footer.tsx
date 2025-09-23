import {CiGlobe, CiTwitter} from 'react-icons/ci';
import {VscGithubAlt} from 'react-icons/vsc';
import {ExternalLink} from '../components/external-link';

export const BlogFooter = (
	<footer>
		<p className="font-mono [&_a]:inline-block [&_a]:px-6 [&_a]:py-4 [&_a:first-child]:pl-0 [&_a:last-child]:pr-0">
			<FooterLink href="https://alistair.sh">
				<CiGlobe className="mr-[3px] mb-[1.5px] inline size-[15px]" />
				<span>alistair.sh</span>
			</FooterLink>

			<FooterLink href="https://twitter.com/alistaiir">
				<CiTwitter className="mr-0.5 inline size-[18px]" />
				<span>alistaiir</span>
			</FooterLink>

			<FooterLink href="https://github.com/alii">
				<VscGithubAlt className="mr-[3px] inline size-[14px]" />
				<span>alii</span>
			</FooterLink>
		</p>
	</footer>
);

function FooterLink({href, children}: {href: string; children: React.ReactNode}) {
	return (
		<ExternalLink
			href={href}
			className="cursor-default text-sm text-zinc-400 decoration-blue-500/20 hover:underline hover:decoration-blue-500/50 dark:text-zinc-700"
		>
			{children}
		</ExternalLink>
	);
}
