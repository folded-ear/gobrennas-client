// This is "duplicated" as RawIngredientDissection.fromRecognizedItem
import { RecognizedRangeType } from "@/__generated__/graphql";
import { RecognitionRange, RecognitionResult } from "@/data/ItemApi";
import { Maybe } from "graphql/jsutils/Maybe";

function processRecognizedItem(recog: RecognitionResult) {
    const qr = recog.ranges.find(
        (r) => r.type === RecognizedRangeType.QUANTITY,
    );
    const ur = recog.ranges.find(
        (r) =>
            r.type === RecognizedRangeType.UNIT ||
            r.type === RecognizedRangeType.NEW_UNIT,
    );
    const nr = recog.ranges.find(
        (r) =>
            r.type === RecognizedRangeType.ITEM ||
            r.type === RecognizedRangeType.NEW_ITEM,
    );
    const textFromRange = (r: Maybe<RecognitionRange>): Maybe<string> =>
        r && recog.raw.substring(r.start, r.end);
    const stripMarkers = (s: Maybe<string>): Maybe<string> => {
        if (s == null) return s;
        if (s.length < 3) return s;
        const c = s.charAt(0).toLowerCase();
        const end = c === "“" ? "”" : c === "«" ? "»" : c;
        if (end !== s.charAt(s.length - 1)) return s;
        if (c >= "a" && c <= "z") return s;
        if (c >= "0" && c <= "9") return s;
        return s.substring(1, s.length - 1);
    };
    const q = textFromRange(qr);
    const qv = qr && qr.quantity;
    const u = textFromRange(ur);
    const uv = ur && ur.id;
    const n = textFromRange(nr);
    const nv = nr && nr.id;
    const p = [qr, ur, nr]
        .filter((it) => it != null)
        .sort((a, b) => b!.start - a!.start)
        .reduce(
            (p, r) => p.substring(0, r!.start) + p.substring(r!.end),
            recog.raw,
        )
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^\s*,/, "");
    return {
        raw: recog.raw,
        quantity: qv,
        quantity_raw: q,
        uomId: uv,
        units: stripMarkers(u),
        units_raw: u,
        ingredientId: nv,
        ingredient: stripMarkers(n),
        ingredient_raw: n,
        preparation: p,
    };
}

export default processRecognizedItem;
