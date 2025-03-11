import { LibrarySearchScope } from "@/__generated__/graphql";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import { RecipeCard as TRecipeCard } from "@/features/RecipeLibrary/types";
import { UserType } from "@/global/types/identity";
import FoodingerFab from "@/views/common/FoodingerFab";
import { AddRecipeIcon } from "@/views/common/icons";
import LazyInfinite from "@/views/common/LazyInfinite";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { RecipeGrid } from "@/views/recipeCollections/RecipeGrid";
import { Grid } from "@mui/material";
import { useHistory } from "react-router-dom";

interface RecipesListProps {
    me: UserType;
    filter?: string;
    scope?: LibrarySearchScope;
    isLoading: boolean;
    isComplete: boolean;
    recipes?: TRecipeCard[];

    onSearch(filter: string, scope: LibrarySearchScope): void;

    onNeedMore(): void;
}

export const RecipesList = ({
    me,
    scope = LibrarySearchScope.MINE,
    filter = "",
    recipes,
    isLoading,
    isComplete,
    onNeedMore,
}: RecipesListProps) => {
    const history = useHistory();
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
                        showOwner={scope === LibrarySearchScope.EVERYONE}
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
        <>
            {body}
            <FoodingerFab onClick={() => history.push(`/add`)}>
                <AddRecipeIcon />
            </FoodingerFab>
        </>
    );
};
