import { Grid } from "@material-ui/core";
import PropTypes from "prop-types";
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import InventoryApi from "../../data/InventoryApi";
import SplitButton from "../common/SplitButton";
import ElEdit from "../ElEdit";

const txTypes = [
    {id: "ACQUIRE", label: "Acquire"},
    {id: "CONSUME", label: "Consume"},
    {id: "DISCARD", label: "Discard"},
    {id: "ADJUST", label: "Adjust By"},
    {id: "RESET", label: "Reset To"},
];

const DEFAULT_TX_TYPE = txTypes[1]; /* consume */

const EMPTY_REF = {raw: ""};

function OneShotEdit({
                         ingredient,
                         onCommit,
                     }) {
    const [ txType, setTxType ] = useState(DEFAULT_TX_TYPE);
    const [ ref, setRef ] = useState(EMPTY_REF);
    useEffect(() => {
        if (!ingredient) return;
        if (ref.raw === "" || (ref.raw.startsWith("\"") && ref.raw.endsWith("\""))) {
            setRef({ raw: `"${ingredient}"` });
        }
    }, [ ingredient ]);

    // kludge for something with the circular progress hunk drawing stupid.
    const [ maxHeight, setMaxHeight ] = useState("unset");
    const elEditRef = useRef();
    useEffect(() => {
        if (!elEditRef.current) return;
        const height = elEditRef.current.clientHeight;
        setMaxHeight(height * 1.5 + "px");
    }, [ elEditRef.current ]);

    const disabled = useMemo(() =>
        !ref.quantity || !ref.ingredient, [ ref ]);

    function handleCommit() {
        if (disabled) return;
        const tx = {
            type: txType.id,
            ingredient: ref.ingredient,
            ingredientId: ref.ingredientId,
        };
        tx.quantity = [{
            quantity: ref.quantity,
            units: ref.units,
            uomId: ref.uomId,
        }];
        InventoryApi.promiseAddTransaction(tx)
            .then(onCommit);
        setRef(EMPTY_REF);
    }

    function handleSelectTx(e, tx) {
        setTxType(tx);
    }

    return <Grid container>
        <Grid item style={{ flexGrow: 1, maxHeight, overflow: "hidden" }}
              ref={elEditRef}>
            <ElEdit
                name={"adjust"}
                value={ref}
                onChange={e => setRef(e.target.value)}
                onPressEnter={handleCommit}
            />
        </Grid>
        <Grid item>
            <SplitButton
                primary={txType.label}
                disabled={disabled}
                dropdownDisabled={false}
                options={txTypes.filter(it => it !== txType)}
                onClick={handleCommit}
                onSelect={handleSelectTx}
            />
        </Grid>
    </Grid>;
}

OneShotEdit.propTypes = {
    onCommit: PropTypes.func,
    ingredient: PropTypes.string,
};

export default OneShotEdit;
