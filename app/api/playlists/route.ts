import { getPlaylists } from '@/db/videos';
import { checkAuth } from '@/src/serverUtils';


export const GET = async () => {
  if (!await checkAuth()) return;

  return getPlaylists()
    .then(rows => Response.json({ rows }))
    .catch(err => {
      console.error(err);
      return new Response(null, {
        status: 500,
      });
    });
};
