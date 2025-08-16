import { FC } from 'react';
import { Box } from '@mui/material';
import type { MRT_Row } from 'material-react-table';
import Image from 'next/image';

import { toCdnUrl } from '@/src/utils';
import { type VideoRow } from '@/types/types';

const embedSize = {
  w: 720,
  h: 480,
};

type YouTubeProps = { videoId?: string };
const YouTube: FC<YouTubeProps> = ({ videoId }: YouTubeProps) => (
  <iframe
    width='100%'
    height='100%'
    src={`https://www.youtube.com/embed/${videoId}`}
    allowFullScreen
  >
  </iframe>
);

type VideoProps = { filename?: string | null, thumbnail?: string | null };
const VideoContainer: FC<VideoProps> = ({ filename, thumbnail }: VideoProps) => {
  if (!filename) {
    const biggest = Math.max(embedSize.w, embedSize.h);
    if (thumbnail) return (
      <Image
        src={toCdnUrl(thumbnail)}
        alt='Video thumbnail'
        width={biggest}
        height={biggest}
        style={{ objectFit: 'contain' }}
      />
    );

    return <>Video and thumbnail not found in the archive</>;
  }

  return (
    <video
      controls
      width={embedSize.w}
      height={embedSize.h}
      poster={toCdnUrl(thumbnail)}
    >
      <source src={toCdnUrl(filename)} type='video/x-matroska' />
      <source src={toCdnUrl(filename)} type='video/webm' />
      <source src={toCdnUrl(filename)} type='video/mp4' />
    </video>
  );
};

type RowDetailProps = { row: VideoRow };
export const RowDetail: FC<RowDetailProps> = ({ row }: RowDetailProps) => (
  <Box component='pre' sx={{ fontFamily: 'inherit' }}>
    <Box sx={{
      display: 'flex',
      resize: 'both',
      overflow: 'auto',
      // The default size of the iframe should be 480p. Controlling the size is pretty much impossible any other way.
      ...(!row.deleted
        ? { width: '720px', height: '480px' }
        : undefined),
    }}
    >
      {row.deleted
        ? <VideoContainer filename={row.downloadedFilename} thumbnail={row.filesThumbnail} />
        : <YouTube videoId={row.videoId} />}
    </Box>
    <br />
    {row.alternative && (
      <>
        <div>
          Alternative: {row.alternative}
        </div>
        <br />
      </>
    )}
    Search title from YouTube:
    {' '}
    <a
      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(row.title || '')}`}
      target='_blank'
      rel='noopener noreferrer'
    >
      {row.title}
    </a>
    <br />
    <br />
    {row.description}
  </Box>
);

export const renderDetailRow = ({ row }: { row: MRT_Row<VideoRow> }) => (
  <RowDetail row={row.original} />
);
