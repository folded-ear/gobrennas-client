import BaseAxios from "axios";
import qs from "qs";
import { API_BASE_URL } from "../constants";
import promiseFlux from "../util/promiseFlux";
import LibraryActions from "./LibraryActions";
import queryClient from "./queryClient";

const recipeAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const pantryItemAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/pantryitem`,
});

export const PAGE_SIZE = 9; // multiple of three; around a window's worth.

const LibraryApi = {

    searchLibrary: (scope, filter, page = 0) => {
        const params = {
            scope,
            filter: filter.trim(),
            page,
            pageSize: PAGE_SIZE,
        };
        promiseFlux(
            recipeAxios.get(`/?${qs.stringify(params)}`),
            data => ({
                type: LibraryActions.SEARCH_LOADED,
                data: data.data,
                scope,
                filter,
            }),
        );
    },

    getIngredient(id) {
        promiseFlux(
            recipeAxios.get(`/or-ingredient/${id}`),
            data => ({
                type: LibraryActions.INGREDIENT_LOADED,
                id,
                data: data.data,
            }),
        );
    },

    getIngredientInBulk(ids) {
        promiseFlux(
            recipeAxios.get(`/bulk-ingredients/${ids}`),
            data => ({
                type: LibraryActions.INGREDIENTS_LOADED,
                ids,
                data: data.data,
            }),
        );
    },

    getPantryItemsUpdatedSince(cutoff) {
        return pantryItemAxios.get(`/all-since?cutoff=${cutoff}`);
    },

    orderForStore(id, targetId, after) {
        return pantryItemAxios.post(`/order-for-store`, {
            id,
            targetId,
            after: !!after,
        }).then(queryClient.invalidateQueries("pantry-items"));
    },

};

export default LibraryApi;
