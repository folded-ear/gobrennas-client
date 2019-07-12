import React, { Component } from 'react'
import Dispatcher from "../data/dispatcher";
import {
    Button,
    Icon,
} from "antd";
import IngredientItem from "./IngredientItem";
import "./IngredientParseUI.scss";
import PropTypes from "prop-types";
import RecipeActions from "../data/RecipeActions";
import capitalize from "../util/capitalize";

const SECTION_NAMES = ["quantity", "units", "name"];

const rebuildPrep = (raw, sections) => {
    const prepSegments = [];
    let pos = 0;
    Object.keys(sections)
        .forEach(name => {
            const v = sections[name];
            if (v.start > pos) {
                prepSegments.push(raw.substring(pos, v.start));
            }
            pos = v.end;
        });
    if (pos < raw.length) {
        prepSegments.push(raw.substring(pos));
    }
    return prepSegments
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
};

class IngredientParseUI extends Component {

    constructor(...args) {
        super(...args);
        this.rawRef = React.createRef();
        this.state = this.getInitialState();
        this.onParse = this.onParse.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    getInitialState() {
        const {ingredient: {raw: prep}} = this.props;
        return {
            parsing: false,
            sections: {},
            prep,
        };
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
                    [k]: {
                        ...v,
                        text: raw.substring(v.start, v.end),
                    },
                }), {});
            return {
                sections,
                prep: rebuildPrep(raw, sections),
            };
        })
    }

    removeSection(section) {
        this.setState(s => {
            if (!s.sections.hasOwnProperty(section)) return s;
            const {ingredient: {raw}} = this.props;
            const sections = {...s.sections};
            delete sections[section];
            return {
                sections,
                prep: rebuildPrep(raw, sections),
            };
        })
    }

    onSave() {
        const {
            recipeId,
            ingredient: {raw},
        } = this.props;
        const {
            parsing,
            sections,
            prep,
        } = this.state;
        if (! parsing) throw new Error("Save while not parsing?!");
        Dispatcher.dispatch({
            type: RecipeActions.RAW_INGREDIENT_DISSECTED,
            recipeId,
            raw,
            ...sections,
            prep,
        });
        this.setState(this.getInitialState());
    }

    onCancel() {
        this.setState(this.getInitialState());
    }

    render() {
        const {ingredient} = this.props;
        const {
            parsing,
            sections,
            prep,
        } = this.state;

        if (!parsing) {
            return <React.Fragment>
                <IngredientItem ingredient={ingredient} />
                <div style={{
                    marginLeft: "auto",
                }}>
                    {ingredient.ingredient
                        ? <Icon type="check"
                                style={{
                                    color: "green",
                                    paddingRight: "1.5em",
                                }} />
                        : <Button size="small"
                                  onClick={this.onParse}>
                            parse
                        </Button>}
                </div>
            </React.Fragment>;
        }

        const raw = ingredient.raw;
        let pos = 0;
        let segments = [];
        Object.keys(sections)
            .map(name => {
                const s = sections[name];
                return {
                    ...s,
                    name,
                };
            })
            .forEach(({name: n, start, end}) => {
                if (start > pos) {
                    segments.push(raw.substring(pos, start));
                }
                segments.push(<span key={n} className={"parse parse-" + n}>
                    {raw.substring(start, end)}
                </span>);
                pos = end;
            });
        if (pos < raw.length) {
            segments.push(raw.substring(pos));
        }

        return <div>
            <em>
                highlight some text and click what type it is
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
                    {capitalize(n)}:
                    {" "}
                    {sections.hasOwnProperty(n)
                        ? <code className={"parse parse-" + n}>
                            {sections[n].text}
                            {" "}
                            <Icon size="small"
                                  type="close"
                                  onClick={() => this.removeSection(n)}
                            />
                        </code>
                        : ""}
                </div>)}
            <div>Prep: <code>{prep}</code></div>
            <Button size="small"
                    type="primary"
                    disabled={!sections.hasOwnProperty("name") || !sections.name.text}
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
