import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import { useProfileLO } from "providers/Profile";
import { byNameComparator } from "util/comparators";
import RecipesList from "features/RecipeLibrary/components/RecipesList";
import useFluxStore from "data/useFluxStore";

const filterRecipes = (rs, filter) => {
    if (!filter.trim()) return rs.sort(byNameComparator);
    const parts = filter.trim()
        .split(" ")
        .map(p => p.trim().toLowerCase())
        .filter(p => p);
    const filterFunction = s => {
        if (!s) return 0;
        const lcs = s.toLowerCase();
        return parts.filter(p => lcs.indexOf(p) >= 0).length;
    };
    return rs
        .map(r => [
            // the recipe itself
            r,
            // name match
            filterFunction(r.name),
        ])
        .filter(([r, nameMatch]) =>
            nameMatch || filterFunction(r.directions) || (
                r.labels && r.labels
                    .filter(l => l.indexOf("--") !== 0)
                    .filter(filterFunction).length
            ))
        .sort(([aR, aNM], [bR, bNM]) => {
            if (aNM && !bNM) return -1;
            if (!aNM && bNM) return 1;
            return byNameComparator(aR, bR);
        })
        .map(([r]) => r);
};

export const LibraryController = () => {
    const me = useProfileLO().getValueEnforcing();
    const libProps = useFluxStore(
        () => {
            const state = LibraryStore.getState();
            const filter = state.filter || "";
            return {
                scope: state.scope,
                filter,
                isComplete: LibraryStore.isListingComplete(),
                recipesLO: LibraryStore.getRecipesLO()
                    .map(recipes => filterRecipes(recipes, filter)),
            };
        },
        [LibraryStore],
    );
    return <RecipesList
        me={me}
        {...libProps}
    />;
};