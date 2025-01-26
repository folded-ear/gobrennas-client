import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import queryClient from "@/data/queryClient";
import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import promiseFlux from "@/util/promiseFlux";

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
            data: data.data,
        }));
    },

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
