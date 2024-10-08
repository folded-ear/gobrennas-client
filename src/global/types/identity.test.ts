import { describe, expect, it } from "vitest";
import { bfsIdEq, ensureString } from "./identity";

describe("identity", () => {
    const tooBig = 9007199254740992;
    describe("ensureString", () => {
        it("should refuse negatives", () => {
            expect(() => ensureString(-123)).toThrow("negative");
            expect(ensureString("-123")).toBe("-123");
        });
        it("should refuse non-integers", () => {
            expect(() => ensureString(1.23)).toThrow("integer");
            expect(ensureString("1.23")).toBe("1.23");
        });
        it("should refuse imprecise (too-large) values", () => {
            expect(() => ensureString(tooBig)).toThrow("large");
            expect(ensureString("9007199254740992")).toBe("9007199254740992");
        });
    });
    describe("bfsIdEq", () => {
        it("should equate numbers", () => {
            expect(bfsIdEq(123, 123)).toBe(true);
            expect(bfsIdEq(123, 456)).toBe(false);
        });
        it("should equate strings", () => {
            expect(bfsIdEq("abc", "abc")).toBe(true);
            expect(bfsIdEq("abc", "def")).toBe(false);
            expect(bfsIdEq("abc", "ABC")).toBe(false);
            expect(
                bfsIdEq("123456789098765432123456", "123456789098765432123456"),
            ).toBe(true);
        });
        it("should coerce to string", () => {
            expect(bfsIdEq("123", 123)).toBe(true);
            expect(bfsIdEq(123, "123")).toBe(true);
            expect(bfsIdEq(123, "abc")).toBe(false);
            // the largest allowed
            expect(bfsIdEq(9007199254740991, "9007199254740991")).toBe(true);
        });
        it("should balk on negative numeric ids", () => {
            expect(() => bfsIdEq(-123, "-123")).toThrow();
            expect(() => bfsIdEq(-123, -123)).toThrow();
            expect(() => bfsIdEq("-123", -123)).toThrow();
            expect(bfsIdEq("-123", "-123")).toBe(true);
        });
        it("should balk on non-integer numeric ids", () => {
            expect(() => bfsIdEq("12.3", 12.3)).toThrow();
            expect(() => bfsIdEq(12.3, "12.3")).toThrow();
            expect(() => bfsIdEq(12.3, 12.3)).toThrow();
            expect(bfsIdEq("12.3", "12.3")).toBe(true);
        });
        it("should balk on imprecise (too-large) numeric ids", () => {
            expect(() => bfsIdEq(tooBig, "9007199254740992")).toThrow();
            expect(() => bfsIdEq("9007199254740992", tooBig)).toThrow();
            expect(() => bfsIdEq(tooBig, tooBig)).toThrow();
            expect(bfsIdEq("9007199254740992", "9007199254740992")).toBe(true);
        });
        it("should equate null", () => {
            expect(bfsIdEq(null, null)).toBe(true);
            expect(bfsIdEq(null, "abc")).toBe(false);
            expect(bfsIdEq(123, null)).toBe(false);
        });
        it("should equate undefined", () => {
            expect(bfsIdEq(undefined, undefined)).toBe(true);
            expect(bfsIdEq(undefined, "abc")).toBe(false);
            expect(bfsIdEq(123, undefined)).toBe(false);
        });
    });
});
