import { formatDuration } from "./time";

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
