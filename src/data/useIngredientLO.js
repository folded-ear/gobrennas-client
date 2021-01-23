import React from "react";
import LibraryStore from "./LibraryStore";

const getFromStore = id => id
    ? LibraryStore.getIngredientById(id)
    : null;

const useIngredientLO = id => {
    const [lo, setLo] = React.useState(getFromStore(id));
    React.useEffect(() => {
        const sub = LibraryStore.addListener(() =>
            setLo(getFromStore(id)));
        return () => sub.remove();
    }, [id]);
    return lo;
};

export default useIngredientLO;
