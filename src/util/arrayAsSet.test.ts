import {
    addDistinct,
    intersection,
    removeAtIndex,
    removeDistinct,
    toggleDistinct,
} from "@/util/arrayAsSet";
import { describe, expect, it } from "vitest";

describe("arrayAsSet", () => {
    describe("removeAtIndex", () => {
        it("should balk on mixed types", () =>
            expect(() => removeAtIndex([1, "two"], 0)).toThrow());
        it("should ignore a null/undefined array", () =>
            expect(removeAtIndex(null as unknown as any[], 0)).toEqual(null));
        it("should ignore a negative index", () =>
            expect(removeAtIndex([0, 1, 2], -1)).toEqual([0, 1, 2]));
        it("should ignore a too-large index", () =>
            expect(removeAtIndex([0, 1, 2], 7)).toEqual([0, 1, 2]));
        it("should ignore a null/undefined index", () =>
            expect(
                removeAtIndex([0, 1, 2], undefined as unknown as number),
            ).toEqual([0, 1, 2]));
        it("should remove item at a valid index", () => {
            expect(removeAtIndex([0, 1, 2], 0)).toEqual([1, 2]);
            expect(removeAtIndex([0, 1, 2], 1)).toEqual([0, 2]);
            expect(removeAtIndex([0, 1, 2], 2)).toEqual([0, 1]);
        });
    });
    describe("removeDistinct", () => {
        it("should balk on mixed types", () => {
            expect(() => removeDistinct([1, "two"], 3)).toThrow();
            expect(() =>
                removeDistinct([1, 2], "three" as unknown as number),
            ).toThrow();
        });
        it("should ignore a null/undefined array", () =>
            expect(removeDistinct(null as unknown as any[], 0)).toEqual(null));
        it("should remove an element", () =>
            expect(removeDistinct(["zero", "one"], "one")).toEqual(["zero"]));
        it("should ignore an unknown element", () =>
            expect(removeDistinct([0, 1], 99999)).toEqual([0, 1]));
        it("should ignore an null element", () =>
            expect(removeDistinct([0, 1], null)).toEqual([0, 1]));
    });
    describe("addDistinct", () => {
        it("should balk on mixed types", () => {
            expect(() => addDistinct([1, "two"], 3)).toThrow();
            expect(() =>
                addDistinct([1, 2], "three" as unknown as number),
            ).toThrow();
        });
        it("should add a new element", () =>
            expect(addDistinct(["a"], "b")).toEqual(["a", "b"]));
        it("should not duplicate and existing element", () =>
            expect(addDistinct(["a", "b"], "b")).toEqual(["a", "b"]));
    });
    describe("toggleDistinct", () => {
        it("should balk on mixed types", () => {
            expect(() => toggleDistinct([1, "two"], 3)).toThrow();
            expect(() =>
                toggleDistinct([1, 2], "three" as unknown as number),
            ).toThrow();
        });
        it("should consider a null/undefined array as empty", () =>
            expect(toggleDistinct(null as unknown as any[], 0)).toEqual([0]));
        it("should remove an element", () =>
            expect(toggleDistinct(["zero", "one"], "one")).toEqual(["zero"]));
        it("should remove a null element", () =>
            expect(
                toggleDistinct(
                    ["zero", null as unknown as string],
                    null as unknown as string,
                ),
            ).toEqual(["zero"]));
        it("should add an unknown element", () =>
            expect(toggleDistinct([0, 1], 99999)).toEqual([0, 1, 99999]));
        it("should add an unknown null element", () =>
            expect(toggleDistinct([0, 1], null)).toEqual([0, 1, null]));
    });
    describe("intersection", () => {
        it("should balk on mixed types", () => {
            expect(() => intersection([1, "two"], [3, 4])).toThrow();
            expect(() => intersection([1, 2], [3, "four"])).toThrow();
        });
        it("should consider a null/undefined array as empty", () => {
            expect(intersection(null as unknown as any[], [3, 4])).toEqual([]);
            expect(intersection([1, 2], null as unknown as any[])).toEqual([]);
        });
        it("should find intersections", () => {
            expect(intersection([], [])).toEqual([]);
            expect(intersection([], [1])).toEqual([]);
            expect(intersection([1], [])).toEqual([]);
            expect(intersection([1, 2], [2, 3])).toEqual([2]);
        });
    });
});
