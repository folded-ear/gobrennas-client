import { DataType } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

export function serialize(type: DataType, value: unknown): string | null {
    if (value == null) return null;
    switch (type) {
        case DataType.BOOLEAN:
            return "" + !!value;
        case DataType.FLOAT:
            return typeof value !== "number" || isNaN(value)
                ? null
                : "" + value;
        case DataType.ID: {
            const s = ("" + value).trim();
            return s.length === 0 ? null : s;
        }
        case DataType.INT:
            return typeof value !== "number" || isNaN(value)
                ? null
                : "" + Math.trunc(value);
        case DataType.JSON:
            return JSON.stringify(value);
        case DataType.SET_OF_IDS:
            if (typeof value !== "object") return null;
            if (
                Symbol.iterator in value &&
                typeof value[Symbol.iterator] === "function"
            ) {
                return serialize(
                    DataType.JSON,
                    // @ts-expect-error iterable is shown by the conditional
                    [...value]
                        .map((it) => serialize(DataType.ID, it))
                        .filter((it) => it),
                );
            }
            return null;
        case DataType.STRING:
            return "" + value;
    }
}

export function deserialize(type: DataType, value: Maybe<string>): unknown {
    if (value == null) return null;
    switch (type) {
        case DataType.BOOLEAN: {
            value = value.toLowerCase();
            if (value === "true" || value === "t") return true;
            if (value === "false" || value === "f") return false;
            if (value === "yes" || value === "y") return true;
            if (value === "no" || value === "n") return false;
            const n = parseInt(value);
            if (!isNaN(n)) return n != 0;
            return false;
        }
        case DataType.FLOAT: {
            const n = parseFloat(value.trim());
            return isNaN(n) ? null : n;
        }
        case DataType.ID: {
            const s = deserialize(DataType.STRING, value);
            if (s == null) return null;
            value = (s as string).trim();
            return value.length === 0 ||
                value.charAt(0) === "{" ||
                value.charAt(0) === "["
                ? null
                : value;
        }
        case DataType.INT: {
            const n = parseInt(value.trim());
            return isNaN(n) ? null : n;
        }
        case DataType.JSON: {
            try {
                return JSON.parse(value);
            } catch (e) {
                return null;
            }
        }
        case DataType.SET_OF_IDS: {
            const json = deserialize(DataType.JSON, value);
            if (!(json instanceof Array)) return [];
            return json
                .map((it) => {
                    if (typeof it === "number") return "" + it;
                    if (typeof it === "string") return it.trim();
                    return null;
                })
                .filter((it) => it);
        }
        case DataType.STRING: {
            if (
                value.length >= 2 &&
                (value.charAt(0) === '"' || value.charAt(0) === "'") &&
                value.charAt(0) === value.charAt(value.length - 1)
            ) {
                value = value.substring(1, value.length - 1);
            }
            return value;
        }
    }
}
