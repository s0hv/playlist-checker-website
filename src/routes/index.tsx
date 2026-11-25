import { ClientOnly, createFileRoute } from '@tanstack/react-router';

import { VideosTable } from '@/components/VideosTable';

// The table layout is restored from localStorage, and its data is fetched on the client anyway
const VideosPage = () => (
  <ClientOnly>
    <VideosTable />
  </ClientOnly>
);

export const Route = createFileRoute('/')({
  component: VideosPage,
  head: () => ({
    meta: [
      { title: 'Video Archive' },
    ],
  }),
});
