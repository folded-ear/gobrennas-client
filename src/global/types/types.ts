import { CheckableActionType } from "@/util/typedAction";
import { BfsId, BfsStringId } from "@/global/types/identity";
import { PlannedRecipeHistory, User } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

type IngredientType = "Recipe" | "PantryItem";

export interface Ingredient {
    id: BfsId;
    name: string;
    type?: IngredientType;
}

export interface Recipe extends Ingredient {
    calories?: Maybe<number>;
    directions?: Maybe<string>;
    externalUrl?: Maybe<string>;
    ingredients: IngredientRef[];
    labels?: string[];
    photo?: Maybe<string>;
    photoFocus?: Maybe<number[]>;
    totalTime?: Maybe<number>;
    recipeYield?: Maybe<number>;
    /**
     * For synthetic recipes, this points back to the real/library recipe it
     * is based upon.
     */
    libraryRecipeId?: BfsId;
    ownerId?: BfsId;
}

export interface IngredientRef {
    id?: BfsId;
    raw?: string;
    quantity?: number | null;
    preparation?: string | null;
    units?: string | null;
    uomId?: Maybe<BfsStringId>;
    ingredient?: Ingredient | string | null;
    ingredientId?: Maybe<BfsStringId>;

    /**
     * On the shopping list, napalm entries will only have name, not raw.
     */
    name?: string;
}

export interface Quantity {
    quantity: number;
    units?: string;
    uomId?: BfsId;
}

export interface FromPlanItem {
    id: BfsId;
    completing?: boolean;
    deleting?: boolean;
    ancestorCompleting?: boolean;
    ancestorDeleting?: boolean;
}

export interface RecipeFromPlanItem extends Recipe, FromPlanItem {
    subtaskIds?: BfsId[];
    subrecipes?: RecipeFromPlanItem[];
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

export interface ShareInfo {
    id: string;
    slug: string;
    secret: string;
}

export interface DraftRecipe extends Omit<Recipe, "photo"> {
    photoUrl: Maybe<string>;
    photoUpload: Maybe<File>;
    sourceId: Maybe<string>;
}

export interface FluxAction {
    type: CheckableActionType;

    [k: string]: any;
}

export type FormValue = string | number | number[] | string[] | File | null;
