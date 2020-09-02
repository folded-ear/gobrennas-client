import {
    parseNumber,
    parseNumberWithRange,
} from "./numbers";

describe("parseNumber", () => {
    it("should parse decimals", () => {
        expect(parseNumber("1")).toBeCloseTo(1, 3);
        expect(parseNumber("1.0")).toBeCloseTo(1, 3);
        expect(parseNumber("0.1")).toBeCloseTo(0.1, 3);
        expect(parseNumber("0.01")).toBeCloseTo(0.01, 3);
        expect(parseNumber("0.01")).toBeCloseTo(0.01, 3);
        expect(parseNumber("1.23")).toBeCloseTo(1.23, 3);
    });

    it("should parse fractions", () => {
        expect(parseNumber("1/2")).toBeCloseTo(0.5, 3);
        expect(parseNumber("1/ 2")).toBeCloseTo(0.5, 3);
        expect(parseNumber("1 /2")).toBeCloseTo(0.5, 3);
        expect(parseNumber("1 / 2")).toBeCloseTo(0.5, 3);
        expect(parseNumber("3 / 2")).toBeCloseTo(1.5, 3);

        expect(parseNumber("1/3")).toBeCloseTo(0.333, 3);
        expect(parseNumber("2/3")).toBeCloseTo(0.667, 3);

        // U+2044 : FRACTION SLASH {solidus (in typography)}
        expect(parseNumber("1⁄2")).toBeCloseTo(0.5, 3);
    });

    it("should parse proper fractions", () => {
        expect(parseNumber("3&1/2")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3 & 1/2")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3 and 1/2")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3 1/2")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3 ½")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3½")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3&½")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3 & ½")).toBeCloseTo(3.5, 3);
        expect(parseNumber("3 and ½")).toBeCloseTo(3.5, 3);
    });

    it("should parse names", () => {
        expect(parseNumber("half")).toBeCloseTo(0.5, 3);
        expect(parseNumber("one half")).toBeCloseTo(0.5, 3);
        expect(parseNumber("two & one half")).toBeCloseTo(2.5, 3);
        expect(parseNumber("two and one half")).toBeCloseTo(2.5, 3);
    });

    it("should parse bad things", () => {
        expect(parseNumber(null)).toBeNull();
        expect(parseNumber("")).toBeNull();
        expect(parseNumber("    ")).toBeNull();
        expect(parseNumber("glergypants")).toBeNull();
        expect(parseNumber("1-3")).toBeNull();
        expect(parseNumber("1.2.3")).toBeNull();
        expect(parseNumber("1.2.3", true)).toBeCloseTo(1.2, 3);
    });

    it("should parse mixed things", () => {
        expect(parseNumber("three and 1/2")).toBeCloseTo(3.5, 3);
        expect(parseNumber("three & 1/2")).toBeCloseTo(3.5, 3);
        expect(parseNumber("one and 1 1/2 and ½ & 0.5")).toBeCloseTo(3.5, 3);
    });

});
describe("parseNumberWithRange", () => {
    it("should include coordinates", () => {
        const nwr = parseNumberWithRange("  1 and 2/3 cups fish");
        expect(nwr.number).toBeCloseTo(5.0 / 3.0, 3);
        expect(nwr.start).toBe(2);
        expect(nwr.end).toBe(11);
    });
});
