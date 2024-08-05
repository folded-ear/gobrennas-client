import { expect, describe, it } from "vitest";
import { formatDuration, formatTimer } from "./time";

describe("time utilities", () => {
    describe("formatDuration", () => {
        it("should do format things", () => {
            expect(formatDuration(10)).toBe("10 minutes");
            expect(formatDuration(1)).toBe("1 minute");
            expect(formatDuration(0.5)).toBe("1 minute");
            expect(formatDuration(1.5)).toBe("2 minutes");
            expect(formatDuration(59)).toBe("59 minutes");
            expect(formatDuration(60)).toBe("1 hour");
            expect(formatDuration(61)).toBe("1 hr 1 min");
            expect(formatDuration(90)).toBe("1 hr 30 min");
            expect(formatDuration(120)).toBe("2 hours");
            expect(formatDuration(125)).toBe("2 hrs 5 min");
            expect(formatDuration(115)).toBe("1 hr 55 min");
            expect(formatDuration(180)).toBe("3 hours");
            expect(formatDuration(190)).toBe("3 hrs 10 min");
        });
    });

    describe("formatTimer", () => {
        it("should do format things", () => {
            expect(formatTimer(1)).toBe("0:01");
            expect(formatTimer(9)).toBe("0:09");
            expect(formatTimer(10)).toBe("0:10");
            expect(formatTimer(59)).toBe("0:59");
            expect(formatTimer(60)).toBe("1:00");
            expect(formatTimer(61)).toBe("1:01");
            expect(formatTimer(75)).toBe("1:15");
            expect(formatTimer(123)).toBe("2:03");
            expect(formatTimer(600)).toBe("10:00");
            expect(formatTimer(3600)).toBe("1:00:00");
            expect(formatTimer(3601)).toBe("1:00:01");
            expect(formatTimer(3660)).toBe("1:01:00");
            expect(formatTimer(36123)).toBe("10:02:03");
        });

        it("should handle negatives", () => {
            expect(formatTimer(-1)).toBe("-0:01");
            expect(formatTimer(-10)).toBe("-0:10");
            expect(formatTimer(-60)).toBe("-1:00");
            expect(formatTimer(-3601)).toBe("-1:00:01");
        });

        it("should handle weirdos", () => {
            expect(formatTimer()).toBe("");
            expect(formatTimer(null)).toBe("");
            expect(formatTimer(NaN)).toBe("");
        });
    });
});
