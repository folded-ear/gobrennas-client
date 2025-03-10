import { DataType } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

export function serialize(type: DataType, value: null): null;
export function serialize(type: DataType, value: unknown): string;
export function serialize(type: DataType, value: unknown): string | null {
    if (value == null) return null;
    switch (type) {
        case DataType.BOOLEAN:
        case DataType.FLOAT:
        case DataType.ID:
        case DataType.INT:
        case DataType.STRING:
            return "" + value;
        case DataType.JSON:
        case DataType.SET_OF_IDS:
            return JSON.stringify(value);
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
        case DataType.FLOAT:
            return parseFloat(value);
        case DataType.ID:
        case DataType.STRING:
            return value;
        case DataType.INT:
            return parseInt(value);
        case DataType.JSON:
        case DataType.SET_OF_IDS:
            return JSON.parse(value);
    }
}
