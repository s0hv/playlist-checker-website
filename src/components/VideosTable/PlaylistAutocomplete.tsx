import { useQuery } from 'react-query';
import { Autocomplete, TextField } from '@mui/material';
import { getPlaylists } from '../../api/search';
import React, { FunctionComponent } from 'react';
import {
  DataTypeProvider,
  DataTypeProviderProps
} from '@devexpress/dx-react-grid';
import { FilterOperation } from '../../utils';
import { ArrayFormatter } from './array';

export const arrayFilters: FilterOperation[] = [
  'arrayAny',
];

export const PlaylistAutocomplete: FunctionComponent<DataTypeProvider.ValueEditorProps>  = ({ onValueChange }:  DataTypeProvider.ValueEditorProps) => {
  const { isFetching, data } = useQuery(['playlists'], () => getPlaylists(), {
    keepPreviousData: true,
    staleTime: Infinity,
    retry: false,
    placeholderData: []
  });

  return (
    <Autocomplete
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={opt => opt.name}
      options={data || []}
      onChange={(e, value) => onValueChange(value)}
      loading={isFetching}
      limitTags={3}
      multiple
      fullWidth
    />
  );
};

export const PlaylistNameProvider: FunctionComponent<DataTypeProviderProps> = (props: DataTypeProviderProps) => (
  <DataTypeProvider
    availableFilterOperations={arrayFilters}
    editorComponent={PlaylistAutocomplete}
    formatterComponent={ArrayFormatter}
    {...props}
  />
);

