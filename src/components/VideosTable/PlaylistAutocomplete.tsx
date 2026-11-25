import { Autocomplete, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getPlaylistsQueryOptions } from '@/api/search';
import { PlaylistName } from '@/types/types';

import { noRows } from './constants';
import type { FilterComponent } from './types';


const getOptionLabel = (option: PlaylistName) => option.name;

export const PlaylistFilter: FilterComponent = ({ mode, value, onChange }) => {
  const { data: playlists } = useQuery(getPlaylistsQueryOptions);
  const selectedIds = new Set(Array.isArray(value) ? value : []);
  const selected = (playlists ?? noRows).filter(playlist => selectedIds.has(playlist.id));

  return (
    <Autocomplete
      renderInput={params => <TextField {...params} variant='standard' />}
      getOptionLabel={getOptionLabel}
      options={playlists ?? noRows}
      value={selected}
      onChange={(_, newSelected) => onChange(newSelected.length > 0
        ? { mode, value: newSelected.map(playlist => playlist.id) }
        : undefined)}
      isOptionEqualToValue={(option, other) => option.id === other.id}
      limitTags={3}
      multiple
      fullWidth
    />
  );
};
