import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  accordionSummaryClasses,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import {
  type RenderFilterModeMenuItems,
  type VideoTableColumnDef,
  ArrayFilterOption,
  CellComponent,
  FilterFns,
} from './types';
import { getFilterLocalizations, getFilterMethods } from './utils';

export const arrayFilterMessages: Record<ArrayFilterOption, string> = {
  arrayEqual: 'Array equals',
  arrayContains: 'Array contains',
  arrayStartswith: 'Array starts with',
};

export const arrayFilterLocalization = getFilterLocalizations(arrayFilterMessages);

export const arrayFilterMethods: FilterFns<ArrayFilterOption> = getFilterMethods(arrayFilterMessages);

export const arrayFilterOptions: ArrayFilterOption[] = [
  'arrayEqual',
  'arrayContains',
  'arrayStartswith',
];

export const renderArrayFilterModeMenuItems: RenderFilterModeMenuItems = ({ onSelectFilterMode }) => arrayFilterOptions.map(filterOption => (
  <MenuItem
    key={filterOption}
    onClick={() => onSelectFilterMode(filterOption)}
    sx={{ display: 'flex', gap: 1 }}
  >
    {arrayFilterMessages[filterOption]}
  </MenuItem>
));


export const ArrayCell: CellComponent<unknown[] | unknown> = ({ cell }) => {
  const value = cell.getValue();

  if (!value || !Array.isArray(value)) {
    return <Typography>No items</Typography>;
  }

  return (
    <Accordion
      slotProps={{
        transition: { unmountOnExit: true },
      }}
      sx={{ overflowX: 'clip' }}
    >
      <AccordionSummary
        expandIcon={<ChevronRightIcon />}
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          [`& .${accordionSummaryClasses.expandIconWrapper}.Mui-expanded`]: {
            transform: 'rotate(90deg)',
          },
          [`& .${accordionSummaryClasses.content}, & .${accordionSummaryClasses.content}.Mui-expanded`]: {
            marginLeft: 1,
          },
          [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
            position: 'absolute',
            left: '0px',
          },
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {value.slice(0, 5).join(', ').toString()}{value.length > 5 ? ', ...' : ''}
      </AccordionSummary>
      <AccordionDetails sx={{
        height: 'max-content',
        overflowY: 'auto',
        maxHeight: 200,
      }}
      >
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

export const arrayColumnDef: Partial<VideoTableColumnDef> = {
  Cell: ArrayCell,
  filterVariant: 'text',
  renderColumnFilterModeMenuItems: renderArrayFilterModeMenuItems,
  filterFn: 'arrayContains',
};
