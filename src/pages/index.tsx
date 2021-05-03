import {LargeTitle} from '../components/large-title';
import Link from 'next/link';
import {Layout} from '../layouts/Layout';
import {Song} from '../components/song';
import {
  SiWebstorm,
  SiTypescript,
  SiReact,
  SiNodeDotJs,
  SiJava,
  SiPostgresql,
  SiAmazonaws,
  SiWebpack,
  SiBabel,
  SiDocker,
  SiRedis,
  SiYarn,
  SiStyledComponents,
  SiCss3,
  SiHtml5,
  SiTailwindcss,
  SiSpotify,
  SiSentry,
  SiServerless,
  SiGit,
  SiGithub,
  SiSlack,
  SiDiscord,
  SiMarkdown,
  SiJsonwebtokens,
  SiVisualstudiocode,
  SiNextDotJs,
} from 'react-icons/si';
import {Tooltip} from 'react-tippy';
import {IconType} from 'react-icons';
import {ReactNode} from 'react';

export default function Index() {
  return (
    <Layout>
      <div className="flex">
        <Link href="/about" passHref>
          <a className="flex-1">About me</a>
        </Link>
        <p>TypeScript + React + Node.js</p>
      </div>
      <div className="flex flex-1">
        <div className="flex justify-end flex-col space-y-10">
          <div className="space-y-2">
            <LargeTitle>Alistair Smith</LargeTitle>
            <Icons>
              <Icon icon={SiTypescript} title="TypeScript" />
              <Icon icon={SiWebstorm} title="WebStorm IDE" />
              <Icon icon={SiReact} title="React.js" />
              <Icon icon={SiRedis} title="Redis" />
              <Icon icon={SiNodeDotJs} title="Node.js" />
              <Icon icon={SiNextDotJs} title="Next.js" />
              <Icon icon={SiPostgresql} title="PostgreSQL" />
              <Icon icon={SiDocker} title="Docker" />
              <Icon icon={SiAmazonaws} title="AWS" />
              <Icon icon={SiWebpack} title="Webpack" />
              <Icon icon={SiBabel} title="Babel" />
              <Icon icon={SiJava} title="Java" />
              <Icon icon={SiYarn} title="Yarn" />
              <Icon icon={SiStyledComponents} title="Styled Components" />
              <Icon icon={SiCss3} title="CSS3" />
              <Icon icon={SiHtml5} title="HTML5" />
              <Icon icon={SiSpotify} title="Spotify" />
              <Icon icon={SiSentry} title="Sentry" />
              <Icon icon={SiTailwindcss} title="TailwindCSS" />
              <Icon icon={SiServerless} title="Serverless" />
              <Icon icon={SiGit} title="Git" />
              <Icon icon={SiGithub} title="GitHub" />
              <Icon icon={SiSlack} title="Slack" />
              <Icon icon={SiDiscord} title="Discord" />
              <Icon icon={SiMarkdown} title="Markdown" />
              <Icon icon={SiJsonwebtokens} title="JSON Web Tokens" />
              <Icon icon={SiVisualstudiocode} title="VSCode" />
            </Icons>
          </div>
          <Song />
        </div>
      </div>
    </Layout>
  );
}

function Icons({children}: {children: ReactNode}) {
  return <div className="flex space-x-1">{children}</div>;
}

function Icon({icon, title}: {icon: IconType; title: string}) {
  return <Tooltip title={title}>{icon({className: 'inline'})}</Tooltip>;
}
