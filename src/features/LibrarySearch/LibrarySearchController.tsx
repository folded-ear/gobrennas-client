import * as React from "react";
import { useHistory } from "react-router-dom";
import { SearchInput } from "@/features/LibrarySearch/components/SearchInput";
import { DisplayOptions, SearchScope } from "@/features/LibrarySearch/types";
import { useSearchLibrary } from "@/features/RecipeLibrary/hooks/useSearchLibrary";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { RecipeListDisplay } from "@/views/recipeCollections/RecipeListDisplay";
import { useProfile } from "@/providers/Profile";
import { ScalingProvider } from "@/util/ScalingContext";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { Grid } from "@mui/material";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import { RecipeGrid } from "@/views/recipeCollections/RecipeGrid";
import { SearchResults } from "@/views/recipeCollections/RecipeCollection.elements";

type LibrarySearchControllerProps = {
    display?: DisplayOptions;
};

export const LibrarySearchController: React.FC<
    LibrarySearchControllerProps
> = ({ display = "list" }) => {
    const me = useProfile();
    const history = useHistory();
    const searchParams = new URLSearchParams(history.location.search);
    const searchTerm = searchParams.get("q") ?? "";
    const scope = (searchParams.get("s") as SearchScope) ?? "MINE";

    const {
        data: recipes,
        loading,
        isComplete,
    } = useSearchLibrary({
        scope,
        query: searchTerm,
    });

    const onSearch = React.useCallback(
        (term: string, scope: SearchScope) => {
            history.push(
                `?q=${encodeURIComponent(term)}&s=${encodeURIComponent(scope)}`,
            );
        },
        [history],
    );

    const markAsMine = scope === LibrarySearchScope.Everyone;

    return (
        <>
            <SearchInput
                searchTerm={searchTerm}
                scope={scope}
                onSearch={onSearch}
            />
            <SearchResults>
                {loading && <LoadingIndicator />}
                <ScalingProvider>
                    {recipes && (
                        <>
                            {display === "list" ? (
                                <RecipeListDisplay
                                    recipes={recipes}
                                    me={me}
                                    markAsMine={markAsMine}
                                />
                            ) : (
                                <RecipeGrid
                                    recipes={recipes}
                                    me={me}
                                    markAsMine={markAsMine}
                                    cardType="standard"
                                />
                            )}
                        </>
                    )}
                </ScalingProvider>
            </SearchResults>
            {isComplete && recipes.length > 5 && (
                <Grid item xs={12}>
                    <MessagePaper primary={"That's it. Fin. The end."} />
                </Grid>
            )}
        </>
    );
};
