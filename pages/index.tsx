import type { NextPage } from 'next';
import Head from 'next/head';
import { VideosTable } from '../src/components/VideosTable';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Video archive</title>
      </Head>

      <main>
       <div>
        <VideosTable />
       </div>
      </main>

      <footer>
        <a
          href="https://github.com/s0hv/playlist-checker-website/blob/master/DEVEXTREME_LICENSE.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          LICENSES
        </a>
      </footer>
    </div>
  );
};

export default Home;
