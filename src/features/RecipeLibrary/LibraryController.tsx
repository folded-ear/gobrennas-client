import useIsDevMode from "@/data/useIsDevMode";
import { RecipesList } from "@/features/RecipeLibrary/components/RecipesList";
import Recommendations from "@/features/RecipeLibrary/components/Recommendations";
import { SearchRecipes } from "@/features/RecipeLibrary/components/SearchRecipes";
import { useSearchLibrary } from "@/features/RecipeLibrary/hooks/useSearchLibrary";
import { useIsMobile } from "@/providers/IsMobile";
import { useProfile } from "@/providers/Profile";
import { ScalingProvider } from "@/util/ScalingContext";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { Container as Content, useScrollTrigger } from "@mui/material";
import qs from "qs";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

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
    const [query, setQuery] = useState(params.q ?? "");
    const [unsavedQuery, setUnsavedQuery] = useState(query);
    const [scope, setScope] = useState(
        params.s === LibrarySearchScope.EVERYONE
            ? LibrarySearchScope.EVERYONE
            : LibrarySearchScope.MINE,
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

    function handleSearchChange(e: React.ChangeEvent) {
        const { value } = e.target as HTMLInputElement;
        setUnsavedQuery(value);
    }

    function handleClear(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setUnsavedQuery("");
        handleSearch("", scope);
    }

    function doSearch(e: React.UIEvent) {
        e.preventDefault();
        e.stopPropagation();
        handleSearch(unsavedQuery, scope);
    }

    function toggleScope(e: React.ChangeEvent<HTMLInputElement>) {
        const scope = e.target.checked
            ? LibrarySearchScope.EVERYONE
            : LibrarySearchScope.MINE;
        handleSearch(query, scope);
    }

    function handleSearch(newQuery: string, newScope: LibrarySearchScope) {
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

    const showRecommendations = devMode && query === "";

    if (loading && (!recipes || recipes.length === 0)) {
        return <LoadingIndicator />;
    }

    return (
        <>
            <SearchRecipes
                isSearchFloating={isSearchFloating || isMobile}
                onClear={handleClear}
                unsavedFilter={unsavedQuery}
                onSearchChange={handleSearchChange}
                onSearch={doSearch}
                scope={scope}
                toggleScope={toggleScope}
            />
            <ScalingProvider>
                <Content disableGutters={!isMobile}>
                    {showRecommendations && <Recommendations />}
                    <RecipesList
                        me={me}
                        onSearch={handleSearch}
                        scope={scope}
                        filter={query}
                        recipes={recipes}
                        isLoading={loading}
                        isComplete={isComplete}
                        onNeedMore={handleNeedMore}
                    />
                </Content>
            </ScalingProvider>
        </>
    );
};
