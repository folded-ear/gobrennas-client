import BaseAxios from "axios";
import qs from "qs";
import { API_BASE_URL } from "constants/index";
import promiseFlux from "util/promiseFlux";
import queryClient from "data/queryClient";
import LibraryActions from "features/RecipeLibrary/data/LibraryActions";

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

    getPantryItemsUpdatedSince: cutoff =>
        promiseFlux(
            pantryItemAxios.get(`/all-since?cutoff=${cutoff}`),
            r => ({
                type: LibraryActions.INGREDIENTS_LOADED,
                ids: r.data.map(it => it.id),
                data: r.data,
            }),
        ),

    orderForStore(id, targetId, after) {
        return pantryItemAxios.post(`/order-for-store`, {
            id,
            targetId,
            after: !!after,
        }).finally(() =>
            queryClient.invalidateQueries("pantry-items"));
    },

};

export default LibraryApi;
