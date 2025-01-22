import FluxReduceStore from "flux/lib/FluxReduceStore";
import { FluxAction, Ingredient } from "@/global/types/types";
import LoadObject from "@/util/LoadObject";
import LoadObjectMap from "@/util/LoadObjectMap";
import { BfsId, BfsStringId } from "@/global/types/identity";
import { RippedLO } from "@/util/ripLoadObject";

interface State {
    byId: LoadObjectMap<BfsId, Ingredient>;
}

declare namespace LibraryStore {}

declare class LibraryStore extends FluxReduceStore<State, FluxAction> {
    getIngredientById(id: BfsStringId): LoadObject<Ingredient>;
    getIngredientRloById(id: BfsStringId): RippedLO<Ingredient>;

    getRecipeRloById(id: BfsStringId): RippedLO<Recipe>;
}

const libraryStore: LibraryStore;
export = libraryStore;
