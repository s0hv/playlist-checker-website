import TextField from '@mui/material/TextField';
import React, { FunctionComponent } from 'react';
import DateRange from '@mui/icons-material/DateRange';
import {
  DataTypeProvider,
  DataTypeProviderProps
} from '@devexpress/dx-react-grid';
import ValueFormatterProps = DataTypeProvider.ValueFormatterProps;
import { defaultDateDistanceToNow, defaultDateFormat } from '../../utils';

export const dateColumnFilters = ['at', 'before', 'after'] as const;
type DateFilter = typeof dateColumnFilters[number];

export const dateFilterMessages: { [key in DateFilter]: string }  = {
    at: 'During date',
    before: 'Before date',
    after: 'After date'
};
export const dateFilterIcons: { [key in DateFilter]: FunctionComponent } = {
    at: DateRange,
    before: DateRange,
    after: DateRange
};


export const DateEditor: FunctionComponent<DataTypeProvider.ValueEditorProps> = ({ value, onValueChange }:  DataTypeProvider.ValueEditorProps) => (
    <form noValidate>
        <TextField
            defaultValue={value}
            id="date"
            type="date"
            InputLabelProps={ {shrink: true,} }
            onChange={event => onValueChange(event.target.value)}
        />
    </form>
);

const DateFormatter: FunctionComponent<ValueFormatterProps> = ({ value }: ValueFormatterProps) => (
  <>
    {value ? `${defaultDateFormat(value, '')} (${defaultDateDistanceToNow(value, '')})` : ''}
  </>
);

export const DateTypeProvider: FunctionComponent<DataTypeProviderProps> = (props: DataTypeProviderProps) => (
  <DataTypeProvider
    formatterComponent={DateFormatter}
    editorComponent={DateEditor}
    {...props}
  />
);
