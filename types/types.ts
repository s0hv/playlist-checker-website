export interface VideoRow {
  id?: number
  videoId?: string
  title?: string
  description?: string
  publishedAt?: Date
  deleted?: boolean
  deletedAt?: Date
  alternative?: string
  thumbnail?: string
  downloadFormat?: string
  downloadedFilename?: string
  downloadedFormat?: string
  download?: boolean
  force_redownload?: boolean

  channelChannelId?: string
  channelName?: string
  channelThumbnail?: string

  filesThumbnail?: string
  filesAudioFile?: string
  filesSubtitles?: string[]

  playlistName?: string
  playlistPlaylistId?: string

  tagTag?: string
}

export interface ColumnSort {
  col: string
  table: string
  asc?: boolean
}

export interface ColumnFilter {
  col: string
  table: string
  value: string
  comp: string
}

export interface PlaylistName {
  name: string,
  id: number
}
