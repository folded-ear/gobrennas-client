import {
    List,
    ListItem,
    ListItemSecondaryAction,
    Typography,
} from "@material-ui/core";
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import InventoryApi from "../../data/InventoryApi";
import PageBody from "../common/PageBody";
import SplitButton from "../common/SplitButton";
import ElEdit from "../ElEdit";

const txTypes = [
    {id: "ACQUIRE", label: "Acquire"},
    {id: "CONSUME", label: "Consume"},
    {id: "DISCARD", label: "Discard"},
    {id: "ADJUST", label: "Adjust"},
    {id: "RESET", label: "Reset"},
];

export default function Pantry() {
    const [stuff, setStuff] = useState();
    const [adjust, setAdjust] = useState({raw: ""});
    const [tx, setTx] = useState(txTypes[1] /* consume */);
    const reloadInventory = () => {
        InventoryApi.promiseInventory()
            .then(data => data.data)
            .then(setStuff);
    };
    useEffect(reloadInventory, []);

    const disabled = useMemo(() =>
        !adjust.ingredient, [adjust]);

    function handleCommit() {
        if (disabled) return;
        InventoryApi.promiseAddTransaction({
            ...adjust,
            type: tx.id,
        }).then(reloadInventory);
        setAdjust({raw: ""});
    }

    function handleSelectTx(e, tx) {
        setTx(tx);
    }

    return <PageBody>
        <Typography variant="h2">Pantry</Typography>
        <pre>{JSON.stringify(stuff, null, 3)}</pre>
        <List>
            <ListItem disableGutters>
                <ElEdit
                    name={"adjust"}
                    value={adjust}
                    onChange={e => setAdjust(e.target.value)}
                    onPressEnter={handleCommit}
                />
                <ListItemSecondaryAction>
                    <SplitButton
                        primary={tx.label}
                        disabled={disabled}
                        dropdownDisabled={false}
                        options={txTypes.filter(it => it !== tx)}
                        onClick={handleCommit}
                        onSelect={handleSelectTx}
                    />
                </ListItemSecondaryAction>
            </ListItem>
        </List>
        <pre>{JSON.stringify(adjust, null, 3)}</pre>
    </PageBody>;
}
