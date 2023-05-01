import {
    ApolloError,
    useQuery
} from "@apollo/client";
import { getFullRecipeQuery } from "../data/queries";
import {
    FullRecipe,
    Recipe,
    Subrecipe
} from "features/RecipeDisplay/types";
import * as React from "react";
import { IngredientRef } from "global/types/types";

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

    const ingredients: IngredientRef[] = React.useMemo(() => {
        if(!result || !result.ingredients) return []
        return result.ingredients.map(item => ({
                raw: item.raw,
                preparation: item.preparation,
                quantity: item.quantity?.quantity || null,
                units: item.quantity?.units?.name || null,
                ingredient: item.ingredient
            }))
    },[result]);

    const subrecipes: Subrecipe[] = React.useMemo(() => {
        if(!result || !result.subrecipes) return []
        return result.subrecipes.map(recipe => ({
            id: parseInt(recipe.id, 10),
            name: recipe.name,
            totalTime: recipe.totalTime,
            directions: recipe.directions,
            ingredients: recipe.ingredients.map(item => ({
                raw: item.raw,
                preparation: item.preparation,
                quantity: item.quantity?.quantity || null,
                units: item.quantity?.units?.name || null,
                ingredient: item.ingredient || null,
                ingredientId: 0,
                uomId: ""
            }))
        }))
    },[result])

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
        ingredients,
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
        subrecipes
    }

    return {
        loading,
        error,
        data: fullRecipe,
    };
};
