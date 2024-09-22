import { User } from "@/__generated__/graphql";

export type BfsId = string | number;

export type UserType = Pick<
    User,
    "id" | "name" | "provider" | "email" | "imageUrl" | "roles"
>;
