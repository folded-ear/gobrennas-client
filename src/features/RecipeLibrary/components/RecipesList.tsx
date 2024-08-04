import { AddRecipeIcon } from "@/views/common/icons";
import { Container as Content, Grid, useScrollTrigger } from "@mui/material";
import RecipeCard, {
    RecipeType,
} from "@/features/RecipeLibrary/components/RecipeCard";
import { useIsMobile } from "@/providers/IsMobile";
import React, { useState } from "react";
import history from "@/util/history";
import FoodingerFab from "@/views/common/FoodingerFab";
import LazyInfinite from "@/views/common/LazyInfinite";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import { SearchRecipes } from "@/features/RecipeLibrary/components/SearchRecipes";
import useIsDevMode from "@/data/useIsDevMode";
import { CurrentPlanSidebar, drawerWidth } from "./CurrentPlanSidebar";

interface RecipesListProps {
    me: any; // todo
    filter?: string;
    scope?: LibrarySearchScope;
    isLoading: boolean;
    isComplete: boolean;
    recipes?: RecipeType[];

    onSearch(filter: string, scope: LibrarySearchScope): void;

    onNeedMore(): void;
}

export const RecipesList: React.FC<RecipesListProps> = ({
    me,
    scope = LibrarySearchScope.Mine,
    filter = "",
    recipes,
    isLoading,
    isComplete,
    onSearch,
    onNeedMore,
}) => {
    const isSearchFloating = useScrollTrigger({
        disableHysteresis: true,
        threshold: 15,
    });
    const isMobile = useIsMobile();
    const devMode = useIsDevMode();
    const [unsavedFilter, setUnsavedFilter] = useState(filter);

    function handleSearchChange(e) {
        setUnsavedFilter(e.target.value);
    }

    function handleClear(e) {
        e.preventDefault();
        e.stopPropagation();
        setUnsavedFilter("");
        onSearch("", scope);
    }

    function handleSearch(e) {
        e.preventDefault();
        e.stopPropagation();
        onSearch(unsavedFilter, scope);
    }

    function toggleScope(e) {
        const scope = e.target.checked
            ? LibrarySearchScope.Everyone
            : LibrarySearchScope.Mine;
        onSearch(filter, scope);
    }

    let body;
    if (!!recipes) {
        if (recipes.length > 0) {
            body = (
                <LazyInfinite
                    loading={isLoading}
                    complete={isComplete}
                    onNeedMore={onNeedMore}
                >
                    <Grid container spacing={4} alignItems="stretch">
                        {recipes.map((recipe) => (
                            <Grid
                                item
                                md={4}
                                sm={6}
                                xs={12}
                                key={recipe.id}
                                sx={{ display: "flex" }}
                            >
                                <RecipeCard
                                    recipe={recipe}
                                    me={me}
                                    indicateMine={
                                        scope === LibrarySearchScope.Everyone
                                    }
                                    mine={recipe.owner.id === "" + me.id}
                                />
                            </Grid>
                        ))}
                        {isComplete && recipes.length > 5 && (
                            <Grid item xs={12}>
                                <MessagePaper
                                    primary={"That's it. Fin. The end."}
                                />
                            </Grid>
                        )}
                        {isLoading && (
                            <Grid item xs={12}>
                                <LoadingIndicator primary={"Searching..."} />
                            </Grid>
                        )}
                    </Grid>
                </LazyInfinite>
            );
        } else if (isLoading) {
            body = <LoadingIndicator />;
        } else {
            body = (
                <MessagePaper
                    primary={
                        filter
                            ? "Zero recipes matched your filter. 🙁"
                            : "You don't have any recipes yet!"
                    }
                />
            );
        }
    } else {
        body = <LoadingIndicator />;
    }
    body = (
        <>
            <SearchRecipes
                isSearchFloating={isSearchFloating}
                isMobile={isMobile}
                onClear={handleClear}
                unsavedFilter={unsavedFilter}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
                scope={scope}
                toggleScope={toggleScope}
            />
            {body}
        </>
    );

    let fabSx: any = undefined;
    if (!isMobile && devMode) {
        fabSx = {
            right: (theme) => `calc(${theme.spacing(2)} + ${drawerWidth}px)`,
        };
        body = <CurrentPlanSidebar>{body}</CurrentPlanSidebar>;
    }

    return (
        <Content disableGutters={!isMobile}>
            {body}
            <FoodingerFab onClick={() => history.push(`/add`)} sx={fabSx}>
                <AddRecipeIcon />
            </FoodingerFab>
        </Content>
    );
};
