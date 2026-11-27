import { useRef } from 'react';
import { FormControl, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useDebouncer } from '@tanstack/react-pacer/debouncer';

import { defaultDateDistanceToNow, defaultDateFormat } from '@/src/utils';

import { filterModeHelperText, FilterModeMenu } from './filters/FilterModeMenu';
import type { FilterMode } from './filters/modes';
import type { CellComponent, FilterComponent } from './types';

// Typing a date produces valid intermediate dates, which should not each trigger a search
const debounceMs = 400;

export const DateCell: CellComponent<Date | number | null | undefined> = ({ value }) => (
  value
    ? `${defaultDateFormat(value, '')} (${defaultDateDistanceToNow(value, '')})`
    : ''
);

export const DateFilter: FilterComponent = ({ kind, mode, value, onChange }) => {
  const date = value instanceof Date ? value : null;
  const latestDate = useRef(date);
  const debouncer = useDebouncer(
    (selectedMode: FilterMode, newDate: Date | null) => onChange({ mode: selectedMode, value: newDate ?? undefined }),
    { wait: debounceMs }
  );

  return (
    <FormControl>
      {/* Uncontrolled, because re-rendering a controlled value resets partially typed date sections */}
      <DatePicker
        defaultValue={date}
        onChange={(newDate, { validationError }) => {
          if (validationError !== null) return;
          latestDate.current = newDate;
          debouncer.maybeExecute(mode, newDate);
        }}
        slotProps={{
          field: { clearable: true },
          textField: {
            variant: 'standard',
            startAdornment: (
              <FilterModeMenu
                kind={kind}
                mode={mode}
                onSelect={selected => {
                  // A pending change still carries the previous mode and would override the selected one
                  debouncer.cancel();
                  onChange({ mode: selected, value: latestDate.current ?? undefined });
                }}
              />
            ),
          },
        }}
      />
      <FormHelperText>{filterModeHelperText(mode)}</FormHelperText>
    </FormControl>
  );
};
