import { useMutation } from "@apollo/client";
import { CREATE_NEW_RECIPE_MUTATION } from "data/graphql/mutations";

export const useCreateRecipe = () => {
    const [mutateFunction, { data, loading, error }] = useMutation(
        CREATE_NEW_RECIPE_MUTATION,
        {
            variables: {
                info: {
                    type: "Recipe",
                    name: "Test Recipe",
                    storeOrder: 1,
                    externalUrl: "abc.com",
                    directions: "Take some ingredients and make something",
                    ingredients: [],
                    labels: [],
                    yield: 12,
                    calories: 100,
                    totalTime: 45,
                    photoFocus: [],
                },
                photo: null,
                cookThis: false,
            },
        },
    );

    return {
        createRecipe: mutateFunction,
        error,
        loading,
    };
};
