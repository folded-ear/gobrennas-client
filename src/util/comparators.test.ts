import { humanStringComparator, zippedComparator } from "@/util/comparators";
import { describe, expect, it } from "vitest";

describe("comparators", () => {
    describe("humanStringComparator", () => {
        it("should order empty first", () => {
            expect(humanStringComparator("", "a")).toBeLessThan(0);
            expect(humanStringComparator("", "1")).toBeLessThan(0);
        });
        it("should order numbers before letters", () => {
            expect(humanStringComparator("1", "a")).toBeLessThan(0);
            expect(humanStringComparator("a", "1")).toBeGreaterThan(0);
        });
        it("should treat numeric strings as numbers", () => {
            expect(humanStringComparator("1", "2")).toBeLessThan(0);
            expect(humanStringComparator("2", "2")).toEqual(0);
            // @ts-expect-error verifying stringification of numbers
            expect(humanStringComparator("1", 2)).toBeLessThan(0);
            // @ts-expect-error verifying stringification of numbers
            expect(humanStringComparator(1, "2")).toBeLessThan(0);
            // @ts-expect-error verifying stringification of numbers
            expect(humanStringComparator(1, 2)).toBeLessThan(0);
            expect(humanStringComparator("10", "2")).toBeGreaterThan(0);
            // @ts-expect-error verifying stringification of numbers
            expect(humanStringComparator("10", 2)).toBeGreaterThan(0);
            // @ts-expect-error verifying stringification of numbers
            expect(humanStringComparator(10, "2")).toBeGreaterThan(0);
            // @ts-expect-error verifying stringification of numbers
            expect(humanStringComparator(10, 2)).toBeGreaterThan(0);
        });
    });
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
    });
});
