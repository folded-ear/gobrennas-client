import { PlannedRecipeHistory, User } from "@/__generated__/graphql";
import { BfsId } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";

type IngredientType = "Recipe" | "PantryItem";

export interface IIngredient {
    id: BfsId;
    name: string;
    type?: IngredientType;
}

export interface PantryItem extends IIngredient {
    type?: "PantryItem";
    storeOrder: number;
}

export interface Section<I = Ingredient> {
    id?: BfsId;
    sectionOf?: Maybe<BfsId>;
    name: string;
    directions?: Maybe<string>;
    ingredients: IngredientRef<I>[];
    labels?: Maybe<string[]>;
}

export interface Recipe<I = Ingredient> extends IIngredient {
    type?: "Recipe";
    calories?: Maybe<number>;
    directions?: Maybe<string>;
    externalUrl?: Maybe<string>;
    ingredients: IngredientRef<I>[];
    sections: Section<I>[];
    labels?: Maybe<string[]>;
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

export type Ingredient = PantryItem | Recipe;

export interface IngredientRef<I = Ingredient> {
    id?: BfsId;
    raw?: string;
    quantity?: number | null;
    preparation?: string | null;
    units?: string | null;
    uomId?: Maybe<BfsId>;
    ingredient?: I | string | null;
    ingredientId?: Maybe<BfsId>;

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

export type Subrecipe<I = Ingredient> = Pick<
    Recipe<I>,
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

export interface DraftRecipe<I = Ingredient> extends Omit<Recipe<I>, "photo"> {
    photoUrl: Maybe<string>;
    photoUpload: Maybe<File>;
    sourceId: Maybe<string>;
}
