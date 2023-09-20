import React, {
    CSSProperties,
    PropsWithChildren,
    useEffect,
    useRef,
    useState
} from "react";
import {
    BfsId,
    Ingredient
} from "../global/types/types";
import ItemApi, { RecognitionResult } from "../data/ItemApi";
import debounce from "../util/debounce";
import processRecognizedItem from "../util/processRecognizedItem";
import {
    Autocomplete,
    Grid,
    InputAdornment,
    LinearProgress,
    TextField
} from "@mui/material";
import {
    CheckCircleOutline,
    ErrorOutline
} from "@mui/icons-material";

const doRecog = raw =>
    raw != null && raw.trim().length >= 2;

export interface Value {
    id?: BfsId
    raw: string
    quantity?: number
    uomId?: number
    units?: string
    ingredientId?: number
    ingredient?: Ingredient
    preparation?: string
}

interface Target {
    target: {
        name: string
        value: Value
    }
}

interface Suggestion {
    prefix: string
    value: string
    suffix: string
    result: string
}

interface ElEditProps {
    name: string
    value: Value
    placeholder?: string

    onChange(e: Target): void

    onPressEnter(): void

    onDelete?(): void

    onMultilinePaste?(text: string): void
}

interface ElEditState {
    recog?: RecognitionResult
    suggestions?: Suggestion[]
    quantity?: number
    quantityValue?: number
    unit?: string
    unitValue?: number
    ingredientName?: string
    nameValue?: number
    preparation?: string
}

function getCursorPosition(el: HTMLInputElement | null) {
    if (el == null) return 0;
    const c = el.selectionStart || 0;
    const raw = el.value || "";
    return Math.min(Math.max(c, 0), raw.length);
}

function recognize(_mounted, _raw, ref, props, setState) {
    if (!_mounted.current) return;
    const {
        name,
        value,
        onChange,
    } = props;
    if (!doRecog(value.raw)) return;
    const cursor = getCursorPosition(ref.current);
    ItemApi.recognizeItem(value.raw, cursor)
        .then((recog: RecognitionResult) => {
            if (!_mounted.current) return;
            if (recog.raw !== _raw.current) return;
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
            const suggestions: Suggestion[] = recog.suggestions.map(s => {
                const prefix = recog.raw.substring(0, s.target.start);
                const suffix = recog.raw.substring(s.target.end);
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
            setState({
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

const recognizeDebounced = debounce(recognize);

function ElEdit(props: ElEditProps) {
    const [ state, setState ] = useState<ElEditState>({
        recog: undefined,
        suggestions: undefined,
    });
    const _mounted = useRef(false);
    const _raw = useRef("");
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        _raw.current = props.value?.raw;
    }, [ props.value?.raw ]);

    useEffect(() => {
        _mounted.current = true;
        recognize(_mounted, _raw, ref, props, setState);
        return () => {
            _mounted.current = false;
        };
        // We want to run once, with whatever we started with.
        //
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        recognizeDebounced(_mounted, _raw, ref, props, setState);
        // Re-recognize ONLY when the raw changes.
        //
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ props?.value?.raw ]);

    function handleChange(e, val) {
        const {
            name,
            onChange,
            value,
        } = props;
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
        setState({ suggestions: undefined });
    }

    function onPaste(e) {
        const {
            onMultilinePaste,
        } = props;
        if (onMultilinePaste == null) return; // don't care!
        let text = e.clipboardData.getData("text");
        if (text == null) return;
        text = text.trim();
        if (text.indexOf("\n") < 0) return; // default behaviour
        e.preventDefault(); // no default
        onMultilinePaste(text);
    }

    function onKeyDown(e) {
        const {
            value,
        } = e.target;
        const {
            key,
        } = e;
        const {
            onDelete,
            onPressEnter,
        } = props;
        const hasSuggestions = _hasSuggestions();

        switch (key) { // eslint-disable-line default-case
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
                    onDelete && onDelete();
                }
                break;
            case "ArrowLeft":
            case "ArrowRight":
                recognizeDebounced();
                break;
        }
    }

    function _hasSuggestions() {
        const { suggestions } = state;
        if (!suggestions) return false;
        if (suggestions.length === 0) return false;
        if (suggestions.length > 1) return true;
        const { value: { raw } } = props;
        return suggestions[0].result !== raw;
    }

    const {
        value,
        placeholder,
    } = props;
    const {
        raw,
    } = value;
    const {
        recog,
        quantity,
        unit,
        unitValue,
        ingredientName,
        nameValue,
        preparation,
        suggestions,
    } = state;
    const hasSuggestions = _hasSuggestions();

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
                value={raw}
                onChange={handleChange}
                onInputChange={handleChange}
                freeSolo
                handleHomeEndKeys={hasSuggestions}
                disableClearable
                options={hasSuggestions && suggestions
                    ? suggestions.map(it => it.result)
                    : []}
                filterOptions={x => x}
                renderInput={(params) => {
                    params.InputProps.startAdornment = indicator;
                    return (
                        <TextField
                            inputRef={ref}
                            {...params}
                            onPaste={onPaste}
                            onKeyDown={onKeyDown}
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

interface HunkProps extends PropsWithChildren {
    style?: CSSProperties
}

const Hunk: React.FC<HunkProps> = ({
                                       children,
                                       style,
                                   }) => <span style={{
    ...style,
    marginLeft: "0.4em",
    padding: "0 0.25em",
}}>{children}</span>;

export default ElEdit;
