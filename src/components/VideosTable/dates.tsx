import { FormControl, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';

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
  const debouncedOnChange = useDebouncedCallback(
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
          debouncedOnChange(mode, newDate);
        }}
        slotProps={{
          field: { clearable: true },
          textField: {
            variant: 'standard',
            startAdornment: (
              <FilterModeMenu
                kind={kind}
                mode={mode}
                onSelect={selected => onChange({ mode: selected, value: date ?? undefined })}
              />
            ),
          },
        }}
      />
      <FormHelperText>{filterModeHelperText(mode)}</FormHelperText>
    </FormControl>
  );
};
