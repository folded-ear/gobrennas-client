import {FormControl, InputAdornment, InputLabel, OutlinedInput,} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Search} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((theme) => ({
    margin: theme.spacing(1),
}));

const SearchFilter = ({term, onFilter, onChange}) => {
    const classes = useStyles();
    return (<FormControl
        fullWidth
        className={classes.margin}
        variant="outlined">
        <InputLabel htmlFor="input-with-icon-adornment">Filter Recipes By Keyword</InputLabel>
        <OutlinedInput
            id="input-with-icon-adornment"
            onChange={onChange}
            onKeyDown={onFilter}
            value={term}
            labelWidth={195}
            startAdornment={
                <InputAdornment position="start">
                    <Search/>
                </InputAdornment>
            }
        />
    </FormControl>);
};

SearchFilter.propTypes = {
    term: PropTypes.string,
    onFilter: PropTypes.func,
    onChange: PropTypes.func
};

export default SearchFilter;
