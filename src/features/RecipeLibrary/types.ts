import { Recipe, User } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

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

export interface Photo {
    url: string;
    focus: Maybe<number[]>;
}
