import React, { Component } from 'react'
import { Button } from "antd";
import IngredientItem from "./IngredientItem";
import "./IngredientEdit.scss";
import PropTypes from "prop-types";

const SECTION_NAMES = ["quantity", "units", "name", "prep"];

class IngredientEdit extends Component {

    constructor(...args) {
        super(...args);
        this.rawRef = React.createRef();
        this.state = {
            parsing: false,
            sections: {},
        };
        this.onParse = this.onParse.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    onParse() {
        this.setState({parsing: true})
    }

    onSelect(section) {
        const sel = window.getSelection();
        if (sel == null || sel.anchorNode == null || sel.isCollapsed) return;
        if (!this.rawRef.current.contains(sel.anchorNode)) {
            return;
        }
        // todo: deal with overlaps?
        this.setState(({sections}) => ({
            sections: {
                ...sections,
                [section]: sel.toString().trim(),
            },
        }))
    }

    onSave() {
        // todo: save it
        this.onCancel();
    }

    onCancel() {
        this.setState({parsing: false, sections: {}})
    }

    render() {
        const {ingredient} = this.props;
        const {
            parsing,
            sections,
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
        SECTION_NAMES
            .filter(n => sections.hasOwnProperty(n))
            .map(n => ({
                name: n,
                text: sections[n],
                start: raw.indexOf(sections[n]),
            }))
            .filter(it => it.start >= 0)
            .sort((a, b) => a.start - b.start)
            .forEach(({name, start, text}) => {
                if (start > pos) {
                    segments.push(raw.substring(pos, start));
                    pos = start;
                }
                segments.push(<span key={name} className={"parse parse-" + name}>
                    {text}
                </span>)
                pos = start + text.length;
            });
        if (pos < raw.length) {
            segments.push(raw.substring(pos));
        }

        return <div>
            <span ref={this.rawRef}>{segments}</span>
            {" "}
            {SECTION_NAMES.map(s =>
                <Button size="small"
                        key={s}
                        onClick={() => this.onSelect(s)}>{s}</Button>)}

            {" "}
            <Button size="small"
                onClick={this.onSave}
                type="primary">save</Button>
            <Button size="small"
                onClick={this.onCancel}
                type="danger">cancel</Button>
            <br />
            <em>highlight part of the ingredient and hit the button for what it
                is</em>
        </div>;
    }
}

IngredientEdit.propTypes = {
    ingredient: PropTypes.shape({
        ingredient: PropTypes.object,
        raw: PropTypes.string,
    }).isRequired,
    recipeId: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
};

export default IngredientEdit;
