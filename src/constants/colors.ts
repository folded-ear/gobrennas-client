import {
    blue,
    blueGrey,
    indigo,
    lightGreen,
    lime,
    purple,
    red,
    teal,
} from "@mui/material/colors";
import { BfsId } from "global/types/identity";

export const planColors = [
    // ¡¡ Make sure this always has a size equal to a power of 2 !!
    red[500],
    purple[400],
    indigo[900],
    blue[300],
    teal[300],
    lightGreen[900],
    lime[500],
    blueGrey[500],
];

if (process.env.NODE_ENV === "development") {
    if (
        planColors.length !==
        Math.pow(2, Math.floor(Math.log2(planColors.length)))
    ) {
        // eslint-disable-next-line no-console
        console.error(
            "PlanColors has %s entries, which isn't a power of two!!",
            planColors.length,
        );
    }
}

export const colorHash = (id: BfsId) => {
    let n = 0;
    for (const codePoint of id.toString()) {
        n *= 31;
        n += codePoint.codePointAt(0) || 0;
    }
    const l = planColors.length;
    let h = 0;
    // This XORs all the bits of the number, instead of just the last few, which
    // depends on the modulus being a power of two for a fair distribution.
    while (n > 0) {
        h ^= n % l;
        n = Math.floor(n / l);
    }
    return planColors[h];
};
