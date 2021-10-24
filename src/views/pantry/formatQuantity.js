function toNumericString(quantity) {
    if (quantity < 0) {
        return "-" + toNumericString(Math.abs(quantity));
    }
    if (quantity > 1) {
        const int = Math.trunc(quantity);
        const dec = quantity - int;
        if (dec === 0) {
            return int.toString();
        } else {
            const decStr = toNumericString(dec);
            if (decStr.startsWith("0.")) {
                return `${int}${decStr.substr(1)}`;
            } else {
                return `${int} & ${decStr}`;
            }
        }
    }
    if (quantity === 0.25) {
        return "1/4";
    } else if (quantity > 0.33 && quantity < 0.34) {
        return "1/3";
    } else if (quantity === 0.5) {
        return "1/2";
    } else if (quantity > 0.66 && quantity < 0.67) {
        return "2/3";
    } else if (quantity === 0.75) return "3/4";
    const s = quantity.toString();
    const len = s.length;
    const precision = s.replace(/^[0.]+/, "").length;
    if (precision <= len - 3) {
        return s;
    }
    return s.substr(0, len - precision + 3);
}

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
