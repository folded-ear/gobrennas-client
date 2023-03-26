import { toNumericString } from "../common/Quantity";

export function formatQuantity(q) {
    // is it compound quantity?
    if (q.hasOwnProperty("length") && typeof q !== "string") {
        return q.map(formatQuantity).join(", ");
    }
    // is it each/count?
    if (!q.units) {
        return toNumericString(q.quantity);
    }
    return `${toNumericString(q.quantity)} ${q.units}`;
}
