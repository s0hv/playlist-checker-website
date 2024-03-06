import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid';
import { Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import React, { FunctionComponent } from 'react';
import { FilterOperation } from '../../utils';

export const bytesFilters: FilterOperation[] = [
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual'
];

export const BytesFormatter = ({ value }: { value?: any }) => {
  let bytes = null;
  if (typeof value === 'number') {
    const k = value > 0 ? Math.floor((Math.log2(value)/10)) : 0;
    const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b';
    bytes = `${(value / Math.pow(1024, k)).toFixed(1)} ${rank}`;
  }

  return <Typography>{bytes}</Typography>;
};

export const BytesEditor: FunctionComponent<DataTypeProvider.ValueEditorProps> = ({ value, onValueChange }:  DataTypeProvider.ValueEditorProps) => (
  <TextField
      defaultValue={value}
      type="number"
      variant="standard"
      InputProps={{
        endAdornment: <InputAdornment position="end">Mb</InputAdornment>,
      }}
      InputLabelProps={ {shrink: true,} }
      onChange={event => {
        const val = Number(event.target.value);
        if (isNaN(val) || event.target.value.trim() === '') return onValueChange(undefined);

        onValueChange(Math.floor(val * Math.pow(1024, 2)));
      }}
  />
);


export const BytesTypeProvider: FunctionComponent<DataTypeProviderProps> = (props: DataTypeProviderProps) => (
  <DataTypeProvider
    formatterComponent={BytesFormatter}
    editorComponent={BytesEditor}
    {...props}
  />
);
