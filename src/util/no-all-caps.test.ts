import {
    noAllCaps,
    noAllCapsForProse,
    noAllCapsForTitle,
} from "@/util/no-all-caps";
import { describe, expect, it } from "vitest";

describe("no-all-caps", () => {
    describe("noAllCaps", () => {
        it.each([
            ["2 TBSP AP FLOUR", "2 Tbsp AP flour"],
            ["1 T OLIVE OIL", "1 T olive oil"],
            ["½ TSP KOSHER SALT", "½ tsp kosher salt"],
            ["KOSHER SALT", "kosher salt"],
            ["A PINCH OF MSG", "A pinch of MSG"],
            ["I LIKE A LOT", "I like a lot"],
            ["Add A pinch", "Add a pinch"],
            ["1 cup Parmesan", "1 cup Parmesan"],
            ["1 iPhone CASE", "1 iPhone case"],
            ["PARMIGIANO-REGGIANO", "parmigiano-reggiano"],
            ["BAKE AT 350°F", "bake at 350°F"],
            ["DON'T STIR", "don't stir"],
            ["2 TBSP BUTTER\n1 CUP SUGAR", "2 Tbsp butter\n1 cup sugar"],
        ])("should rewrite %j as %j", (input, expected) => {
            expect(noAllCaps(input)).toBe(expected);
        });

        it.each([
            ["NOTE Select large shallots", "note: Select large shallots"],
            ["STEP 2 Dice the sugar", "step 2: Dice the sugar"],
            ["STEP  2   Dice", "step  2:   Dice"],
            ["NOTE: Select large shallots", "note: Select large shallots"],
            ["STEP 2 DICE THE SUGAR", "step 2 dice the sugar"],
            ["CHEF'S NOTE Select it", "chef's note: Select it"],
            ["  NOTE Select it", "  note: Select it"],
            ["Stir\nNOTE Select it", "Stir\nnote: Select it"],
            ["NOTE\nSelect it", "note\nSelect it"],
            ["Stir the SAUCE Gently", "Stir the sauce Gently"],
            ["1 cup AP Flour", "1 cup AP Flour"],
            ["AP Flour, 1 cup", "AP Flour, 1 cup"],
            ["2 TBSP Butter", "2 Tbsp Butter"],
            ["TBSP Butter", "Tbsp Butter"],
            ["I Like It", "I Like It"],
        ])("should colon labels in %j as %j", (input, expected) => {
            expect(noAllCaps(input)).toBe(expected);
        });
    });

    describe("noAllCapsForTitle", () => {
        it.each([
            ["CHICKEN AND RICE WITH A TWIST", "Chicken and Rice with a Twist"],
            ["THE BEST PIE", "The Best Pie"],
            ["WHAT IT IS MADE OF", "What It Is Made Of"],
            ["A BBQ SAUCE", "A BBQ Sauce"],
            ["Grandma's APPLE PIE", "Grandma's Apple Pie"],
            ["PARMIGIANO-REGGIANO CRISPS", "Parmigiano-Reggiano Crisps"],
            ["STEP 2 Dice the sugar", "Step 2: Dice the sugar"],
            ["SMOKY BBQ Sauce", "Smoky BBQ Sauce"],
            ["Chicken With A Twist", "Chicken With a Twist"],
            ["BEST EVER Chocolate Cake", "Best Ever: Chocolate Cake"],
        ])("should rewrite %j as %j", (input, expected) => {
            expect(noAllCapsForTitle(input)).toBe(expected);
        });
    });

    describe("noAllCapsForProse", () => {
        it.each([
            [
                "HEAT OVEN TO 350°F. ADD A PINCH.",
                "Heat oven to 350°F. Add a pinch.",
            ],
            ["DON'T STIR", "Don't stir"],
            [
                "STIR WELL! COOK UNTIL DONE? SERVE.",
                "Stir well! Cook until done? Serve.",
            ],
            [
                "PREHEAT THE OVEN AND\nBUTTER A PAN.",
                "Preheat the oven and\nbutter a pan.",
            ],
            ["STIR.\n\nSERVE HOT", "Stir.\n\nServe hot"],
            ["MIX WELL\n\nSERVE HOT", "Mix well\n\nServe hot"],
            ["MIX WELL\n  \nSERVE HOT", "Mix well\n  \nServe hot"],
            ["Stir in the BUTTER and SUGAR.", "Stir in the butter and sugar."],
            ["Add 2 TBSP BUTTER", "Add 2 Tbsp butter"],
            ["TSP OF SALT", "tsp of salt"],
            [
                "NOTE Select large shallots if you can,",
                "Note: Select large shallots if you can,",
            ],
            ["STEP 2 Dice the sugar", "Step 2: Dice the sugar"],
        ])("should rewrite %j as %j", (input, expected) => {
            expect(noAllCapsForProse(input)).toBe(expected);
        });
    });
});
