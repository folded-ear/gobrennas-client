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
    const [tx, setTx] = useState(txTypes[1]); // consume
    useEffect(() => {
        InventoryApi.promiseInventory()
            .then(data => data.data)
            .then(setStuff);
    }, []);

    const disabled = useMemo(() =>
        !adjust.ingredient || !adjust.units, [adjust]);

    function handleCommit() {
        // there's a bug in ElEdit where after selecting a suggestion, it still
        // thinks it has suggestions, even though it's not rendering them. So
        // hitting Enter doesn't work. It's not a `disabled` flow issue. :)
        if (disabled) return;
        console.log("commit", adjust, tx, ...arguments);
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
