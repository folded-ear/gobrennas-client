import { User } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

export type BfsId = string | number;
export type BfsStringId = string;

export interface Identified<ID = BfsId> {
    id: ID;
}

export type UserType = Pick<
    User,
    "id" | "name" | "provider" | "email" | "imageUrl" | "roles"
>;

export function ensureString(id: BfsId): BfsStringId {
    if (typeof id === "string") return id;
    if (id < 0) {
        throw new TypeError(`Ids must be non-negative, but '${id}' isn't.`);
    }
    if (id > Number.MAX_SAFE_INTEGER) {
        throw new TypeError(
            `Ids must not be so large they lose precision to floating point representation, but '${id}' isn't.`,
        );
    }
    if (id != Math.floor(id)) {
        throw new TypeError(`Ids must be integers, but '${id}' isn't.`);
    }
    return id.toString();
}

export function bfsIdEq(a: Maybe<BfsId>, b: Maybe<BfsId>): boolean {
    // soak up null/undefined that get passed via any (e.g., from JS)
    if (a == null) return b == null;
    if (b == null) return false;
    // stringify and test!
    return ensureString(a) === ensureString(b);
}

export function includesBfsId(ids: BfsId[], id: Maybe<BfsId>): boolean {
    return indexOfBfsId(ids, id) >= 0;
}

export function indexOfBfsId(ids: BfsId[], id: Maybe<BfsId>): number {
    return ids.findIndex((el) => bfsIdEq(id, el));
}
