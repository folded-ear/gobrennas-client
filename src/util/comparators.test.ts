import { zippedComparator } from "@/util/comparators";
import { describe, expect, it } from "vitest";

describe("comparators", () => {
    describe("zippedComparator", () => {
        it("should find pair-wise diff", () => {
            expect(
                zippedComparator(["a", "b", "d", "e"], ["a", "b", "c", "z"]),
            ).toBeGreaterThan(0);
            expect(
                zippedComparator(["a", "b", "b", "e"], ["a", "b", "c", "z"]),
            ).toBeLessThan(0);
        });
        it("should find shorter arg", () => {
            expect(
                zippedComparator(["a", "b", "d", "e"], ["a", "b"]),
            ).toBeGreaterThan(0);
            expect(zippedComparator(["a", "b"], ["a", "b", "c"])).toBeLessThan(
                0,
            );
        });
        it("handle pure numbers", () => {
            expect(zippedComparator([1, 2], [1, 3])).toBeLessThan(0);
            expect(zippedComparator([1, 2], [1, 10])).toBeLessThan(0);
            expect(zippedComparator([1, 3], [1, 2])).toBeGreaterThan(0);
            expect(zippedComparator([1, 10], [1, 2])).toBeGreaterThan(0);
        });
        it("handle mixed numbers", () => {
            expect(zippedComparator(["1", 2], ["1", 3])).toBeLessThan(0);
            expect(zippedComparator(["1", 2], ["1", 10])).toBeLessThan(0);
            expect(zippedComparator(["1", 3], ["1", 2])).toBeGreaterThan(0);
            expect(zippedComparator(["1", 10], ["1", 2])).toBeGreaterThan(0);
        });
        it("handle numeric strings", () => {
            expect(zippedComparator(["1", "2"], ["1", "3"])).toBeLessThan(0);
            expect(zippedComparator(["1", "2"], ["1", "10"])).toBeLessThan(0);
            expect(zippedComparator(["1", "3"], ["1", "2"])).toBeGreaterThan(0);
            expect(zippedComparator(["1", "10"], ["1", "2"])).toBeGreaterThan(
                0,
            );
        });
    });
});
