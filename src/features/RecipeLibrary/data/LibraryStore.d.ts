import FluxReduceStore from "flux/lib/FluxReduceStore";
import { FluxAction } from "../global/types/types";
import LoadObject from "../../../util/LoadObject";
import LoadObjectMap from "../../../util/LoadObjectMap";
import { BfsId } from "global/types/identity";
import { Ingredient } from "../../../global/types/types";
import { RippedLO } from "../../../util/ripLoadObject";

interface State {
    byId: LoadObjectMap<BfsId, Ingredient>;
}

declare namespace LibraryStore {}

declare class LibraryStore extends FluxReduceStore<State, FluxAction> {
    getIngredientById(id: number): LoadObject<Ingredient>;
    getIngredientRloById(id: number): RippedLO<Ingredient>;

    getRecipeById(id: number): LoadObject<Recipe>;
}

const libraryStore: LibraryStore;
export = libraryStore;
