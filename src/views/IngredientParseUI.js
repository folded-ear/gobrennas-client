import React, { Component } from 'react'
import { Button } from "antd";
import IngredientItem from "./IngredientItem";
import "./IngredientParseUI.scss";
import PropTypes from "prop-types";

const SECTION_NAMES = ["quantity", "units", "name"];

const initialState = {
    parsing: false,
    sections: {},
    prep: null,
};

class IngredientParseUI extends Component {

    constructor(...args) {
        super(...args);
        this.rawRef = React.createRef();
        this.state = initialState;
        this.onParse = this.onParse.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    onParse() {
        this.setState({parsing: true})
    }

    onSelect(section) {
        const {ingredient: {raw}} = this.props;
        const sel = window.getSelection();
        if (sel == null || sel.anchorNode == null || sel.isCollapsed) return;
        if (!this.rawRef.current.contains(sel.anchorNode)) {
            return;
        }
        const text = sel.toString().trim();
        const start = raw.indexOf(text);
        const end = start + text.length;
        this.setState(({sections}) => {
            sections = {
                ...sections,
            };
            delete sections[section];
            const secArr = Object.entries(sections);
            // add the just-saved section
            secArr.push([section, {
                start,
                end,
            }]);
            // sort by start index
            secArr.sort((a, b) =>
                a[1].start - b[1].start);
            // ensure there are no overlaps
            let last = 0;
            secArr.forEach((it, i) => {
                const v = it[1];
                if (v.start < last) {
                    const prev = secArr[i - 1][1];
                    prev.end = v.start;
                    while (raw.charAt(prev.end - 1) === " ") {
                        prev.end -= 1;
                    }
                }
                while (raw.charAt(v.start) === " ") {
                    v.start += 1;
                }
                while (raw.charAt(v.end - 1) === " ") {
                    v.end -= 1;
                }
                last = v.end;
            });
            // reduce back to key:value pairs
            sections = secArr
                .filter((it) => {
                    const v = it[1];
                    return v.start < v.end;
                })
                .reduce((o, [k, v]) => ({
                    ...o,
                    [k]: v,
                }), {});
            // find all the "leftovers"
            let pos = 0;
            const prepSegments = [];
            Object.keys(sections)
                .forEach(name => {
                    const v = sections[name];
                    if (v.start > pos) {
                        prepSegments.push(raw.substring(pos, v.start));
                    }
                    v.text = raw.substring(v.start, v.end);
                    pos = v.end;
                });
            if (pos < raw.length) {
                prepSegments.push(raw.substring(pos));
            }
            const prep = prepSegments
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .map(s => {
                    const c = s.charAt(0);
                    if (c.toUpperCase() === c.toLowerCase()) {
                        // not alphabetic?
                        return s;
                    }
                    return " " + s;
                })
                .join("")
                .replace(/(^[^a-z0-9]+)|([^a-z0-9]+$)/i, "");
            return {
                sections,
                prep,
            };
        })
    }

    onSave() {
        const {ingredient: {raw}} = this.props;
        const {
            sections,
            prep,
        } = this.state;
        const data = Object.keys(sections)
            .reduce((d, n) => ({
                ...d,
                [n]: sections[n],
            }), {
                raw,
                prep,
            });
        console.log("SAVE PARSED", data);
        this.setState(initialState);
    }

    onCancel() {
        this.setState(initialState);
    }

    render() {
        const {ingredient} = this.props;
        const {
            parsing,
            sections,
            prep,
        } = this.state;

        if (ingredient.ingredient) {
            // already parsed
            return <IngredientItem ingredient={ingredient} />;
        }

        if (!parsing) {
            return <React.Fragment>
                <IngredientItem ingredient={ingredient} />
                {" "}
                <Button size="small"
                        onClick={this.onParse}>parse</Button>
            </React.Fragment>;
        }

        const raw = ingredient.raw;
        let pos = 0;
        let segments = [];
        const sectionKeys = Object.keys(sections);
        sectionKeys
            .map(name => {
                const s = sections[name];
                return {
                    ...s,
                    name,
                };
            })
            .forEach(({name, start, end}) => {
                if (start > pos) {
                    segments.push(raw.substring(pos, start));
                }
                segments.push(<span key={name} className={"parse parse-" + name}>
                    {raw.substring(start, end)}
                </span>);
                pos = end;
            });
        if (pos < raw.length) {
            segments.push(raw.substring(pos));
        }

        return <div>
            <em>
                highlight some text and hit the button for what it is
            </em>
            <br />
            <span ref={this.rawRef}>{segments}</span>
            {" "}
            {SECTION_NAMES.map(n =>
                <Button size="small"
                        key={n}
                        onClick={() => this.onSelect(n)}>{n}</Button>)}

            <br />
            {SECTION_NAMES.map(n =>
                <div key={n}>
                    {n.charAt(0).toUpperCase()}{n.substring(1)}:
                    {" "}
                    {sections.hasOwnProperty(n)
                        ? <code className={"parse parse-" + n}>
                            {sections[n].text}
                        </code>
                        : ""}
                </div>)}
            <div>Prep: <code>{prep}</code></div>
            <Button size="small"
                    type="primary"
                    disabled={sectionKeys.length === 0}
                    onClick={this.onSave}>save</Button>
            <Button size="small"
                    type="danger"
                    onClick={this.onCancel}>cancel</Button>
        </div>;
    }
}

IngredientParseUI.propTypes = {
    ingredient: PropTypes.shape({
        ingredient: PropTypes.object,
        raw: PropTypes.string,
    }).isRequired,
    recipeId: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
};

export default IngredientParseUI;
