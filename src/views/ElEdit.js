import {
    AutoComplete,
    Icon,
    Input,
    Select,
    Spin,
} from "antd";
import PropTypes from "prop-types";
import React from "react";
import RecipeApi from "../data/RecipeApi";
import debounce from "../util/debounce";
import processRecognizedElement from "../util/processRecognizedElement";

let seq = 0;

const doRecog = raw =>
    raw != null && raw.trim().length >= 2;

class ElEdit extends React.PureComponent {

    constructor(...args) {
        super(...args);
        this._domId = "el-edit-" + (++seq);
        this._mounted = false;
        this.state = {
            recog: null,
        };
        this.recognizeDebounced = debounce(this.recognize.bind(this));
        this.handleChange = this.handleChange.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidMount() {
        this._mounted = true;
        this.recognize();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.value.raw === prevProps.value.raw) return;
        this.recognizeDebounced();
    }

    getCursorPosition() {
        const el = document.getElementById(this._domId);
        if (el == null) return 0;
        const c = el.selectionStart;
        const raw = el.value || "";
        return Math.min(Math.max(c, 0), raw.length);
    }

    recognize() {
        if (!this._mounted) return;
        const {
            name,
            value,
            onChange,
        } = this.props;
        if (!doRecog(value.raw)) return;
        const cursor = this.getCursorPosition();
        RecipeApi.recognizeElement(value.raw, cursor)
            .then(recog => {
                if (!this._mounted) return;
                if (recog.raw !== this.props.value.raw) return;
                if (recog.cursor !== this.getCursorPosition()) return;
                const {
                    raw,
                    quantity: qv,
                    quantity_raw: q,
                    uomId: uv,
                    units,
                    units_raw: u,
                    ingredientId: nv,
                    ingredient,
                    ingredient_raw: n,
                    preparation: p,
                } = processRecognizedElement(recog);
                onChange({
                    target: {
                        name,
                        value: {
                            raw,
                            quantity: qv,
                            uomId: uv,
                            units,
                            ingredientId: nv,
                            ingredient,
                            preparation: p,
                        },
                    },
                });
                const suggestions = recog.suggestions.map(s => {
                    const prefix = recog.raw.substr(0, s.target.start);
                    const suffix = recog.raw.substr(s.target.end);
                    const quote = s.name.indexOf(" ") >= 0 ||
                        recog.raw.charAt(s.target.start) === '"' ||
                        recog.raw.charAt(s.target.end - 1) === '"';
                    const value = quote
                        ? `"${s.name}"`
                        : s.name;
                    return {
                        prefix,
                        value,
                        suffix,
                        result: prefix + value + suffix,
                    };
                })
                    .filter(s => s.result !== recog.raw);
                return this.setState({
                    recog,
                    q, qv,
                    u, uv,
                    n, nv,
                    p,
                    suggestions,
                });
            });
    }

    handleChange(v) {
        const {
            name,
            onChange,
        } = this.props;
        onChange({
            target: {
                name,
                value: {
                    raw: v,
                },
            },
        });
        // suggestions are always made stale by change
        this.setState({suggestions: null});
    }

    onPaste(e) {
        const {
            onMultilinePaste,
        } = this.props;
        if (onMultilinePaste == null) return; // don't care!
        let text = e.clipboardData.getData("text");
        if (text == null) return;
        text = text.trim();
        if (text.indexOf("\n") < 0) return; // default behaviour
        e.preventDefault(); // no default
        onMultilinePaste(text);
    }

    onKeyDown(e) {
        const {
            value,
        } = e.target;
        const {
            key,
        } = e;
        const {
            onDelete,
        } = this.props;
        switch (key) { // eslint-disable-line default-case
            case "Backspace":
            case "Delete":
                // if the value is empty, delete the task and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    onDelete && onDelete();
                }
                break;
            case "ArrowLeft":
            case "ArrowRight":
                this.recognizeDebounced();
                break;
        }
    }

    render() {
        const {
            name,
            value,
            onPressEnter,
        } = this.props;
        const {
            raw,
        } = value;
        const {
            recog,
            q, u, uv, n, nv, p,
            suggestions,
        } = this.state;
        const hasSuggestions = suggestions && suggestions.length > 0;
        return <React.Fragment>
            <AutoComplete name={`${name}.raw`}
                          value={raw}
                          onChange={this.handleChange}
                          dataSource={hasSuggestions && suggestions.map(s =>
                              <Select.Option key={s.result}
                                             value={s.result}
                              >
                                  <span style={{color: "#999"}}>{s.prefix}</span>
                                  <strong>{s.value}</strong>
                                  <span style={{color: "#999"}}>{s.suffix}</span>
                              </Select.Option>)}
                          style={{
                              width: "50%",
                          }}
            >
                <Input id={this._domId}
                       onPaste={this.onPaste}
                       onPressEnter={hasSuggestions ? null : onPressEnter}
                       onKeyDown={this.onKeyDown}
                       autoComplete={"off"}
                       suffix={n == null
                           ? <Icon type="warning"
                                   title="No Ingredient Found!"
                                   style={{
                                       color: "red",
                                   }}
                           />
                           : <span />} />
            </AutoComplete>
            {recog == null
                ? doRecog(raw) ? <Hunk><Spin /></Hunk> : null
                : <Hunk>
                    {q && <Hunk style={{backgroundColor: "#fde"}}>{q}</Hunk>}
                    {u && <Hunk style={{backgroundColor: uv ? "#efd" : "#dfe"}}>{u}</Hunk>}
                    {n && <Hunk style={{backgroundColor: nv ? "#def" : "#edf"}}>{n}</Hunk>}
                    {p && <span>{n ? ", " : null}{p}</span>}
                </Hunk>
            }
        </React.Fragment>;
    }
}

const Hunk = ({children, style}) => <span style={{
    ...style,
    marginLeft: "0.4em",
    padding: "0 0.25em"
}}>{children}</span>;

ElEdit.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.shape({
        raw: PropTypes.string.isRequired,
        quantity: PropTypes.number,
        units: PropTypes.string,
        ingredientId: PropTypes.number,
        preparation: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onPressEnter: PropTypes.func,
    onDelete: PropTypes.func,
    onMultilinePaste: PropTypes.func,
};

export default ElEdit;