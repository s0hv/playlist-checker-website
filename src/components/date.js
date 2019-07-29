import TextField from "@material-ui/core/es/TextField/TextField";
import React from "react";
import DateRange from '@material-ui/icons/DateRange';


export const dateColumnFilters = ['at', 'before', 'after'];
export const dateFilterMessages = {
    at: 'During date',
    before: 'Before date',
    after: 'After date'
};
export const dateFilterIcons = {
    at: DateRange,
    before: DateRange,
    after: DateRange
};


export const DateEditor = ({ value, onValueChange }) => (
    <form noValidate>
        <TextField
            id="date"
            type="date"
            InputLabelProps={ {shrink: true,} }
            onChange={event => onValueChange(event.target.value)}
        />
    </form>
);
