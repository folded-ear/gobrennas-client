import { User } from "@/__generated__/graphql";

export type BfsId = string;

export interface Identified<ID = BfsId> {
    id: ID;
}

export type UserType = Pick<
    User,
    "id" | "name" | "provider" | "email" | "imageUrl" | "roles"
>;
