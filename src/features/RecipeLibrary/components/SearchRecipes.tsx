import {
    Button,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputBase,
    Switch,
    Toolbar,
} from "@mui/material";
import { ClearIcon, SearchIcon } from "@/views/common/icons";
import { LibrarySearchScope } from "@/__generated__/graphql";
import React from "react";
import { SearchRecipesContainer } from "@/features/RecipeLibrary/components/SearchRecipes.elements";

type SearchRecipesProps = {
    isSearchFloating: boolean;
    unsavedFilter: any;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: (e: any) => void;
    onClear: (e: any) => void;
    scope: any;
    toggleScope: any;
};

export const SearchRecipes = ({
    isSearchFloating,
    unsavedFilter,
    onSearchChange,
    onSearch,
    onClear,
    scope,
    toggleScope,
}: SearchRecipesProps) => {
    return (
        <SearchRecipesContainer
            elevation={isSearchFloating ? 4 : 1}
            position="sticky"
            color="neutral"
        >
            <Toolbar>
                <InputBase
                    value={unsavedFilter}
                    onChange={onSearchChange}
                    placeholder={
                        scope === LibrarySearchScope.EVERYONE
                            ? "Search Everyone's Recipes"
                            : "Search My Recipes"
                    }
                    style={{ flexGrow: 2 }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSearch(e);
                        }
                    }}
                    endAdornment={
                        unsavedFilter ? (
                            <InputAdornment position="end">
                                <IconButton onClick={(e) => onClear(e)}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined
                    }
                />
                {isSearchFloating ? (
                    <IconButton onClick={onSearch} size="large">
                        <SearchIcon color={"primary"} />
                    </IconButton>
                ) : (
                    <Button
                        variant={"contained"}
                        onClick={onSearch}
                        color="primary"
                        type="submit"
                        aria-label="search"
                        startIcon={<SearchIcon />}
                    >
                        Search
                    </Button>
                )}
                <Divider orientation="vertical" />
                <FormControlLabel
                    control={
                        <Switch
                            checked={scope === LibrarySearchScope.EVERYONE}
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
