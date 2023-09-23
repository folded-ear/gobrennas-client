import FluxReduceStore from "flux/lib/FluxReduceStore";
import { FluxAction } from "../global/types/types";
import LoadObject from "../../../util/LoadObject";
import LoadObjectMap from "../../../util/LoadObjectMap";
import { BfsId } from "../../../global/types/types";

interface State {
    byId: LoadObjectMap<BfsId, PantryItem | Recipe>;
}

declare namespace LibraryStore {}

declare class LibraryStore extends FluxReduceStore<State, FluxAction> {
    getIngredientById(id: number): LoadObject<PantryItem | Recipe>;

    getRecipeById(id: number): LoadObject<Recipe>;
}

const libraryStore: LibraryStore;
export = libraryStore;
