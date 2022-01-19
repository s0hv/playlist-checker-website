import Checkbox from '@mui/material/Checkbox';
import {
  DataTypeProvider,
  DataTypeProviderProps
} from '@devexpress/dx-react-grid';
import React, { FunctionComponent } from 'react';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import { none } from '../../utils';

export const boolFilters = ['noFilter', 'true', 'false'] as const;
type BoolFilter = typeof boolFilters[number];

export const boolFilterMessages: { [key in BoolFilter]: string } = {
  noFilter: 'No filter',
  true: 'True',
  false: 'False'
};
export const boolFilterIcons: { [key in BoolFilter]: FunctionComponent } = {
  true: Check,
  false: Close,
  noFilter: Search
};

export const BoolFormatter = ({ value }: { value?: any }) => (
  <Checkbox
    checked={Boolean(value)}
    disabled={true}
  />
);

export const BoolTypeProvider: FunctionComponent<DataTypeProviderProps> = (props: DataTypeProviderProps) => (
  <DataTypeProvider
    formatterComponent={BoolFormatter}
    editorComponent={none}
    {...props}
  />
);
