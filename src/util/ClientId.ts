import { BfsId } from "@/global/types/identity";

const PREFIX =
    Date.now().toString(36) +
    Math.floor(Math.random() * 60466176 /* 36^5 */)
        .toString(36)
        .padStart(5, "0") +
    "_";

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
