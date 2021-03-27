import socket from "../util/socket";
import Dispatcher from "./dispatcher";

const LibraryActions = {
    SEARCH: "library/search",
    SEARCH_FARTHER: "library/search-farther",
    SEARCH_LOADED: "library/search-loaded",
    LOAD_INGREDIENTS: "library/load-ingredients",
    INGREDIENT_LOADED: "library/ingredient-loaded",
    INGREDIENTS_LOADED: "library/ingredients-loaded",
    SET_SCOPE: "library/set-scope",
    UPDATE_FILTER: "library/update-filter",
    CLEAR_FILTER: "library/clear-filter",
};

/*
 * Keep pantry items hot. This is the wrong place to do it, but unsure where it
 * ought to be.
 */
let token = Dispatcher.register(({type, oneOff}) => {
    if (type === LibraryActions.INGREDIENT_LOADED ||
        type === LibraryActions.INGREDIENTS_LOADED
    ) {
        if (oneOff) return;
        Dispatcher.unregister(token);
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
    }
});

export default LibraryActions;
