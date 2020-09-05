const processRecognizedElement = recog => {
    const qr = recog.ranges.find(r =>
        r.type === "AMOUNT");
    const ur = recog.ranges.find(r =>
        r.type === "UNIT" || r.type === "NEW_UNIT");
    const nr = recog.ranges.find(r =>
        r.type === "ITEM" || r.type === "NEW_ITEM");
    const textFromRange = r =>
        r && recog.raw.substring(r.start, r.end);
    const stripMarkers = s => {
        if (s == null) return s;
        if (s.length < 3) return s;
        const c = s.charAt(0).toLowerCase();
        if (c !== s.charAt(s.length - 1)) return s;
        if (c >= "a" && c <= "z") return s;
        if (c >= "0" && c <= "9") return s;
        return s.substring(1, s.length - 1);
    };
    const q = textFromRange(qr);
    const qv = qr && qr.value;
    const u = textFromRange(ur);
    const uv = ur && ur.value;
    const n = textFromRange(nr);
    const nv = nr && nr.value;
    const p = [qr, ur, nr]
        .filter(it => it != null)
        .sort((a, b) => b.start - a.start)
        .reduce(
            (p, r) =>
                p.substr(0, r.start) + p.substr(r.end),
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
};

export default processRecognizedElement;
