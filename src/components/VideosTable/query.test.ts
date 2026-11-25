import { describe, expect, it } from 'vitest';

import { allColumnNames, columnToTableCol, rowDetailCols } from './columnInfos';
import { buildSelect, buildSort, buildWhere } from './query';

const selectedColumns = (select: Record<string, string[]>) => new Set(
  Object.entries(select).flatMap(([table, cols]) => cols.map(col => `${table}.${col}`))
);

describe('buildWhere', () => {
  it('returns no filters for an empty state', () => {
    expect(buildWhere({})).toEqual([]);
  });

  it('turns text modes into escaped LIKE patterns', () => {
    expect(buildWhere({
      title: { mode: 'contains', value: '50%' },
      downloadFormat: { mode: 'startsWith', value: 'mp' },
      downloadedFilename: { mode: 'endsWith', value: '.mkv' },
    })).toEqual([
      { table: 'video', col: 'title', comp: 'ILIKE', value: String.raw`%50\%%` },
      { table: 'video', col: 'download_format', comp: 'ILIKE', value: 'mp%' },
      { table: 'video', col: 'downloaded_filename', comp: 'ILIKE', value: '%.mkv' },
    ]);
  });

  it('skips filters without a value', () => {
    expect(buildWhere({
      title: { mode: 'contains', value: '' },
      videoId: { mode: 'equals' },
      tagTag: { mode: 'arrayContains', value: [] },
    })).toEqual([]);
  });

  // Empty checks must be sent even though the user never types a value
  it('sends valueless modes without a value', () => {
    expect(buildWhere({ title: { mode: 'empty' } })).toEqual([
      { table: 'video', col: 'title', comp: 'empty', value: '' },
    ]);
  });

  it('maps number comparison modes to comparators', () => {
    expect(buildWhere({
      id: { mode: 'greaterThanOrEqualTo', value: '10' },
    })).toEqual([
      { table: 'video', col: 'id', comp: '>=', value: '10' },
    ]);
  });

  it('maps boolean filters to true and false comparators', () => {
    expect(buildWhere({
      deleted: { mode: 'is', value: true },
      download: { mode: 'is', value: false },
    })).toEqual([
      { table: 'video', col: 'deleted', comp: 'true', value: '' },
      { table: 'video', col: 'download', comp: 'false', value: '' },
    ]);
  });

  it('sends dates as local calendar days', () => {
    expect(buildWhere({
      publishedAt: { mode: 'after', value: new Date(2026, 10, 25) },
    })).toEqual([
      { table: 'video', col: 'published_at', comp: 'after', value: '2026-11-25' },
    ]);
  });

  it('splits byte ranges into two comparisons', () => {
    expect(buildWhere({
      filesize: { mode: 'betweenInclusive', value: [1024, 2048] },
      filesTotalFilesize: { mode: 'between', value: [1, 2] },
    })).toEqual([
      { table: 'video', col: 'filesize', comp: '>=', value: 1024 },
      { table: 'video', col: 'filesize', comp: '<=', value: 2048 },
      { table: 'files', col: 'total_filesize', comp: '>', value: 1 },
      { table: 'files', col: 'total_filesize', comp: '<', value: 2 },
    ]);
  });

  it('sends array text modes as a single pattern', () => {
    expect(buildWhere({
      tagTag: { mode: 'arrayStartswith', value: 'rock' },
    })).toEqual([
      { table: 'tag', col: 'tag', comp: 'arrayLike', value: 'rock%' },
    ]);
  });

  it('filters playlists by their ids', () => {
    expect(buildWhere({
      playlistName: { mode: 'arrayAny', value: [3, 7] },
    })).toEqual([
      { table: 'playlist', col: 'id', comp: 'arrayAny', value: [3, 7] },
    ]);
  });
});

describe('buildSelect', () => {
  it('selects every column by default except always excluded ones', () => {
    const select = buildSelect({});

    expect(select.playlist).toEqual(['name', 'playlist_id']);
    expect(Object.values(select).flat()).toHaveLength(allColumnNames.size - 1);
  });

  it('excludes hidden columns', () => {
    expect(buildSelect({ tagTag: false }).tag).toBeUndefined();
  });

  it('always selects the columns shown in the detail panel', () => {
    const hideAll = Object.fromEntries([...allColumnNames].map(column => [column, false]));
    const detailColumns = new Set(rowDetailCols.map(column => columnToTableCol[column].join('.')));

    expect(selectedColumns(buildSelect(hideAll))).toEqual(detailColumns);
  });
});

describe('buildSort', () => {
  it('maps sorting state to API columns', () => {
    expect(buildSort([{ id: 'publishedAt', desc: true }, { id: 'channelName', desc: false }])).toEqual([
      { table: 'video', col: 'published_at', asc: false },
      { table: 'channel', col: 'name', asc: true },
    ]);
  });
});
