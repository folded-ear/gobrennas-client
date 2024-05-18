import { BfsId } from "global/types/identity";

export const planColors = [
    // ¡¡ Make sure this always has a size equal to a power of 2 !!
    // generated at http://medialab.github.io/iwanthue/
    "#cb4771",
    "#caa29e",
    "#783b32",
    "#d14f32",
    "#c9954c",
    "#cbd152",
    "#56713c",
    "#6dce55",
    "#8dd4aa",
    "#77adc2",
    "#6a7dc8",
    "#3b3a41",
    "#7145ca",
    "#552b6b",
    "#c583bd",
    "#cc4ac0",
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
