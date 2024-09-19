import { AddRecipeIcon } from "@/views/common/icons";
import { Container as Content, Grid } from "@mui/material";
import React from "react";
import history from "@/util/history";
import FoodingerFab from "@/views/common/FoodingerFab";
import LazyInfinite from "@/views/common/LazyInfinite";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import { RecipeCard as TRecipeCard } from "@/features/RecipeLibrary/types";
import { RecipeGrid } from "@/views/recipeCollections/RecipeGrid";

interface RecipesListProps {
    me: any; // todo
    filter?: string;
    scope?: LibrarySearchScope;
    isLoading: boolean;
    isComplete: boolean;
    recipes?: TRecipeCard[];

    onSearch(filter: string, scope: LibrarySearchScope): void;

    onNeedMore(): void;
    isMobile: boolean;
}

export const RecipesList: React.FC<RecipesListProps> = ({
    me,
    scope = LibrarySearchScope.Mine,
    filter = "",
    recipes,
    isLoading,
    isComplete,
    onNeedMore,
    isMobile,
}) => {
    let body;
    if (recipes) {
        if (recipes.length > 0) {
            body = (
                <LazyInfinite
                    loading={isLoading}
                    complete={isComplete}
                    onNeedMore={onNeedMore}
                >
                    <RecipeGrid
                        recipes={recipes}
                        me={me}
                        showOwner={scope === LibrarySearchScope.Everyone}
                        cardType={"standard"}
                        spacing={4}
                    >
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
                    </RecipeGrid>
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
    }

    return (
        <Content disableGutters={!isMobile}>
            {body}
            <FoodingerFab onClick={() => history.push(`/add`)}>
                <AddRecipeIcon />
            </FoodingerFab>
        </Content>
    );
};
