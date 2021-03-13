import {LargeTitle} from '../components/large-title';
import Link from 'next/link';
import {Activity} from '../components/activity';

export default function Index() {
  return (
    <div className="flex h-full flex-col p-14 bg-blur">
      <div className="flex">
        <Link href="/about" passHref>
          <a className="flex-1">About me</a>
        </Link>
        <p>TypeScript + React + Node.js</p>
      </div>
      <div className="flex flex-1">
        <div className="flex justify-center flex-col space-y-10">
          <LargeTitle>Alistair Smith</LargeTitle>
          <Activity />
        </div>
      </div>
      <div className="flex">
        <p className="flex-1">
          Currently working at <a href="https://edge.gg">Edge</a>
        </p>
        <p>
          <Link href="/blog">Blog</Link>
        </p>
      </div>
    </div>
  );
}
