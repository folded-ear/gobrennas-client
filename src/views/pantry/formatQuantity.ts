import { toNumericString } from "../common/Quantity";
import { Quantity } from "../../global/types/types";

export function formatQuantity(q: Quantity | Quantity[]): string {
    // is it compound quantity (i.e., array)?
    if (q.hasOwnProperty("length")) {
        return (q as Quantity[]).map(formatQuantity).join(", ");
    } else {
        q = q as Quantity;
        // is it each/count?
        if (!q.units) {
            return toNumericString(q.quantity);
        }
        return `${toNumericString(q.quantity)} ${q.units}`;
    }
}
