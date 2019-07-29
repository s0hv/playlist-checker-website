import Checkbox from '@material-ui/core/Checkbox';
import {DataTypeProvider} from "@devexpress/dx-react-grid";
import React from "react";
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';

export const boolFilters = ['none', 'true', 'false'];
export const boolFilterMessages = {
    none: 'No filter',
    true: 'True',
    false: 'False'
};
export const boolFilterIcons = {
    true: Check,
    false: Close,
};

export const BoolFormatter = ({ value }) => (
     <Checkbox
        checked={Boolean(value)}
        disabled={true}
    />
);

export const BoolTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={BoolFormatter}
        {...props}
    />
);
