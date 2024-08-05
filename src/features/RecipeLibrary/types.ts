import { Photo, User as UserType } from "@/__generated__/graphql";
import { BfsId } from "@/global/types/identity";

export interface RecipeCard {
    id: BfsId;
    name: string;
    owner: Partial<UserType>;
    calories?: number | null;
    externalUrl?: string | null;
    favorite: boolean;
    labels?: string[] | null;
    photo?: Photo | null;
    totalTime?: number | null;
    yield?: number | null;
}
