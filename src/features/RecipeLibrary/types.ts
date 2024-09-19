import { Recipe } from "@/global/types/types";
import { UserType } from "@/global/types/identity";

export type RecipeCard = Omit<
    Recipe,
    "directions" | "ingredients" | "libraryRecipeId" | "ownerId"
> & {
    owner: Pick<UserType, "id" | "name" | "email" | "imageUrl">;
};
