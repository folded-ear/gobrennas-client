import { GetRecipeWithEverythingQuery } from "@/__generated__/graphql";
import mapIngredientRef from "@/data/utils/mapIngredientRef";
import { Section } from "@/global/types/types";

export default function mapSection<I>(
    section: GetRecipeWithEverythingQuery["library"]["getRecipeById"]["sections"][0],
) {
    return {
        id: section.id,
        sectionOf: section.sectionOf,
        name: section.name,
        directions: section.directions,
        ingredients: section.ingredients.map(mapIngredientRef),
        labels: section.labels,
    } as Section<I>;
}
