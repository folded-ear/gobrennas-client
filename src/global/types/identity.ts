import { User } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

export type BfsId = string;

export interface Identified<ID = BfsId> {
    id: ID;
}

export type UserType = Pick<
    User,
    "id" | "name" | "provider" | "email" | "imageUrl" | "roles"
>;

// todo: remove
export function includesBfsId(ids: BfsId[], id: Maybe<BfsId>): boolean {
    return indexOfBfsId(ids, id) >= 0;
}

// todo: remove
export function indexOfBfsId(ids: BfsId[], id: Maybe<BfsId>): number {
    return ids.findIndex((el) => id === el);
}
