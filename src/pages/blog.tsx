import Link from 'next/link';
import {Layout} from '../layouts/Layout';

export default function Blog() {
  return (
    <Layout>
      <Link href="/">Back</Link>
      <h1 className="text-4xl font-bold">Coming Soon</h1>
    </Layout>
  );
}
