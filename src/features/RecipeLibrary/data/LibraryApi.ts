import promiseFlux from "@/util/promiseFlux";
import { client } from "@/providers/ApolloClient";
import { ORDER_FOR_STORE } from "@/features/RecipeLibrary/data/mutations";
import { BfsId, BfsStringId, ensureString } from "@/global/types/identity";
import { BULK_INGREDIENTS } from "@/features/RecipeLibrary/data/queries";
import { toRestIngredient } from "@/features/RecipeLibrary/data/conversion_helpers";
import { ActionType, FluxAction } from "@/data/dispatcher";

const LibraryApi = {
    getIngredientInBulk: (ids: BfsStringId[]) =>
        promiseFlux(
            client.query({
                query: BULK_INGREDIENTS,
                variables: {
                    ids,
                },
            }),
            ({ data }): FluxAction => {
                return {
                    type: ActionType.LIBRARY__INGREDIENTS_LOADED,
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
