import React from "react";
import { useQuery } from "react-query";
import LibraryApi from "./LibraryApi";
import LibraryActions from "./LibraryActions";
import Dispatcher from "./dispatcher";

function PantryItemSynchronizer() {
    const [ ts, setTs ] = React.useState(Date.now());
    const {
        data,
    } = useQuery("pantry-items", () =>
        LibraryApi.getPantryItemsUpdatedSince(ts)
            .then(data => {
                setTs(Date.now());
                return data.data;
            }));
    React.useEffect(() => {
        if (!data) return;
        if (data.length === 0) return;
        Dispatcher.dispatch({
            type: LibraryActions.INGREDIENTS_LOADED,
            ids: data.map(it => it.id),
            data,
        });
    }, [ data ]);
    return null;
}

export default PantryItemSynchronizer;
