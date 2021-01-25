import LibraryStore from "./LibraryStore";
import useStore from "./useStore";

const useIngredientLO = id =>
    useStore(() => id
        ? LibraryStore.getIngredientById(id)
        : null, LibraryStore, [id]);

export default useIngredientLO;
