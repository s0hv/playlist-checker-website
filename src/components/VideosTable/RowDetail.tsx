import { VideoRow } from '../../../types/types';
import { css } from '@emotion/react';
import { FunctionComponent } from 'react';
import Image from 'next/image';
import { toCdnUrl } from '../../utils';

const embedSize = {
  w: 720,
  h: 480
};

type YouTubeProps = { videoId?: string };
const YouTube: FunctionComponent<YouTubeProps> = ({ videoId }: YouTubeProps) => (
  <iframe
    width='100%'
    height='100%'
    src={`https://www.youtube.com/embed/${videoId}`}
    allowFullScreen
  >
  </iframe>
);

type VideoProps = { filename?: string, thumbnail?: string };
const VideoContainer: FunctionComponent<VideoProps> = ({ filename, thumbnail }: VideoProps) => {
  if (!filename) {
    const biggest = Math.max(embedSize.w, embedSize.h);
    if (thumbnail) return (
      <Image
        src={toCdnUrl(thumbnail)}
        alt="Video thumbnail"
        width={biggest}
        height={biggest}
        objectFit='contain'
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
      <source src={toCdnUrl(filename)} type='video/x-matroska'/>
      <source src={toCdnUrl(filename)} type='video/webm'/>
      <source src={toCdnUrl(filename)} type='video/mp4'/>
    </video>
  );
};


export const RowDetail = ({ row }: { row: VideoRow }) => (
  <pre css={css`font-family: inherit;`}>
    <div css={css`
      display: flex;
      resize: both;
      overflow: auto;
      ${/* Default size of the iframe should be 480p. Controlling the size is pretty much impossible any other way. */''}
      ${row.deleted ? '' : 'width: 720px; height: 480px;'}
    `}>
      {row.deleted ? <VideoContainer filename={row.downloadedFilename} thumbnail={row.filesThumbnail} /> : <YouTube videoId={row.videoId} />}
    </div>
    <br/>
    {row.alternative && (
      <>
        <div>
          Alternative: {row.alternative}
        </div>
        <br/>
      </>
    )}
    Search title from YouTube: <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(row.title || '')}`} target='_blank' rel='noopener noreferrer'>{row.title}</a>
    <br/><br/>
    {row.description}
  </pre>
);
