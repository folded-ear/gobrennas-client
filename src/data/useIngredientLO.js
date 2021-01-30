import LibraryStore from "./LibraryStore";
import useFluxStore from "./useFluxStore";

const useIngredientLO = id =>
    useFluxStore(() => id
        ? LibraryStore.getIngredientById(id)
        : null, [LibraryStore], [id]);

export default useIngredientLO;
