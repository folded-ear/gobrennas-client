import LibraryApi from "features/RecipeLibrary/data/LibraryApi";
import LibraryActions from "features/RecipeLibrary/data/LibraryActions";
import Dispatcher from "./dispatcher";
import useSynchronizer from "../util/useSynchronizer";

function PantryItemSynchronizer() {
    useSynchronizer(
        [ "pantry-items" ],
        ts =>
            LibraryApi.getPantryItemsUpdatedSince(ts)
                .then(data => data.data)
                .then(data => {
                    if (!data) return;
                    if (data.length === 0) return;
                    Dispatcher.dispatch({
                        type: LibraryActions.INGREDIENTS_LOADED,
                        ids: data.map(it => it.id),
                        data,
                    });
                }),
    );
    return null;
}

export default PantryItemSynchronizer;
