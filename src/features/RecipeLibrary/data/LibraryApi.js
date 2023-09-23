import BaseAxios from "axios";
import { API_BASE_URL } from "constants/index";
import queryClient from "data/queryClient";
import LibraryActions from "features/RecipeLibrary/data/LibraryActions";
import promiseFlux, { soakUpUnauthorized } from "util/promiseFlux";

const recipeAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const pantryItemAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/pantryitem`,
});

export const PAGE_SIZE = 9; // multiple of three; around a window's worth.

const LibraryApi = {
    getIngredient(id) {
        promiseFlux(recipeAxios.get(`/or-ingredient/${id}`), (data) => ({
            type: LibraryActions.INGREDIENT_LOADED,
            id,
            data: data.data,
        }));
    },

    getIngredientInBulk(ids) {
        promiseFlux(recipeAxios.get(`/bulk-ingredients/${ids}`), (data) => ({
            type: LibraryActions.INGREDIENTS_LOADED,
            ids,
            data: data.data,
        }));
    },

    getPantryItemsUpdatedSince: (cutoff) =>
        promiseFlux(
            pantryItemAxios.get(`/all-since?cutoff=${cutoff}`),
            (r) => ({
                type: LibraryActions.INGREDIENTS_LOADED,
                ids: r.data.map((it) => it.id),
                data: r.data,
            }),
            soakUpUnauthorized,
        ),

    orderForStore(id, targetId, after) {
        return pantryItemAxios
            .post(`/order-for-store`, {
                id,
                targetId,
                after: !!after,
            })
            .finally(() => queryClient.invalidateQueries("pantry-items"));
    },
};

export default LibraryApi;
