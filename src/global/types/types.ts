import { CheckableActionType } from "util/typedAction";
import { BfsId, UserType } from "global/types/identity";
import { PlannedRecipeHistory, User } from "../../__generated__/graphql";

type IngredientType = "Recipe" | "PantryItem";

export interface Ingredient {
    id: BfsId;
    name: string;
    type?: IngredientType;
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
    /**
     * For synthetic recipes, this points back to the real/library recipe it
     * is based upon.
     */
    libraryRecipeId?: BfsId;
    ownerId?: BfsId;
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
    ingredient?: (Ingredient & { type: IngredientType }) | string | null;
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

export interface FromPlanItem {
    id: BfsId;
    completing?: boolean;
    deleting?: boolean;
    ancestorCompleting?: boolean;
    ancestorDeleting?: boolean;
}

export interface RecipeFromPlanItem extends Recipe, FromPlanItem {
    subtaskIds: number[];
    subrecipes: RecipeFromPlanItem[];
}

export type Subrecipe = Pick<
    Recipe,
    | "id"
    | "name"
    | "totalTime"
    | "ingredients"
    | "directions"
    | "libraryRecipeId"
> &
    Pick<
        FromPlanItem,
        | "id"
        | "completing"
        | "deleting"
        | "ancestorCompleting"
        | "ancestorDeleting"
    >;

export type RecipeHistory = Pick<
    PlannedRecipeHistory,
    "id" | "status" | "plannedAt" | "doneAt" | "notes"
> & {
    rating: number | null;
    owner: Pick<User, "name" | "email" | "imageUrl">;
};

export interface FullRecipe {
    recipe: Recipe;
    subrecipes: Subrecipe[];
    planHistory: RecipeHistory[];
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
