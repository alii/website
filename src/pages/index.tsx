import {LargeTitle} from '../components/large-title';
import Link from 'next/link';
import {Layout} from '../layouts/Layout';
import {Song} from '../components/song';
import {SiWebstorm, SiTypescript, SiReact, SiNodeDotJs} from 'react-icons/si';
import {Tooltip} from 'react-tippy';

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
            <p>
              <Tooltip title="TypeScript">
                <SiTypescript className="inline" />
              </Tooltip>{' '}
              <Tooltip title="WebStorm">
                <SiWebstorm className="inline" />
              </Tooltip>{' '}
              <Tooltip title="React.js">
                <SiReact className="inline" />
              </Tooltip>{' '}
              <Tooltip title="Node.js">
                <SiNodeDotJs className="inline" />
              </Tooltip>{' '}
              TypeScript &amp; React engineer from the UK
            </p>
          </div>
          <Song />
        </div>
      </div>
    </Layout>
  );
}
