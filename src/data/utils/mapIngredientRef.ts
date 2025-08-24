import { GetRecipeWithEverythingQuery } from "@/__generated__/graphql";
import objectWithType from "@/data/utils/objectWithType";
import { IngredientRef } from "@/global/types/types";

export default function mapIngredientRef<I>(
    item: GetRecipeWithEverythingQuery["library"]["getRecipeById"]["ingredients"][0],
) {
    return {
        raw: item.raw,
        preparation: item.preparation,
        quantity: item.quantity?.quantity,
        units: item.quantity?.units?.name || null,
        ingredient: objectWithType(item.ingredient),
        ingredientId: item.ingredient ? item.ingredient.id : null,
    } as IngredientRef<I>;
}
