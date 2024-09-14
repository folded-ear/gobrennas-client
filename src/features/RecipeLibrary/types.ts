import { Photo, User as UserType } from "@/__generated__/graphql";
import { Recipe } from "@/global/types/types";

export type RecipeCard = Omit<
    Recipe,
    "directions" | "ingredients" | "libraryRecipeId"
>;

export interface RecipeType {
    id: string;
    calories?: number | null;
    directions?: string;
    externalUrl?: string | null;
    favorite: boolean;
    labels?: string[] | null;
    name: string;
    owner: UserType;
    photo?: Photo | null;
    totalTime?: number | null;
    yield?: number | null;
}
