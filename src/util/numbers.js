import antlr4 from "antlr4";
import { NumberLexer } from "../com/brennaswitzer/cookbook/antlr/NumberLexer";
import { NumberParser } from "../com/brennaswitzer/cookbook/antlr/NumberParser";
import { NumberVisitor } from "../com/brennaswitzer/cookbook/antlr/NumberVisitor";

class NumVis extends NumberVisitor {

    visitStart(ctx) {
        return super.visitStart(ctx)
            .filter((n, i) => i % 2 === 0) // strip the ANDs
            .reduce((agg, it) => this._agg(agg, it));
    }

    visitAtom(ctx) {
        const result = super.visitAtom(ctx);
        return result && result[0]; // let a null (from an error) bubble
    }

    visitFraction(ctx) {
        if (ctx.vf) {
            return this.visitVulgarFraction(ctx.vf);
        }
        return this._agg(
            this.visitInteger(ctx.n),
            this.visitInteger(ctx.d),
            (a, b) => a / b);
    }

    visitNumber(ctx) {
        if (ctx.f) {
            return this._agg(this.visitInteger(ctx.i), this.visitFraction(ctx.f));
        }
        return super.visitNumber(ctx)[0];
    }

    visitDecimal(ctx) {
        return this._val(parseFloat(ctx.getText()), ctx);
    }

    visitInteger(ctx) {
        return this._val(parseInt(ctx.getText(), 10), ctx);
    }

    visitVulgarFraction(ctx) {
        return this._val(ctx.val, ctx);
    }

    visitName(ctx) {
        return this._val(ctx.val, ctx);
    }

    _agg(a, b, combiner= (a, b) => a + b) {
        if (a == null) return b;
        if (b == null) return a;
        return {
            number: combiner(a.number, b.number),
            start: Math.min(a.start, b.start),
            end: Math.max(a.end, b.end),
        };
    }

    _val(number, ctx) {
        return {
            number,
            start: ctx.start.start,
            end: ctx.stop.stop + 1,
        };
    }

}

export const parseNumberWithRange = str => {
    if (str == null) return null;
    if (str.trim().length === 0) return null;
    try {
        const chars = new antlr4.InputStream(str);
        const lexer = new NumberLexer(chars);
        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new NumberParser(tokens);
        const result = new NumVis().visitStart(parser.start());
        result.number = Math.round(result.number * 1000) / 1000.0;
        return result;
    } catch (e) {
        console.log(`Failed to parseNumber("${str}")`);
        return null;
    }
};

export const parseNumber = (str, allowGarbageAfter=false) => {
    if (!str) return null; // c'mon
    const nwr = parseNumberWithRange(str);
    if (nwr == null) return null;
    if (allowGarbageAfter) return nwr.number;
    if (nwr.end !== str.length) return null;
    return nwr.number;
};
