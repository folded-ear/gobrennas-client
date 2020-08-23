import {
    FormControl,
    Input,
    InputAdornment,
    InputLabel,
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

const SearchFilter = ({term, onFilter, onChange}) => {
    return(<FormControl>
        <InputLabel htmlFor="input-with-icon-adornment">Filter Recipes By Keyword</InputLabel>
        <Input
            id="input-with-icon-adornment"
            onChange={onChange}
            onKeyDown={onFilter}
            value={term}
            startAdornment={
                <InputAdornment position="start">
                    <Search />
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
