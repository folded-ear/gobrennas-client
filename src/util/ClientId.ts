import { createChainableTypeChecker, PropTypeError } from "./typeHelpers";
import { BfsStringId } from "@/global/types/identity";

const PREFIX =
    Date.now().toString(36) +
    Math.floor(Math.random() * 60466176 /* 36^5 */)
        .toString(36)
        .padStart(5, "0") +
    "_";

let counter = 0;

const ClientId = {
    next(): BfsStringId {
        return PREFIX + (++counter).toString(36);
    },

    is(id) {
        return (
            typeof id === "string" &&
            id.length > PREFIX.length &&
            id.startsWith(PREFIX)
        );
    },

    propType: createChainableTypeChecker(
        (props: Record<string, unknown>, propName: string) => {
            if (ClientId.is(props[propName])) {
                return;
            }
            return new PropTypeError(`'${propName}' isn't a valid ClientId`);
        },
    ),
};

export default ClientId;
