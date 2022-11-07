import {
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Clear,
    Search,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((theme) => ({
    margin: theme.spacing(1),
}));

const SearchFilter = ({term, onChange, onClear}) => {
    const classes = useStyles();
    return (<FormControl
        fullWidth
        className={classes.margin}
        variant="outlined">
        <InputLabel htmlFor="input-with-icon-adornment">Filter Recipes By Keyword</InputLabel>
        <OutlinedInput
            id="input-with-icon-adornment"
            autoComplete="off"
            onChange={e => onChange(e.target.value)}
            value={term}
            labelWidth={195}
            startAdornment={
                <InputAdornment position="start">
                    <Search/>
                </InputAdornment>
            }
            endAdornment={
                onClear && term && <InputAdornment position="end">
                    <IconButton
                        onClick={onClear}
                    >
                        <Clear />
                    </IconButton>
                </InputAdornment>
            }
        />
    </FormControl>);
};

SearchFilter.propTypes = {
    term: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func,
};

export default SearchFilter;
