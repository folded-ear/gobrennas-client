import { BfsId } from "@/global/types/identity";

const planColors = [
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

if (import.meta.env.DEV) {
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

const tinyHash = (s) => {
    // based on https://stackoverflow.com/a/52171480
    let h = 9;
    for (let i = 0; i < s.length; )
        h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
    return h ^ (h >>> 9);
};

export const colorHash = (id: BfsId) => {
    const h = Math.abs(tinyHash(id.toString()));
    return planColors[h % planColors.length];
};
