import { type ReactNode, FC, useCallback } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getPlaylistsQueryOptions } from '@/api/search';
import { PlaylistName } from '@/types/types';

import { noRows } from './constants';
import type { FilterProps } from './types';


const getOptionLabel = (option: PlaylistName) => option.name;

export const PlaylistFilter: FC<FilterProps> = ({ column }): ReactNode => {
  const { data: playlists } = useQuery(getPlaylistsQueryOptions);

  const handleChange = useCallback((_: unknown, value: PlaylistName[] | null) => {
    column.setFilterValue(value?.map(p => p.id));
  }, [column]);

  return (
    <Autocomplete
      renderInput={params => <TextField {...params} variant='standard' />}
      getOptionLabel={getOptionLabel}
      options={playlists ?? noRows}
      onChange={handleChange}
      limitTags={3}
      multiple
      fullWidth
    />
  );
};
