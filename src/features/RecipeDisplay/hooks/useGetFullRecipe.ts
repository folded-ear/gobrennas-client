import {
    ApolloError,
    useQuery
} from "@apollo/client";
import { getFullRecipeQuery } from "../data/queries";
import {
    FullRecipe,
    Recipe
} from "features/RecipeDisplay/types";

type UseQueryResult<T> = {
    loading: boolean,
    error?: ApolloError | boolean,
    data: T | null
}

export const useGetFullRecipe = (id: string) : UseQueryResult<FullRecipe> => {
    const { loading, error, data } = useQuery(
        getFullRecipeQuery,
        { variables: { id: id } },
    );

    const result = data?.library?.getRecipeById || null

    console.log(result)

    if(!result) {
        return {
            loading: false,
            error: true,
            data: null,
        }
    }

    const recipe: Recipe = {
        calories: result.calories,
        directions: result.directions || "",
        externalUrl: result.externalUrl,
        id: parseInt(result.id, 10),
        ingredients: result.ingredients || [],
        labels: [],
        name: result.name || "",
        photo: result.photo?.url || null,
        photoFocus: result.photo?.focus || [],
        totalTime: result.totalTime,
        yield: result.yield
    }

    const fullRecipe: FullRecipe = {
        mine: false,
        ownerId: result.owner.id,
        recipe,
        subrecipes: []
    }

    return {
        loading,
        error,
        data : fullRecipe,
    };
};
