import { SearchScope } from "@/features/LibrarySearch/types";
import { ClearIcon, SearchIcon } from "@/views/common/icons";
import { IconButton, InputAdornment, Toolbar } from "@mui/material";
import InputBase from "@mui/material/Input";
import React, { useState } from "react";

type SearchInputProps = {
    searchTerm: string;
    scope: SearchScope;
    onSearch: (term: string, scope: SearchScope) => void;
};

export const SearchInput: React.FC<SearchInputProps> = ({
    searchTerm,
    onSearch,
    scope,
}) => {
    const [searchText, setSearchText] = useState<string>(searchTerm);

    const onClear = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setSearchText("");
            onSearch("", scope);
        },
        [onSearch, scope],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onSearch(searchText, scope);
    };

    const handleEnterPressed = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            onSearch(searchText, scope);
        }
    };

    return (
        <Toolbar>
            <InputBase
                placeholder="Search My Recipes"
                value={searchText}
                onChange={handleSearchChange}
                autoFocus
                fullWidth
                onKeyDown={handleEnterPressed}
                endAdornment={
                    searchTerm && (
                        <InputAdornment position="end">
                            <IconButton onClick={onClear}>
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }
            />
            <IconButton color="primary" onClick={handleSearch} size="large">
                <SearchIcon />
            </IconButton>
        </Toolbar>
    );
};
