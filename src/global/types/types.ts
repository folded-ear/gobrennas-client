import { CheckableActionType } from "util/typedAction";
import { BfsId, UserType } from "global/types/identity";

export interface Ingredient {
    id: BfsId;
    name: string;
    type?: "Recipe" | "PantryItem";
}

export interface Recipe extends Ingredient {
    calories: number | null;
    directions: string | null;
    externalUrl: string | null;
    ingredients: IngredientRef[];
    labels: string[];
    photo: string | null;
    photoFocus: number[] | null;
    totalTime: number | null;
    recipeYield: number | null;
}

export interface PantryItem extends Ingredient {
    storeOrder: number;
}

export interface IngredientRef {
    id?: BfsId;
    raw?: string;
    quantity?: number | null;
    preparation?: string | null;
    units?: string | null;
    uomId?: BfsId;
    ingredient?: Ingredient | string | null;
    ingredientId?: BfsId;

    /**
     * On the shopping list, napalm entries will only have name, not raw.
     */
    name?: string;
}

export interface Quantity {
    quantity: number;
    units?: string;
    uomId?: number;
}

export interface RecipeFromPlanItem extends Recipe {
    subtaskIds: number[];
    subrecipes: Recipe[];
}

export type Subrecipe = Pick<
    Recipe,
    "id" | "name" | "totalTime" | "ingredients" | "directions"
>;

export interface FullRecipe {
    recipe: Recipe;
    subrecipes: Subrecipe[];
    mine: boolean;
    owner: Omit<UserType, "provider" | "roles">;
}

export interface SharedRecipe extends Pick<Recipe, "id"> {
    secret: string;
    slug: string;
}

export interface DraftRecipe extends Omit<Recipe, "photo"> {
    photoUrl: string | null;
    photoUpload: File | null;
    sourceId: string | null;
}

export interface FluxAction {
    type: CheckableActionType;

    [k: string]: any;
}

export interface Page<E> {
    page: number;
    pageSize: number;
    first: boolean;
    last: boolean;
    content: E[];
}

export type FormValue = string | number | number[] | string[] | File | null;
