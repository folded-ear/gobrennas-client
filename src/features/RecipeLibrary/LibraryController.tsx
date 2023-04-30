import { useQuery } from "@apollo/client";
import RecipesList from "features/RecipeLibrary/components/RecipesList";
import { useProfile } from "providers/Profile";
import qs from "qs";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { gql } from "__generated__";
import { LibrarySearchScope } from "__generated__/graphql";

const SEARCH_RECIPES = gql(`
    query lib(
        $query: String! = ""
        $scope: LibrarySearchScope! = MINE
        $first: NonNegativeInt! = 9
        $after: Cursor = null
    ) {
        library {
            recipes(first: $first, query: $query, scope: $scope, after: $after) {
                edges {
                    cursor
                    node {
                        id
                        owner {
                            id
                            imageUrl
                            name
                        }
                        photo {
                            url
                            focus
                        }
                        name
                        favorite
                        labels
                        externalUrl
                        calories
                        yield
                        totalTime
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    }
`);

export const LibraryController = () => {
    const me = useProfile();
    const history = useHistory();
    const params = history.location.search
        ? qs.parse(history.location.search.substring(1))
        : {};
    const [ query, setQuery ] = useState(params.q
        ? "" + params.q
        : "");
    const [ scope, setScope ] = useState(params.s === LibrarySearchScope.Everyone
        ? LibrarySearchScope.Everyone
        : LibrarySearchScope.Mine);
    const { data, loading, refetch, fetchMore } = useQuery(SEARCH_RECIPES, {
        variables: {
            query,
            scope,
        },
    });

    function handleSearch(newQuery, newScope) {
        if (query === newQuery && scope === newScope) {
            refetch();
        } else {
            setQuery(newQuery);
            setScope(newScope);
            history.push(`?q=${encodeURIComponent(newQuery)}&s=${encodeURIComponent(newScope)}`);
        }
    }

    function handleNeedMore() {
        return fetchMore({
            variables: {
                after: data?.library?.recipes.pageInfo.endCursor,
            },
        });
    }

    return <RecipesList
        me={me}
        onSearch={handleSearch}
        scope={scope}
        filter={query}
        recipes={data?.library?.recipes.edges.map(e => e.node)}
        isLoading={loading}
        isComplete={!data?.library?.recipes.pageInfo.hasNextPage}
        onNeedMore={handleNeedMore}
    />;
};
