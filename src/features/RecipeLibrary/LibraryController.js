import useFluxStore from "data/useFluxStore";
import RecipesList from "features/RecipeLibrary/components/RecipesList";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import { useProfileLO } from "providers/Profile";
import React from "react";

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
                recipesLO: LibraryStore.getRecipesLO(),
            };
        },
        [LibraryStore],
    );
    return <RecipesList
        me={me}
        {...libProps}
    />;
};