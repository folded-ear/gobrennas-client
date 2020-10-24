import socket from "../util/socket";
import Dispatcher from "./dispatcher";

const LibraryActions = {
    LOAD_LIBRARY: "library/load-library",
    LIBRARY_LOADED: "library/library-loaded",
    LOAD_INGREDIENTS: "library/load-ingredients",
    INGREDIENT_LOADED: "library/ingredient-loaded",
    STAGE_RECIPE: "library/stage-recipe",
    UNSTAGE_RECIPE: "library/unstage-recipe",
    SET_SCOPE: "library/set-scope",
    UPDATE_FILTER: "library/update-filter",
    FILTER_LIBRARY: "library/filter-library",
};

/*
 * Keep pantry items hot. This is the wrong place to do it, but unsure where it
 * ought to be.
 */
socket.subscribe("/topic/pantry-items", ({body}) => {
    if (body.type === "update") {
        Dispatcher.dispatch({
            type: LibraryActions.INGREDIENT_LOADED,
            id: body.id,
            data: body.info,
            background: true,
        });
    } else {
        // eslint-disable-next-line no-console
        console.warn("Unrecognized message", body.type, body);
    }
});

export default LibraryActions;
