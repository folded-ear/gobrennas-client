import { BfsId } from "global/types/identity";

export const ensureInt = (id: BfsId): number =>
    typeof id === "string" ? parseInt(id) : id;
