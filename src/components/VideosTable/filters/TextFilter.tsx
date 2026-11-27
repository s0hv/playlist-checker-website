import { useState } from 'react';
import { TextField } from '@mui/material';
import { useDebouncer } from '@tanstack/react-pacer/debouncer';

import type { FilterComponent } from '../types';

import { filterModeHelperText, FilterModeMenu } from './FilterModeMenu';
import { type FilterMode, valuelessModes } from './modes';

const debounceMs = 400;

/**
 * Filter for every column kind whose value is typed in as text.
 */
export const TextFilter: FilterComponent = ({ kind, mode, value, onChange }) => {
  const [text, setText] = useState(typeof value === 'string' ? value : '');
  const debouncer = useDebouncer(
    (selectedMode: FilterMode, newText: string) => onChange({ mode: selectedMode, value: newText }),
    { wait: debounceMs }
  );
  const isValueless = valuelessModes.has(mode);

  return (
    <TextField
      variant='standard'
      size='small'
      placeholder={isValueless ? undefined : 'Filter'}
      disabled={isValueless}
      value={isValueless ? '' : text}
      onChange={event => {
        setText(event.target.value);
        debouncer.maybeExecute(mode, event.target.value);
      }}
      helperText={filterModeHelperText(mode)}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <FilterModeMenu
              kind={kind}
              mode={mode}
              onSelect={selected => {
                // A pending change still carries the previous mode and would override the selected one
                debouncer.cancel();
                onChange({ mode: selected, value: text });
              }}
            />
          ),
        },
      }}
    />
  );
};
