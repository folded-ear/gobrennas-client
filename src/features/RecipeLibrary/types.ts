import { Recipe, User } from "@/__generated__/graphql";

export type RecipeCard = Pick<
    Recipe,
    | "id"
    | "calories"
    | "externalUrl"
    | "labels"
    | "name"
    | "photo"
    | "yield"
    | "totalTime"
> & {
    owner: Pick<User, "id" | "name" | "email" | "imageUrl">;
};
