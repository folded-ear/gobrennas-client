import { Ingredient, IngredientRef } from "@/global/types/types";

export interface Recipe extends Ingredient {
    externalUrl: string;
    ingredients: IngredientRef[];
    labels: string[];
    directions: string;
    yield: number;
    totalTime: number;
    calories: number;
    photo: string;
    photoFocus: number[];
}
