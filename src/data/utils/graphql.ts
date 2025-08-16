import { IngredientInfo, IngredientRefInfo } from "@/__generated__/graphql";
import { DraftRecipe, IngredientRef } from "@/global/types/types";
import ClientId from "@/util/ClientId";
import { toMilliseconds } from "@/util/time";

const mapIngRef = (it: IngredientRef): IngredientRefInfo => {
    it = { ...it };
    delete it.id;
    return it as IngredientRefInfo;
};

/**
 * Converts a DraftRecipe to IngredientInfo for transmission
 * @return IngredientInfo
 * @param recipe
 */
export function recipeToIngredientInfo(recipe: DraftRecipe): IngredientInfo {
    return {
        type: "Recipe",
        id: ClientId.is(recipe.id) ? null : recipe.id,
        name: recipe.name || "",
        storeOrder: 1,
        externalUrl: recipe.externalUrl || "",
        directions: recipe.directions || "",
        ingredients: recipe.ingredients.map(mapIngRef),
        sections: recipe.sections.map((it) => {
            const s = {
                ...it,
                id: it.id == null || ClientId.is(it.id) ? null : it.id,
                ingredients: it.ingredients.map(mapIngRef),
                directions: it.directions ?? "",
                labels: it.labels || [],
            };
            delete s.sectionOf;
            return s;
        }),
        labels: recipe.labels || [],
        yield: recipe.recipeYield ? recipe.recipeYield : null,
        calories: recipe.calories ? recipe.calories : null,
        totalTime: recipe.totalTime ? toMilliseconds(recipe.totalTime) : null,
        photo: null,
        photoFocus: recipe.photoFocus ?? null,
    };
}
