import {Grid, InputAdornment, LinearProgress, TextField,} from "@material-ui/core";
import {CheckCircleOutline, ErrorOutline,} from "@material-ui/icons";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PropTypes from "prop-types";
import React from "react";
import ItemApi from "data/ItemApi";
import debounce from "util/debounce";
import processRecognizedItem from "util/processRecognizedItem";
import {Ingredient} from "../types";

const doRecog = raw =>
    raw != null && raw.trim().length >= 2;

type Value = {
    id: string | number,
    raw: string,
    quantity?: number,
    uomId?: number,
    units?: string,
    ingredientId?: number,
    ingredient?: Ingredient,
    preparation?: string,
}

type Target = {
    target: {
        name: string,
        value: Value,
    }
}

type ElEditProps = {
    name: string,
    value: Value,
    onChange: (e: Target) => void,
    onPressEnter: () => void,
    onDelete?: () => void,
    onMultilinePaste?: (text: any) => void,
    placeholder?: string,
}

type ElEditState = {
    recog: any,
    suggestions?: any,
    quantity?: number,
    quantityValue?: number,
    unit?: string,
    unitValue?: number,
    ingredientName?: string,
    nameValue?: number,
    preparation?: string
}

class ElEdit extends React.PureComponent<ElEditProps, ElEditState> {
    private _mounted: boolean;
    private ref: React.RefObject<HTMLInputElement>;
    private recognizeDebounced: ((...args) => void) | any;

    constructor(args: ElEditProps) {
        super(args);
        this.ref = React.createRef<HTMLInputElement>();
        this._mounted = false;
        this.state = {
            recog: null,
            suggestions: undefined,
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
        const el = this.ref.current;
        if (el == null) return 0;
        const c = el.selectionStart || 0;
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
        ItemApi.recognizeItem(value.raw, cursor)
            .then(recog => {
                if (!this._mounted) return;
                if (recog.raw !== this.props.value.raw) return;
                // if (recog.cursor !== this.getCursorPosition()) return;
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
                } = processRecognizedItem(recog);
                onChange({
                    target: {
                        name,
                        value: {
                            id: value.id,
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
                this.setState({
                    recog,
                    quantity: q,
                    quantityValue: qv,
                    unit: u, unitValue: uv,
                    ingredientName: n, nameValue: nv,
                    preparation: p,
                    suggestions,
                });
            });
    }

    handleChange(e, val) {
        const {
            name,
            onChange,
            value,
        } = this.props;
        if (value.raw === val) return;
        onChange({
            target: {
                name,
                value: {
                    id: value.id,
                    raw: val,
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
            onPressEnter,
        } = this.props;
        const hasSuggestions = this._hasSuggestions();

        switch (key) { // eslint-disable-line default-case
            case "Enter":
                if (!hasSuggestions) {
                    onPressEnter();
                }
                break;
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

    _hasSuggestions() {
        const {suggestions} = this.state;
        if (!suggestions) return false;
        if (suggestions.length === 0) return false;
        if (suggestions.length > 1) return true;
        const {value: {raw}} = this.props;
        return suggestions[0] !== raw;
    }

    render() {
        const {
            value,
            placeholder,
        } = this.props;
        const {
            raw,
        } = value;
        const {
            recog,
            quantity, unit, unitValue, ingredientName, nameValue, preparation,
            suggestions,
        } = this.state;
        const hasSuggestions = this._hasSuggestions();

        const indicator = <InputAdornment
            position={"start"}
        >
            {ingredientName == null
                ? <ErrorOutline color="error" />
                : <CheckCircleOutline color="disabled" />
            }
        </InputAdornment>;

        return <Grid container alignItems={"center"}>
            <Grid item sm={6} xs={12}>
                <Autocomplete
                    size={"small"}
                    id={`${ingredientName}.raw`}
                    value={raw}
                    onChange={this.handleChange}
                    onInputChange={this.handleChange}
                    freeSolo
                    handleHomeEndKeys={hasSuggestions}
                    disableClearable
                    options={hasSuggestions ? suggestions.map((option) => {
                        return (option.result);
                    }) : []}
                    renderInput={(params) => {
                        params.InputProps.startAdornment = indicator;
                        return (
                            <TextField
                                inputRef={this.ref}
                                {...params}
                                onPaste={this.onPaste}
                                onKeyDown={this.onKeyDown}
                                variant="outlined"
                                placeholder={placeholder}
                            />
                        );
                    }}
                />
            </Grid>

            <Grid item sm={6} xs={12}>
                {(!recog || !raw)
                    ? doRecog(raw) ? <Hunk><LinearProgress /></Hunk> : null
                    : <Hunk>
                        {quantity &&
                        <Hunk style={{ backgroundColor: "#fde" }}>{quantity}</Hunk>}
                        {unit && <Hunk
                            style={{ backgroundColor: unitValue ? "#efd" : "#dfe" }}>{unit}</Hunk>}
                        {ingredientName && <Hunk
                            style={{ backgroundColor: nameValue ? "#def" : "#edf" }}>{ingredientName}</Hunk>}
                        {preparation && <span>{ingredientName ? ", " : null}{preparation}</span>}
                    </Hunk>
                    }
            </Grid>
        </Grid>;
    }
}

const Hunk = ({children, style}) => <span style={{
    ...style,
    marginLeft: "0.4em",
    padding: "0 0.25em",
}}>{children}</span>;

Hunk.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
};

export default ElEdit;
