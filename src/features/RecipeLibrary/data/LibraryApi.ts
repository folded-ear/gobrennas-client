import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import queryClient from "@/data/queryClient";
import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import promiseFlux, { soakUpUnauthorized } from "@/util/promiseFlux";
import { client } from "@/providers/ApolloClient";
import { GET_UPDATED_SINCE } from "./queries";

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

    getPantryItemsUpdatedSince: (cutoff) =>
        promiseFlux(
            client.query({
                query: GET_UPDATED_SINCE,
                variables: {
                    cutoff,
                },
                fetchPolicy: "network-only",
            }),
            ({ data }) => ({
                type: LibraryActions.INGREDIENTS_LOADED,
                data: data.pantry.updatedSince,
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
