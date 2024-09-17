import { RecipesList } from "@/features/RecipeLibrary/components/RecipesList";
import { useProfile } from "@/providers/Profile";
import qs from "qs";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { useSearchLibrary } from "@/features/RecipeLibrary/hooks/useSearchLibrary";
import { ScalingProvider } from "@/util/ScalingContext";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { SearchRecipes } from "@/features/RecipeLibrary/components/SearchRecipes";
import { useScrollTrigger } from "@mui/material";
import { useIsMobile } from "@/providers/IsMobile";
import { useRecommendedRecipes } from "@/features/RecipeLibrary/hooks/useRecommendedRecipes";
import { RecipeGrid } from "@/views/recipeCollections/RecipeGrid";
import { SectionHeadline } from "@/global/elements/typography.elements";
import useIsDevMode from "@/data/useIsDevMode";
import Button from "@mui/material/Button";

/**
 * TODO: Issue-218
 * Note that this Library now has duplicated "search" functionality
 * with the LibrarySearch. This needs to get sorted eventually,
 * by pulling in that Library Search and composing it into the
 * Library here.
 */
export const LibraryController = () => {
    const devMode = useIsDevMode();
    const isMobile = useIsMobile();
    const me = useProfile();
    const history = useHistory();
    const params = history.location.search
        ? qs.parse(history.location.search.substring(1))
        : {};
    const [query, setQuery] = useState(params.q ? "" + params.q : "");
    const [unsavedQuery, setUnsavedQuery] = useState(query);
    const [scope, setScope] = useState(
        params.s === LibrarySearchScope.Everyone
            ? LibrarySearchScope.Everyone
            : LibrarySearchScope.Mine,
    );

    const isSearchFloating = useScrollTrigger({
        disableHysteresis: true,
        threshold: 15,
    });

    const {
        data: recipes,
        loading,
        refetch,
        fetchMore,
        isComplete,
        endCursor,
    } = useSearchLibrary({
        scope,
        query,
    });

    const { data: recommended, fetchMore: fetchMoreRecommended } =
        useRecommendedRecipes(isMobile ? 3 : 9);

    function handleSearchChange(e) {
        setUnsavedQuery(e.target.value);
    }

    function handleClear(e) {
        e.preventDefault();
        e.stopPropagation();
        setUnsavedQuery("");
        handleSearch("", scope);
    }

    function doSearch(e) {
        e.preventDefault();
        e.stopPropagation();
        handleSearch(unsavedQuery, scope);
    }

    function toggleScope(e) {
        const scope = e.target.checked
            ? LibrarySearchScope.Everyone
            : LibrarySearchScope.Mine;
        handleSearch(query, scope);
    }

    function handleSearch(newQuery, newScope) {
        if (query === newQuery && scope === newScope) {
            refetch();
        } else {
            setQuery(newQuery);
            setScope(newScope);
            history.push(
                `?q=${encodeURIComponent(newQuery)}&s=${encodeURIComponent(
                    newScope,
                )}`,
            );
        }
    }

    function handleNeedMore() {
        return fetchMore({
            variables: {
                after: endCursor,
            },
        });
    }

    const markAsMine = scope === LibrarySearchScope.Everyone;

    const showRecommendations = devMode && query === "" && recommended;

    if (loading) {
        return <LoadingIndicator />;
    }

    return (
        <>
            <SearchRecipes
                isSearchFloating={isSearchFloating}
                isMobile={isMobile}
                onClear={handleClear}
                unsavedFilter={unsavedQuery}
                onSearchChange={handleSearchChange}
                onSearch={doSearch}
                scope={scope}
                toggleScope={toggleScope}
            />
            <ScalingProvider>
                {showRecommendations && (
                    <>
                        <SectionHeadline>Recommended</SectionHeadline>
                        <RecipeGrid
                            recipes={recommended.results}
                            me={me}
                            markAsMine={markAsMine}
                            cardType="nano"
                        />
                        {recommended?.pageInfo?.hasNextPage && (
                            <Button
                                variant="text"
                                onClick={() =>
                                    fetchMoreRecommended({
                                        variables: {
                                            after: recommended?.pageInfo
                                                ?.endCursor,
                                        },
                                    })
                                }
                            >
                                Show More
                            </Button>
                        )}
                        <SectionHeadline>All Recipes</SectionHeadline>
                    </>
                )}
                <RecipesList
                    me={me}
                    isMobile={isMobile}
                    onSearch={handleSearch}
                    scope={scope}
                    filter={query}
                    recipes={recipes}
                    isLoading={loading}
                    isComplete={isComplete}
                    onNeedMore={handleNeedMore}
                />
            </ScalingProvider>
        </>
    );
};
