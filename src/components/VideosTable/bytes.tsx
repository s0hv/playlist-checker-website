import { SliderProps, Typography } from '@mui/material';

import { type VideoTableColumnDef, CellComponent } from './types';


export const KILOBYTE = 1024;
export const GIGABYTE = KILOBYTE ** 3;

export const bytesToString = (value: number): string => {
  const k = value > 0 ? Math.floor((Math.log2(value) / 10)) : 0;
  const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b';

  return `${(value / Math.pow(1024, k)).toFixed(1)} ${rank}`;
};


export const defaultBytesSliderProps: SliderProps = {
  marks: false,
  max: 100,
  min: 0,
  step: 1,
  scale: (value: number) => {
    if (value === 0) {
      return 0;
    }

    const s = (20 * value) / 100;

    return Math.round(Math.pow(2, s + 10) * 10);
  },
  valueLabelFormat: bytesToString,
};


export const BytesCell: CellComponent<number | unknown> = ({ cell }) => {
  const value = cell.getValue();

  let bytes = null;
  if (typeof value === 'number') {
    bytes = bytesToString(value);
  }

  return <Typography>{bytes}</Typography>;
};

export const bytesColumnDef: Partial<VideoTableColumnDef> = {
  Cell: BytesCell,
  filterFn: 'betweenInclusive',
  filterVariant: 'range-slider',
  columnFilterModeOptions: [
    'greaterThan',
    'greaterThanOrEqualTo',
    'lessThan',
    'lessThanOrEqualTo',
    'between',
    'betweenInclusive',
  ],
  muiFilterSliderProps: defaultBytesSliderProps,
};
