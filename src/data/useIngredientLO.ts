import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import useFluxStore from "./useFluxStore";

function useIngredientLO(id: number) {
    return useFluxStore(
        () => id
            ? LibraryStore.getIngredientById(id)
            : null,
        [ LibraryStore ],
        [ id ],
    );
}

export default useIngredientLO;
