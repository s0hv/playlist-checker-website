import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  accordionSummaryClasses,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import type { CellComponent } from './types';

export const ArrayCell: CellComponent<string[] | null | undefined> = ({ value }) => {
  if (!value || !Array.isArray(value)) {
    return <Typography>No items</Typography>;
  }

  return (
    <Accordion
      slotProps={{
        transition: { unmountOnExit: true },
      }}
      sx={{ overflowX: 'clip', width: '100%' }}
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
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        maxHeight: 200,
      }}
      >
        <List>
          {value.map(item => (
            <ListItem
              key={item}
              disablePadding
              sx={{ width: 'max-content', pr: 2 }}
            >
              <ListItemText>{item}</ListItemText>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
