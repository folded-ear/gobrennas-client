import { rand_chars } from "@/util/entropy";
import { describe, expect, it } from "vitest";

describe("entropy", () => {
    describe("rand_chars", () => {
        it("should return the right length", () => {
            expect(rand_chars(-100)).toHaveLength(0);
            expect(rand_chars(-1)).toHaveLength(0);
            for (let i = 0; i < 100; i++) {
                expect(rand_chars(i)).toHaveLength(i);
            }
        });
        it("[MAY BE FLAKY] should distribute uniformly-ish", () => {
            const alphabet = "1234567890";
            const s = rand_chars(200, alphabet);
            for (const c of alphabet) expect(s).toMatch(c);
        });
    });
    describe("rand_chars with radix", () => {
        it("should use numbers first", () => {
            expect(rand_chars(50, 10)).toMatch(/^[0-9]{50}$/);
        });
        it("should use lowercase letters after numbers", () => {
            expect(rand_chars(100, 16)).toMatch(/^[0-9a-f]{100}$/);
        });
        it("should use uppercase letters after lower", () => {
            expect(rand_chars(200, 40)).toMatch(/^[0-9a-zA-D]{200}$/);
        });
        it("should refuse too-large radix", () => {
            expect(() => rand_chars(1, 100)).toThrow("Max supported radix is");
        });
    });
    describe("rand_chars with alphabet", () => {
        it("should use passed alphabet", () => {
            expect(rand_chars(50, "qwerty")).toMatch(/^[qwerty]{50}$/);
        });
        it("should refuse too-large alphabet", () => {
            expect(rand_chars(1, "a".repeat(256))).toBe("a");
            expect(() => rand_chars(1, "a".repeat(257))).toThrow(
                "Max supported alphabet size is 256",
            );
        });
    });
    describe("rand_chars with garbage", () => {
        it("should use default alphabet and radix", () => {
            const garbage = { junk: "trash" } as unknown as string;
            expect(rand_chars(200, garbage)).toMatch(/^[0-9a-zA-Z_-]{200}$/);
        });
    });
});
