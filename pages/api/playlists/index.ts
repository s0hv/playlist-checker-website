import { checkAuth } from '../../../src/serverUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPlaylists } from '../../../src/db/videos';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
    return;
  }

  if (!await checkAuth(req, res)) return;

  return getPlaylists()
    .then(rows => res.json({ rows }))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
};

export default handler;
