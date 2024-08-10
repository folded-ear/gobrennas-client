import { RecipesList } from "@/features/RecipeLibrary/components/RecipesList";
import { useProfile } from "@/providers/Profile";
import qs from "qs";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { LibrarySearchScope } from "@/__generated__/graphql";
import { useSearchLibrary } from "@/features/RecipeLibrary/hooks/useSearchLibrary";
import { ScalingProvider } from "@/util/ScalingContext";

export const LibraryController = () => {
    const me = useProfile();
    const history = useHistory();
    const params = history.location.search
        ? qs.parse(history.location.search.substring(1))
        : {};
    const [query, setQuery] = useState(params.q ? "" + params.q : "");
    const [scope, setScope] = useState(
        params.s === LibrarySearchScope.Everyone
            ? LibrarySearchScope.Everyone
            : LibrarySearchScope.Mine,
    );
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

    return (
        <ScalingProvider>
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
        </ScalingProvider>
    );
};
