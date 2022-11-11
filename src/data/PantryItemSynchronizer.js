import LibraryApi from "features/RecipeLibrary/data/LibraryApi";
import useSynchronizer from "util/useSynchronizer";

function PantryItemSynchronizer() {
    useSynchronizer(
        [ "pantry-items" ],
        ts =>
            LibraryApi.getPantryItemsUpdatedSince(ts),
    );
    return null;
}

export default PantryItemSynchronizer;
