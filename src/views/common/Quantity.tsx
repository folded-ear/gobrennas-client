import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";

function toVulgarFraction(quantity: number): Maybe<string> {
    if (quantity === 0.125) return "⅛";
    else if (quantity === 0.25) return "¼";
    else if (quantity >= 0.33 && quantity < 0.34) return "⅓";
    else if (quantity === 0.375) return "⅜";
    else if (quantity === 0.5) return "½";
    else if (quantity === 0.625) return "⅝";
    else if (quantity >= 0.66 && quantity < 0.67) return "⅔";
    else if (quantity === 0.75) return "¾";
    else if (quantity === 0.875) return "⅞";
}

const numberFormat = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 3,
});

function toNumericString(quantity: number): string {
    if (quantity < 0) {
        return "-" + toNumericString(Math.abs(quantity));
    }
    const whole = Math.floor(quantity);
    if (quantity !== whole) {
        const fraction = Math.abs(quantity - whole);
        const vulgar = toVulgarFraction(fraction);
        if (vulgar) {
            return whole === 0 ? vulgar : whole + vulgar;
        }
    }
    return numberFormat.format(quantity);
}

interface Props {
    quantity: number;
    units?: string | null; // for the moment, at least
    addSpace?: boolean;
}

const Quantity: React.FC<Props> = ({ quantity, units, addSpace }) => {
    if (quantity == null) return null;
    return units == null ? (
        <React.Fragment>
            {toNumericString(quantity)}
            {addSpace && " "}
        </React.Fragment>
    ) : (
        <React.Fragment>
            {toNumericString(quantity)} {units}
            {addSpace && " "}
        </React.Fragment>
    );
};

export default Quantity;
