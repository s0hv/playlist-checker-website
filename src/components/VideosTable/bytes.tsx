import { useState } from 'react';
import {
  type SliderProps,
  Box,
  FormHelperText,
  Slider,
  Typography,
} from '@mui/material';

import { filterModeHelperText, FilterModeMenu } from './filters/FilterModeMenu';
import {
  type ColumnFilterState,
  type FilterMode,
  type FilterValue,
  rangeModes,
} from './filters/modes';
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

export const bytesToSliderPosition = (bytes: number): number => {
  if (bytes <= 0) {
    return sliderMin;
  }

  const s = Math.log2(bytes / 10) - 10;
  const position = Math.round((s * 100) / 20);

  return Math.min(sliderMax, Math.max(sliderMin, position));
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

// The starting position does not filter anything, so choosing a mode before moving the slider changes no results
const toSingleFilter = (mode: FilterMode, position: number): ColumnFilterState => (
  position === sliderMin
    ? { mode }
    : { mode, value: sliderPositionToBytes(position) }
);

const initialRange = (value: FilterValue | undefined): [number, number] => {
  if (!Array.isArray(value)) return [sliderMin, sliderMax];

  const [min, max] = value as readonly number[];
  return [bytesToSliderPosition(min), bytesToSliderPosition(max)];
};

const initialSingle = (value: FilterValue | undefined): number => (
  typeof value === 'number' ? bytesToSliderPosition(value) : sliderMin
);

export const BytesFilter: FilterComponent = ({ kind, mode, value, onChange }) => {
  const isRange = rangeModes.has(mode);
  const [range, setRange] = useState<[number, number]>(() => initialRange(value));
  const [single, setSingle] = useState(() => initialSingle(value));

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
