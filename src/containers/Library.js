import { Container } from "flux/utils";
import React from "react";
import LibraryStore from "../data/LibraryStore";
import RecipeStore from "../data/RecipeStore";
import UserStore from "../data/UserStore";
import { byNameComparator } from "../util/comparators";
import RecipesList from "../views/library/RecipesList";

export default Container.createFunctional(
    (props) => <RecipesList {...props} />,
    () => [
        UserStore,
        LibraryStore,
        RecipeStore,
    ],
    () => {
        const filter = LibraryStore.getState().filter;
        return {
            me: UserStore.getProfileLO().getValueEnforcing(),
            scope: LibraryStore.getState().scope,
            filter,
            libraryLO: LibraryStore.getLibraryLO()
                .map(rs => {
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
                            // label match
                            r.labels ? r.labels
                                .filter(l => l.indexOf("--") !== 0)
                                .filter(filterFunction).length : 0,
                            // directions match
                            filterFunction(r.directions),
                        ])
                        // eslint-disable-next-line no-unused-vars
                        .filter(([_, nameMatch, labelMatch, dirMatch]) =>
                            nameMatch || labelMatch || dirMatch)
                        .sort((a, b) => {
                            for (let fi = 1; fi <= 3; fi++) {
                                if (a[fi] > b[fi]) return -1;
                                if (a[fi] < b[fi]) return 1;
                            }
                            return byNameComparator(a[0], b[0]);
                        })
                        .map(([r]) => r);
                }),
            stagedRecipes: LibraryStore.getStagedRecipes(),
        };
    },
);
