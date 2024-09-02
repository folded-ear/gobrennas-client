import * as React from "react";
import { useHistory } from "react-router-dom";
import { SearchInput } from "@/features/LibrarySearch/components/SearchInput";
import { DisplayOptions, SearchScope } from "@/features/LibrarySearch/types";
import { useSearchLibrary } from "@/features/RecipeLibrary/hooks/useSearchLibrary";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { RecipeListDisplay } from "@/features/LibrarySearch/components/RecipeListDisplay";
import LazyInfinite from "@/views/common/LazyInfinite";
import { RecipeGridDisplay } from "@/features/LibrarySearch/components/RecipeGridDisplay";
import { useProfile } from "@/providers/Profile";
import { ScalingProvider } from "@/util/ScalingContext";
import { SearchResults } from "@/features/LibrarySearch/components/RecipeDisplay.elements";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { Grid } from "@mui/material";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";

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
        fetchMore,
        isComplete,
        endCursor,
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
                                <RecipeGridDisplay
                                    recipes={recipes}
                                    me={me}
                                    markAsMine={markAsMine}
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
