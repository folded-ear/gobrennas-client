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
export function ensureString(id: BfsId | number): BfsId {
    if (typeof id !== "string") throw new Error(typeof id + " BfsId: " + id);
    return id;
}

// todo: remove
export function bfsIdEq(a: Maybe<BfsId>, b: Maybe<BfsId>): boolean {
    // soak up null/undefined that get passed via any (e.g., from JS)
    if (a == null) return b == null;
    if (b == null) return false;
    // stringify and test!
    return ensureString(a) === ensureString(b);
}

// todo: remove
export function includesBfsId(ids: BfsId[], id: Maybe<BfsId>): boolean {
    return indexOfBfsId(ids, id) >= 0;
}

// todo: remove
export function indexOfBfsId(ids: BfsId[], id: Maybe<BfsId>): number {
    return ids.findIndex((el) => bfsIdEq(id, el));
}
