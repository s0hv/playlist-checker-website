import { createFileRoute } from '@tanstack/react-router';

import { getPlaylists } from '@/db/videos';
import { checkAuth, methodNotAllowedHandlers } from '@/src/serverUtils';

const GET = async () => {
  await checkAuth();

  return getPlaylists()
    .then(rows => Response.json({ rows }))
    .catch(err => {
      console.error(err);
      return new Response(null, {
        status: 500,
      });
    });
};

export const Route = createFileRoute('/api/playlists')({
  server: {
    handlers: {
      ...methodNotAllowedHandlers,
      GET,
    },
  },
});
