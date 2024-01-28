import { Photo, User as UserType } from "__generated__/graphql";

export interface RecipeCard {
    id: string;
    name: string;
    owner: UserType;
    calories?: number | null;
    externalUrl?: string | null;
    favorite: boolean;
    labels?: string[] | null;
    photo?: Photo | null;
    totalTime?: number | null;
    yield?: number | null;
}
