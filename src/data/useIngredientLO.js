import LibraryStore from "./LibraryStore";
import useStore from "./useStore";

const useIngredientLO = id =>
    useStore(
        LibraryStore,
        () => id
            ? LibraryStore.getIngredientById(id)
            : null,
        [id]
    );

export default useIngredientLO;
