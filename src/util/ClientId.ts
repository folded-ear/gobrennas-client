import { BfsId } from "@/global/types/identity";
import { rand_chars } from "@/util/entropy";

const PREFIX = Date.now().toString(36) + rand_chars(5) + "_";

let counter = 0;

const ClientId = {
    next(): BfsId {
        return PREFIX + (++counter).toString(36);
    },

    is(id: unknown) {
        return (
            typeof id === "string" &&
            id.length > PREFIX.length &&
            id.startsWith(PREFIX)
        );
    },
};

export default ClientId;
