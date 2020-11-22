import { Container } from "flux/utils";
import React from "react";
import LibraryStore from "../data/LibraryStore";
import RecipeStore from "../data/RecipeStore";
import UserStore from "../data/UserStore";
import { byNameComparator } from "../util/comparators";
import RecipesList from "../views/library/RecipesList";

export default Container.createFunctional(
    (props) => <RecipesList {...props}/>,
    () => [
        UserStore,
        LibraryStore,
        RecipeStore,
    ],
    () => ({
        me: UserStore.getProfileLO().getValueEnforcing(),
        scope: LibraryStore.getState().scope,
        filter: LibraryStore.getState().filter,
        libraryLO: LibraryStore.getLibraryLO()
            .map(rs => rs.sort(byNameComparator)),
        stagedRecipes: LibraryStore.getStagedRecipes(),
    })
);
