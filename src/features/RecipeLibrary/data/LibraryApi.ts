import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import promiseFlux from "@/util/promiseFlux";
import { client } from "@/providers/ApolloClient";
import { ORDER_FOR_STORE } from "@/features/RecipeLibrary/data/mutations";
import { BfsId, ensureString } from "@/global/types/identity";
import { BULK_INGREDIENTS } from "@/features/RecipeLibrary/data/queries";
import { toRestIngredient } from "@/features/RecipeLibrary/data/conversion_helpers";

const LibraryApi = {
    getIngredientInBulk: (ids) =>
        promiseFlux(
            client.query({
                query: BULK_INGREDIENTS,
                variables: {
                    ids,
                },
            }),
            ({ data }) => {
                return {
                    type: LibraryActions.INGREDIENTS_LOADED,
                    data: data.library.bulkIngredients.map(toRestIngredient),
                };
            },
        ),

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
