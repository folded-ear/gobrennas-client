import {useMutation, useQuery} from "@apollo/client";
import {useCallback, useEffect, useState} from "react";
import {gql} from "../../../__generated__";

export type IdCallback = (number) => boolean;

const LIST_ALL_FAVORITES = gql(`
    query listAllFavorites {
        favorite {
            all {
                id
                objectType
                objectId
            }
        }
    }
`);

export function useIsFavorite(): IdCallback {
    const byId = useFavoritesById();
    return useCallback(id =>
            byId.has("" + id),
        [byId]);
}

const useFavoritesById = () => {
    const raw = useQuery(LIST_ALL_FAVORITES);
    const [result, setResult] = useState(new Map());
    useEffect(() => {
        const map = new Map();
        if (raw.data && raw.data.favorite) {
            raw.data.favorite.all.forEach(it =>
                map.set(it.objectId, it));
        }
        setResult(map);
    }, [raw, raw.data]);
    return result;
};

const MARK_FAVORITE = gql(`
    mutation markFavorite($type: String!, $id: ID!) {
        favorite {
            markFavorite(objectType: $type, objectId: $id) {
                id
                objectType
                objectId
            }
        }
    }
`);

export function useMarkFavorite(type: string): IdCallback {
    const [execute] = useMutation(MARK_FAVORITE, {
        refetchQueries: [
            {query: LIST_ALL_FAVORITES},
        ],
    });
    return id => {
        execute({
            variables: {
                type,
                id,
            }
        });
        return true;
    };
}

const REMOVE_FAVORITE = gql(`
    mutation removeFavorite($type: String!, $id: ID!) {
        favorite {
            removeFavorite(objectType: $type, objectId: $id)
        }
    }
`);

export function useRemoveFavorite(type: string): IdCallback {
    const [execute] = useMutation(REMOVE_FAVORITE, {
        refetchQueries: [
            {query: LIST_ALL_FAVORITES},
        ],
    });
    return id => {
        execute({
            variables: {
                type,
                id,
            }
        });
        return true;
    };
}
