import { z } from 'zod';

export const VideoRow = z.object({
  id: z.bigint().transform(Number).optional(),
  videoId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().nullish(),
  publishedAt: z.number().nullish(),
  deleted: z.boolean().optional(),
  deletedAt: z.number().nullish(),
  alternative: z.string().nullish(),
  thumbnail: z.string().nullish(),
  downloadFormat: z.string().nullish(),
  downloadedFilename: z.string().nullish(),
  downloadedFormat: z.string().nullish(),
  download: z.boolean().nullish(),
  forceRedownload: z.boolean().nullish(),
  filesize: z.bigint().transform(Number).nullish(),

  channelChannelId: z.string().nullish(),
  channelName: z.string().nullish(),
  channelThumbnail: z.string().nullish(),

  filesThumbnail: z.string().nullish(),
  filesAudioFile: z.string().nullish(),
  filesSubtitles: z.array(z.string()).nullish(),
  filesTotalFilesize: z.bigint().transform(Number).nullish(),

  playlistName: z.array(z.string()).nullish(),
  playlistPlaylistId: z.array(z.string()).nullish(),

  tagTag: z.array(z.string()).nullish(),
});
export type VideoRow = z.infer<typeof VideoRow>;

export interface ColumnSort {
  col: string
  table: string
  asc?: boolean
}

export interface ApiColumnFilter {
  col: string
  table: string
  value: string | string[] | number
  comp: string
}

export const PlaylistName = z.object({
  name: z.string(),
  id: z.bigint().transform(Number),
});
export type PlaylistName = z.infer<typeof PlaylistName>;
