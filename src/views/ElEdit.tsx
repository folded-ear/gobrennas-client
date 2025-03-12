import ItemApi, { RecognitionResult } from "@/data/ItemApi";
import { BfsId } from "@/global/types/identity";
import { IngredientRef } from "@/global/types/types";
import debounce from "@/util/debounce";
import processRecognizedItem from "@/util/processRecognizedItem";
import { Autocomplete, Grid, InputAdornment, TextField } from "@mui/material";
import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";
import { PropsWithChildren } from "react";
import { ErrorIcon, OkIcon } from "./common/icons";
import LoadingIconButton from "./common/LoadingIconButton";

const doRecog = (raw: Maybe<string>) => raw != null && raw.trim().length >= 2;

export interface WithTarget<V> {
    target: {
        name: string;
        value: V;
    };
}

interface ElEditProps {
    name: string;
    value: IngredientRef<unknown>;
    placeholder?: string;

    onChange(e: WithTarget<IngredientRef<unknown>>): void;

    onPressEnter(): void;

    onDelete?(): void;

    onMultilinePaste?(text: string): void;
}

interface Suggestion {
    prefix: string;
    value: string;
    suffix: string;
    result: string;
}

interface ElEditState {
    recog?: RecognitionResult;
    suggestions?: Suggestion[];
    quantity?: Maybe<string>;
    quantityValue?: Maybe<number>;
    unit?: Maybe<string>;
    unitValue?: Maybe<BfsId>;
    ingredientName?: Maybe<string>;
    nameValue?: Maybe<BfsId>;
    preparation?: string;
}

class ElEdit extends React.PureComponent<ElEditProps, ElEditState> {
    private _mounted: boolean;
    private readonly ref: React.RefObject<HTMLInputElement | null>;
    private readonly recognizeDebounced: () => void;

    constructor(args: ElEditProps) {
        super(args);
        this.ref = React.createRef<HTMLInputElement>();
        this._mounted = false;
        this.state = {
            recog: undefined,
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

    componentDidUpdate(prevProps: ElEditProps) {
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
        const { name, value, onChange } = this.props;
        if (!doRecog(value.raw)) return;
        const cursor = this.getCursorPosition();
        ItemApi.promiseRecognizedItem(value.raw!, cursor).then((recog) => {
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
            const suggestions: Suggestion[] = recog.suggestions
                .map((s) => {
                    const prefix = recog.raw.substring(0, s.target.start);
                    const suffix = recog.raw.substring(s.target.end);
                    const quote =
                        s.name.indexOf(" ") >= 0 ||
                        recog.raw.charAt(s.target.start) === '"' ||
                        recog.raw.charAt(s.target.end - 1) === '"';
                    const value = quote ? `"${s.name}"` : s.name;
                    return {
                        prefix,
                        value,
                        suffix,
                        result: prefix + value + suffix,
                    };
                })
                .filter((s) => s.result !== recog.raw);
            this.setState({
                recog,
                quantity: q,
                quantityValue: qv,
                unit: u,
                unitValue: uv,
                ingredientName: n,
                nameValue: nv,
                preparation: p,
                suggestions,
            });
        });
    }

    handleChange(e: unknown, val: string) {
        const { name, onChange, value } = this.props;
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
        this.setState({ suggestions: undefined });
    }

    onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
        const { onMultilinePaste } = this.props;
        if (onMultilinePaste == null) return; // don't care!
        let text = e.clipboardData.getData("text");
        if (text == null) return;
        text = text.trim();
        if (text.indexOf("\n") < 0) return; // default behaviour
        e.preventDefault(); // no default
        onMultilinePaste(text);
    }

    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        const { value } = e.target as HTMLInputElement;
        const { key } = e;
        const { onDelete, onPressEnter } = this.props;
        const hasSuggestions = this._hasSuggestions();

        switch (key) {
            case "Enter":
                if (!hasSuggestions) {
                    onPressEnter();
                }
                break;
            case "Backspace":
            case "Delete":
                // if the value is empty, delete the item and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    if (onDelete) onDelete();
                }
                break;
            case "ArrowLeft":
            case "ArrowRight":
                this.recognizeDebounced();
                break;
        }
    }

    _hasSuggestions() {
        const { suggestions } = this.state;
        if (!suggestions) return false;
        if (suggestions.length === 0) return false;
        if (suggestions.length > 1) return true;
        const {
            value: { raw },
        } = this.props;
        return suggestions[0].result !== raw;
    }

    render() {
        const { value, placeholder } = this.props;
        const { raw } = value;
        const {
            recog,
            quantity,
            unit,
            unitValue,
            ingredientName,
            nameValue,
            preparation,
            suggestions,
        } = this.state;
        const hasSuggestions = this._hasSuggestions();

        const indicator = (
            <InputAdornment position={"start"}>
                {ingredientName == null ? (
                    <ErrorIcon color="error" />
                ) : (
                    <OkIcon color="disabled" />
                )}
            </InputAdornment>
        );

        return (
            <Grid container alignItems={"center"}>
                <Grid item sm={6} xs={12}>
                    <Autocomplete
                        size={"small"}
                        value={raw}
                        onChange={this.handleChange}
                        onInputChange={this.handleChange}
                        freeSolo
                        handleHomeEndKeys={hasSuggestions}
                        disableClearable
                        options={
                            hasSuggestions && suggestions
                                ? suggestions.map((it) => it.result)
                                : []
                        }
                        filterOptions={(x) => x}
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

                <Grid item sm={6} xs={12} className={"el-edit"}>
                    {!recog || !raw ? (
                        doRecog(raw) ? (
                            <Hunk>
                                <LoadingIconButton />
                            </Hunk>
                        ) : null
                    ) : (
                        <Hunk>
                            {quantity && (
                                <Hunk className={"quantity"}>{quantity}</Hunk>
                            )}
                            {unit && (
                                <Hunk
                                    className={unitValue ? "unit" : "new-unit"}
                                >
                                    {unit}
                                </Hunk>
                            )}
                            {ingredientName && (
                                <Hunk
                                    className={
                                        nameValue
                                            ? "ingredient"
                                            : "new-ingredient"
                                    }
                                >
                                    {ingredientName}
                                </Hunk>
                            )}
                            {preparation && (
                                <span>
                                    {ingredientName ? ", " : null}
                                    {preparation}
                                </span>
                            )}
                        </Hunk>
                    )}
                </Grid>
            </Grid>
        );
    }
}

interface HunkProps extends PropsWithChildren {
    className?: string;
}

const Hunk: React.FC<HunkProps> = ({ children, className }) => (
    <span
        className={className}
        style={{
            marginLeft: "0.4em",
            padding: "0 0.25em",
        }}
    >
        {children}
    </span>
);

export default ElEdit;
