import { VideoTableColumnDef } from './types';

export const numberColumnDef: Partial<VideoTableColumnDef> = {
  filterFn: 'equals',
  columnFilterModeOptions: [
    'equals',
    'notEquals',
    'greaterThan',
    'greaterThanOrEqualTo',
    'lessThan',
    'lessThanOrEqualTo',
  ],
};
