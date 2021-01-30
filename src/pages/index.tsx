import {Song} from '../components/Song';
import {ContainerRow} from '../components/ContainerRow';
import {LargeTitle} from '../components/LargeTitle';
import Link from 'next/link';
import {GetServerSideProps} from 'next';

interface IndexProps {
  isWin: boolean;
}

export default function Index({isWin}: IndexProps) {
  return (
    <div>
      <ContainerRow>
        <div>
          <div>
            <Link href="/about">About me</Link>
          </div>
          <div>
            <p>TypeScript + React + Node.js</p>
          </div>
        </div>
      </ContainerRow>
      <ContainerRow large>
        <LargeTitle>Alistair Smith</LargeTitle>
        <h2>
          Full-stack TypeScript engineer from the UK{' '}
          {!isWin && (
            <span role="img" aria-label="GB Flag">
              🇬🇧
            </span>
          )}
        </h2>
      </ContainerRow>
      <ContainerRow>
        <div>
          <p>
            Currently working at <a href="https://edge.gg">Edge</a>
          </p>
        </div>
        <div>
          <Song />
        </div>
      </ContainerRow>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<IndexProps> = (ctx) => {
  return Promise.resolve({
    props: {isWin: /Win/i.test(ctx.req.headers['user-agent'] || '')},
  });
};
