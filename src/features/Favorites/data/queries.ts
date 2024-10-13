import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@/__generated__";
import { useMemo } from "react";
import { BfsId, bfsIdEq } from "@/global/types/identity";

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

export function useIsFavorite(id: BfsId): boolean {
    const { data } = useQuery(LIST_ALL_FAVORITES);
    return useMemo(() => {
        if (!data?.favorite?.all) return false;
        for (const f of data.favorite.all) {
            if (bfsIdEq(f.objectId, id)) return true;
        }
        return false;
    }, [id, data?.favorite?.all]);
}

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
        refetchQueries: [{ query: LIST_ALL_FAVORITES }],
    });
    return (id) => {
        execute({
            variables: {
                type,
                id,
            },
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
        refetchQueries: [{ query: LIST_ALL_FAVORITES }],
    });
    return (id) => {
        execute({
            variables: {
                type,
                id,
            },
        });
        return true;
    };
}
