import { Grid } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import InventoryApi, {
    InventoryItemInfo,
    TxType,
} from "../../data/InventoryApi";
import SplitButton from "../common/SplitButton";
import ElEdit from "../ElEdit";
import { IngredientRef } from "global/types/types";

const txTypes = [
    { id: TxType.ACQUIRE, label: "Acquire" },
    { id: TxType.CONSUME, label: "Consume" },
    { id: TxType.DISCARD, label: "Discard" },
    { id: TxType.ADJUST, label: "Adjust By" },
    { id: TxType.RESET, label: "Reset To" },
];

const DEFAULT_TX_TYPE = txTypes[1]; /* consume */

const EMPTY_REF: IngredientRef = { raw: "" };

interface Props {
    ingredient?: string;
    onCommit(item: InventoryItemInfo): void;
}

const OneShotEdit: React.FC<Props> = ({ ingredient, onCommit }) => {
    const [txType, setTxType] = useState(DEFAULT_TX_TYPE);
    const [ref, setRef] = useState(EMPTY_REF);
    useEffect(() => {
        setRef({
            raw: ingredient ? `"${ingredient}"` : "",
        });
    }, [ingredient]);

    // kludge for something with the circular progress hunk drawing stupid.
    const [maxHeight, setMaxHeight] = useState("unset");
    const elEditRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!elEditRef.current) return;
        const height = elEditRef.current.clientHeight;
        setMaxHeight(height * 1.5 + "px");
    }, []);

    const disabled = useMemo(() => !ref.quantity || !ref.ingredient, [ref]);

    function handleCommit() {
        if (disabled) return;
        const tx = {
            type: txType.id,
            ingredient: ref.ingredient,
            ingredientId: ref.ingredientId,
            quantity: [
                {
                    quantity: ref.quantity,
                    units: ref.units,
                    uomId: ref.uomId,
                },
            ],
        };
        InventoryApi.promiseAddTransaction(tx).then((data) =>
            onCommit(data.data),
        );
        setRef(EMPTY_REF);
    }

    function handleSelectTx(e, tx) {
        setTxType(tx);
    }

    return (
        <Grid container>
            <Grid
                item
                style={{ flexGrow: 1, maxHeight, overflow: "hidden" }}
                component={"div"}
                ref={elEditRef}
            >
                <ElEdit
                    name={"adjust"}
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    onPressEnter={handleCommit}
                    placeholder={"E.g., 1 qt chicken stock"}
                />
            </Grid>
            <Grid item>
                <SplitButton
                    primary={txType.label}
                    disabled={disabled}
                    dropdownDisabled={false}
                    options={txTypes}
                    onClick={handleCommit}
                    onSelect={handleSelectTx}
                />
            </Grid>
        </Grid>
    );
};

export default OneShotEdit;
