import {
  DataTypeProvider,
  DataTypeProviderProps,
  TableFilterRow as TableFilterRowBase,
} from '@devexpress/dx-react-grid';
import React, { FunctionComponent } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { FilterOperation } from '../../utils';
import { TableFilterRow } from '@devexpress/dx-react-grid-material-ui';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

export const arrayFilters: FilterOperation[] = [
  'arrayEqual',
  'arrayContains',
  'arrayStartswith'
];

const iconProxy = (type: string): FunctionComponent<TableFilterRowBase.IconProps> => {
  // eslint-disable-next-line react/display-name
  return ({type: _, ...restProps}: TableFilterRowBase.IconProps) =>
    <TableFilterRow.Icon type={type} {...restProps}/>;
};

export const arrayFilterMessages: { [key: string]: string } = {
  arrayEqual: 'arrayEqual',
  arrayContains: 'arrayContains',
  arrayStartswith: 'arrayStartswith'
};
export const arrayFilterIcons: { [key: string]: FunctionComponent<any> } = {
  arrayEqual: iconProxy('equal'),
  arrayContains: iconProxy('contains'),
  arrayStartswith: iconProxy('startsWith')
};

export const ArrayFormatter: FunctionComponent<DataTypeProvider.ValueFormatterProps> = ({ value }: DataTypeProvider.ValueFormatterProps) => {
  if (!value || !Array.isArray(value)) return <Typography>No items</Typography>;

  return (
    <Accordion sx={{  overflowX: 'clip' }} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        expandIcon={<ChevronRightIcon />}
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(90deg)',
          },
          '& .MuiAccordionSummary-content, & .MuiAccordionSummary-content.Mui-expanded': {
            marginLeft: 1,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            position: 'absolute',
            left: '0px'
          }
      }}
      >
        {value.slice(0, 5).join(', ').toString()}{value.length > 5 ? ', ...' : ''}
      </AccordionSummary>
      <AccordionDetails sx={{
        height: 'max-content',
        overflowY: 'auto',
        maxHeight: 200
      }}>
        <List>
          {value.map(item => (
            <ListItem key={item} disablePadding>
              <ListItemText>{item}</ListItemText>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export const ArrayTypeProvider: FunctionComponent<DataTypeProviderProps> = (props: DataTypeProviderProps) => (
  <DataTypeProvider
    availableFilterOperations={arrayFilters}
    formatterComponent={ArrayFormatter}
    {...props}
  />
);
