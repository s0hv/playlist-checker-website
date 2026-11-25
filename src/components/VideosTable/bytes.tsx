import { useState } from 'react';
import {
  type SliderProps,
  Box,
  FormHelperText,
  Slider,
  Typography,
} from '@mui/material';

import { filterModeHelperText, FilterModeMenu } from './filters/FilterModeMenu';
import { type ColumnFilterState, type FilterMode, rangeModes } from './filters/modes';
import type { CellComponent, FilterComponent } from './types';


export const KILOBYTE = 1024;
export const GIGABYTE = KILOBYTE ** 3;

export const bytesToString = (value: number): string => {
  const k = value > 0 ? Math.floor((Math.log2(value) / 10)) : 0;
  const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b';

  return `${(value / Math.pow(1024, k)).toFixed(1)} ${rank}`;
};

const sliderMin = 0;
const sliderMax = 100;

/**
 * Maps a linear slider position to a byte count on a logarithmic scale.
 */
export const sliderPositionToBytes = (position: number): number => {
  if (position === 0) {
    return 0;
  }

  const s = (20 * position) / 100;

  return Math.round(Math.pow(2, s + 10) * 10);
};

export const BytesCell: CellComponent<number | null | undefined> = ({ value }) => (
  <Typography>{typeof value === 'number' ? bytesToString(value) : null}</Typography>
);

const sliderProps: SliderProps = {
  min: sliderMin,
  max: sliderMax,
  scale: sliderPositionToBytes,
  valueLabelFormat: bytesToString,
  valueLabelDisplay: 'auto',
  size: 'small',
};

// A range covering the whole slider does not filter anything
const toRangeFilter = (mode: FilterMode, [min, max]: [number, number]): ColumnFilterState => (
  min === sliderMin && max === sliderMax
    ? { mode }
    : { mode, value: [sliderPositionToBytes(min), sliderPositionToBytes(max)] }
);

const toSingleFilter = (mode: FilterMode, position: number): ColumnFilterState => (
  { mode, value: sliderPositionToBytes(position) }
);

export const BytesFilter: FilterComponent = ({ kind, mode, onChange }) => {
  const isRange = rangeModes.has(mode);
  const [range, setRange] = useState<[number, number]>([sliderMin, sliderMax]);
  const [single, setSingle] = useState(sliderMin);

  const selectMode = (selected: FilterMode) => onChange(rangeModes.has(selected)
    ? toRangeFilter(selected, range)
    : toSingleFilter(selected, single));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterModeMenu kind={kind} mode={mode} onSelect={selectMode} />
        {isRange
          ? (
            <Slider
              {...sliderProps}
              value={range}
              onChange={(_, value) => setRange(value as [number, number])}
              onChangeCommitted={(_, value) => onChange(toRangeFilter(mode, value as [number, number]))}
            />
          )
          : (
            <Slider
              {...sliderProps}
              value={single}
              onChange={(_, value) => setSingle(value as number)}
              onChangeCommitted={(_, value) => onChange(toSingleFilter(mode, value as number))}
            />
          )}
      </Box>
      <FormHelperText>{filterModeHelperText(mode)}</FormHelperText>
    </Box>
  );
};
