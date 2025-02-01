import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import promiseFlux from "@/util/promiseFlux";
import { client } from "@/providers/ApolloClient";
import { ORDER_FOR_STORE } from "@/features/RecipeLibrary/data/mutations";
import { BfsId, ensureString } from "@/global/types/identity";

const recipeAxios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const LibraryApi = {
    getIngredientInBulk: (ids) =>
        promiseFlux(recipeAxios.get(`/bulk-ingredients/${ids}`), (data) => ({
            type: LibraryActions.INGREDIENTS_LOADED,
            data: data.data,
        })),

    orderForStore: (id: BfsId, targetId: BfsId, after?: boolean) =>
        client.mutate({
            mutation: ORDER_FOR_STORE,
            variables: {
                id: ensureString(id),
                targetId: ensureString(targetId),
                after,
            },
        }),
};

export default LibraryApi;
