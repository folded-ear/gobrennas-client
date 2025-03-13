import {
    IngredientLoadFragment,
    PantryItemLoadFragment,
    RecipeLoadFragment,
} from "@/__generated__/graphql";
import { PantryItem, Recipe } from "@/global/types/types";

export const toRestIngredient = (
    it: IngredientLoadFragment & (RecipeLoadFragment | PantryItemLoadFragment),
) => {
    if (it.__typename === "PantryItem") {
        return toRestPantryItem(it);
    } else if (it.__typename === "Recipe") {
        return toRestRecipe(it);
    } else {
        throw new TypeError(`Unknown '${it.__typename}' for REST conversion?!`);
    }
};

export const toRestRecipe = (
    r: IngredientLoadFragment & RecipeLoadFragment,
): Recipe => ({
    id: r.id,
    type: "Recipe",
    name: r.name,
    externalUrl: r.externalUrl,
    directions: r.directions,
    ingredients: r.ingredients.map((i) => ({
        raw: i.raw,
        quantity: i.quantity?.quantity,
        preparation: i.preparation,
        units: i.quantity?.units?.name,
        uomId: i.quantity?.units?.id,
        ingredient: i.ingredient?.name,
        ingredientId: i.ingredient?.id,
    })),
    labels: r.labels && r.labels.length ? r.labels : undefined,
    ownerId: r.owner.id,
    recipeYield: r.yield,
    calories: r.calories,
    totalTime: r.totalTime,
    photo: r.photo?.url,
    photoFocus: r.photo?.focus,
});

export const toRestPantryItem = (
    pi: IngredientLoadFragment & PantryItemLoadFragment,
): PantryItem => ({
    id: pi.id,
    type: "PantryItem",
    name: pi.name,
    storeOrder: pi.storeOrder,
});
