import {
    Button,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputBase,
    Switch,
    Toolbar
} from "@mui/material";
import {
    Clear as ClearIcon,
    Search as SearchIcon
} from "@mui/icons-material";
import { LibrarySearchScope } from "__generated__/graphql";
import React from "react";
import { SearchRecipesContainer } from "features/RecipeLibrary/components/SearchRecipes.elements";

type SearchRecipesProps = {
    isSearchFloating: boolean,
    isMobile: boolean,
    unsavedFilter: any,
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSearch: (e: any) => void
    onClear: (e: any) => void,
    scope: any,
    toggleScope: any,
}

export const SearchRecipes: React.FC<SearchRecipesProps> = (
    {
        isSearchFloating,
        unsavedFilter,
        onSearchChange,
        onSearch,
        onClear,
        isMobile,
        scope,
        toggleScope,
    }) => {
    return (
        <SearchRecipesContainer elevation={isSearchFloating ? 4 : 1} position="sticky">
            <Toolbar>
                <InputBase
                    value={unsavedFilter}
                    onChange={onSearchChange}
                    placeholder="Search Recipes"
                    style={{flexGrow: 2}}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            onSearch(e);
                        }
                    }}
                    endAdornment={
                        unsavedFilter
                            ? <InputAdornment position="end">
                                <IconButton
                                    onClick={e => onClear(e)}
                                >
                                    <ClearIcon/>
                                </IconButton>
                            </InputAdornment>
                            : undefined
                    }
                />
                {isMobile || isSearchFloating
                    ? <IconButton color={"primary"} onClick={onSearch} size="large">
                        <SearchIcon/>
                    </IconButton>
                    : <Button
                        variant={"contained"}
                        onClick={onSearch}
                        color="primary"
                        type="submit"
                        aria-label="search"
                        startIcon={<SearchIcon/>}>
                        Search
                    </Button>}
                <Divider orientation="vertical"/>
                <FormControlLabel
                    control={
                        <Switch checked={scope === LibrarySearchScope.Everyone}
                                name="scope"
                                onChange={toggleScope}
                                color="primary"
                        />
                    }
                    label={"Everyone"}
                    labelPlacement={"start"}
                />
            </Toolbar>
        </SearchRecipesContainer>
    );
};