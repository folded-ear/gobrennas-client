import { deserialize, serialize } from "@/data/utils/serialization";
import { DataType } from "@/__generated__/graphql";
import { describe, expect, it } from "vitest";

describe("serialization", () => {
    describe("serialize", () => {
        function test(t: DataType, value: unknown, expected: string | null) {
            it(`should serialize '${t}' '${value}' as '${expected}'`, () =>
                expect(serialize(t, value)).toBe(expected));
        }
        describe("null/undefined", () => {
            it("should serialize null as null", () =>
                expect(serialize(DataType.BOOLEAN, null)).toBe(null));
            it("should serialize undefined as null", () =>
                expect(serialize(DataType.JSON, undefined)).toBe(null));
        });
        describe("BOOLEAN", () => {
            const t = DataType.BOOLEAN;
            test(t, true, "true");
            test(t, false, "false");
            test(t, 1, "true");
            test(t, "", "false");
        });
        describe("FLOAT", () => {
            const t = DataType.FLOAT;
            test(t, 0, "0");
            test(t, -123, "-123");
            test(t, -123.654, "-123.654");
            test(t, 99999, "99999");
            test(t, 99999.999, "99999.999");
            test(t, NaN, null);
            test(t, { goat: "log" }, null);
        });
        describe("ID", () => {
            const t = DataType.ID;
            test(t, null, null);
            test(t, "", null);
            test(t, "\t\t  ", null);
            test(t, 123, "123");
            test(t, "cat", "cat");
        });
        describe("INT", () => {
            const t = DataType.INT;
            test(t, 0, "0");
            test(t, -123, "-123");
            test(t, -123.654, "-123");
            test(t, 99999, "99999");
            test(t, 99999.999, "99999");
            test(t, NaN, null);
            test(t, { goat: "log" }, null);
        });
        describe("STRING", () => {
            const t = DataType.STRING;
            test(t, "goat", "goat");
            test(t, "", "");
            test(t, " \t ", " \t ");
        });
        describe("JSON", () => {
            const t = DataType.JSON;
            test(t, null, null);
            test(t, 123, "123");
            test(t, 4.56, "4.56");
            test(t, "goat", '"goat"');
            test(t, [1, "two"], '[1,"two"]');
            test(t, { a: 1 }, '{"a":1}');
            test(t, { 2: "B" }, '{"2":"B"}');
        });
        describe("SET_OF_IDS", () => {
            const t = DataType.SET_OF_IDS;
            test(t, null, null);
            test(t, [], "[]");
            test(t, ["a", null, "b"], '["a","b"]');
            test(t, ["a", 1], '["a","1"]');
            test(t, new Date(), null);
        });
    });
    describe("deserialize", () => {
        function test(t: DataType, input: string, expected: unknown) {
            it(`should deserialize '${input}' as ${t} '${expected}'`, () =>
                expect(deserialize(t, input)).toStrictEqual(expected));
        }
        describe("null/undefined", () => {
            it("should deserialize null as null", () =>
                expect(deserialize(DataType.ID, null)).toBe(null));
            it("should deserialize undefined as null", () =>
                expect(deserialize(DataType.SET_OF_IDS, undefined)).toBe(null));
        });
        describe("BOOLEAN", () => {
            const t = DataType.BOOLEAN;
            test(t, "true", true);
            test(t, "false", false);
            test(t, "tRUe", true);
            test(t, "fALse", false);
            test(t, "yes", true);
            test(t, "nO", false);
            test(t, "1", true);
            test(t, "0", false);
            test(t, "yessir", false);
            test(t, "NOPE", false);
        });
        describe("FLOAT", () => {
            const t = DataType.FLOAT;
            test(t, "NOPE", null);
            test(t, "NaN", null);
            test(t, "1", 1);
            test(t, "  0123 ", 123);
            test(t, "123.654", 123.654);
            test(t, "seven", null);
            test(t, '["sassafras"]', null);
            test(t, "{ape:23}", null);
        });
        describe("ID", () => {
            const t = DataType.ID;
            test(t, "NOPE", "NOPE");
            test(t, "", null);
            test(t, "  ", null);
            test(t, "123", "123");
            test(t, '["sassafras"]', null);
            test(t, "{ape:23}", null);
            test(t, '"cat"', "cat");
            test(t, '""', null);
            test(t, "'cat'", "cat");
            test(t, "''", null);
        });
        describe("INT", () => {
            const t = DataType.INT;
            test(t, "NOPE", null);
            test(t, "NaN", null);
            test(t, "1", 1);
            test(t, "  0123 ", 123);
            test(t, "123.654", 123);
            test(t, "seven", null);
            test(t, '["sassafras"]', null);
            test(t, "{ape:23}", null);
            test(t, '{"ape":23}', null);
        });
        describe("STRING", () => {
            const t = DataType.STRING;
            test(t, "NOPE", "NOPE");
            test(t, "", "");
            test(t, " \t", " \t");
            test(t, '"cat"', "cat");
            test(t, '""', "");
            test(t, "'cat'", "cat");
            test(t, "''", "");
        });
        describe("JSON", () => {
            const t = DataType.JSON;
            test(t, "NOPE", null);
            test(t, "seven", null);
            test(t, '["sassafras"]', ["sassafras"]);
            test(t, "{ape:23}", null);
            test(t, '{"ape":23}', { ape: 23 });
        });
        describe("SET_OF_IDS", () => {
            const t = DataType.SET_OF_IDS;
            test(t, "NOPE", []);
            test(t, "[]", []);
            test(t, "[123]", ["123"]);
            test(t, '["cat"]', ["cat"]);
            test(t, '[""]', []);
            test(t, "[{}]", []);
            test(t, '["sal", "jon"]', ["sal", "jon"]);
        });
    });
});
