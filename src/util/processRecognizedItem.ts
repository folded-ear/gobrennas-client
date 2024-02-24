// This is "duplicated" as RawIngredientDissection.fromRecognizedItem
import { RecognitionRangeType, RecognitionResult } from "../data/ItemApi";

function processRecognizedItem(recog: RecognitionResult) {
    const qr = recog.ranges.find(
        (r) =>
            r.type === RecognitionRangeType.QUANTITY ||
            r.type === RecognitionRangeType.AMOUNT, // AMOUNT is deprecated
    );
    const ur = recog.ranges.find(
        (r) =>
            r.type === RecognitionRangeType.UNIT ||
            r.type === RecognitionRangeType.NEW_UNIT,
    );
    const nr = recog.ranges.find(
        (r) =>
            r.type === RecognitionRangeType.ITEM ||
            r.type === RecognitionRangeType.NEW_ITEM,
    );
    const textFromRange = (r) => r && recog.raw.substring(r.start, r.end);
    const stripMarkers = (s) => {
        if (s == null) return s;
        if (s.length < 3) return s;
        const c = s.charAt(0).toLowerCase();
        if (c !== s.charAt(s.length - 1)) return s;
        if (c >= "a" && c <= "z") return s;
        if (c >= "0" && c <= "9") return s;
        return s.substring(1, s.length - 1);
    };
    const q = textFromRange(qr);
    const qv = qr && (qr.quantity || qr.value); // value is deprecated
    const u = textFromRange(ur);
    const uv = ur && (ur.id || ur.value); // value is deprecated
    const n = textFromRange(nr);
    const nv = nr && (nr.id || nr.value); // value is deprecated
    const p = [qr, ur, nr]
        .filter((it) => it != null)
        .sort(
            (a, b) =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                b!.start - a!.start,
        )
        .reduce(
            (p, r) =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                p.substring(0, r!.start) + p.substring(r!.end),
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
