import { createFileRoute } from '@tanstack/react-router';

import { VideosTable } from '@/components/VideosTable';

export const Route = createFileRoute('/')({
  component: VideosTable,
  head: () => ({
    meta: [
      { title: 'Video Archive' },
    ],
  }),
});
