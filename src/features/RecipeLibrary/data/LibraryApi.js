import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import queryClient from "@/data/queryClient";
import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import promiseFlux, { soakUpUnauthorized } from "@/util/promiseFlux";

const recipeAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const pantryItemAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/pantryitem`,
});

const LibraryApi = {
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
