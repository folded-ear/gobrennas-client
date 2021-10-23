import {
    Grid,
    Typography,
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import InventoryApi from "../../data/InventoryApi";
import LoadingIndicator from "../common/LoadingIndicator";
import PageBody from "../common/PageBody";
import Detail from "./Detail";
import { formatQuantity } from "./formatQuantity";
import OneShotEdit from "./OneShotEdit";

const cols = [
    {
        field: "name",
        headerName: "Ingredient",
        width: 100,
        flex: 1,
    },
    {
        field: "quantity",
        headerName: "Quantity",
        sortable: false,
        width: 100,
        flex: 1,
    },
];

export default function Pantry() {
    const [inventory, setInventory] = useState();
    const [selection, setSelection] = useState(undefined);
    const reloadInventory = () => {
        InventoryApi.promiseInventory()
            .then(data => data.data)
            .then(inv => {
                setInventory(inv);
                if (selection) {
                    setSelection(inv.content.find(it =>
                        it.id === selection.id));
                }
            });
    };
    useEffect(reloadInventory, []);

    const rows = useMemo(() => {
        if (!inventory) return [];
        return inventory.content.map(it => ({
            id: it.id,
            name: it.ingredient.name,
            quantity: formatQuantity(it.quantity),
        }));
    }, [inventory]);

    if (!inventory) {
        return <LoadingIndicator />;
    }

    function handleSelection(s) {
        if (s.length === 0) {
            setSelection(undefined);
        } else {
            setSelection(inventory.content.find(it => it.id === s[0]));
        }
    }

    return <PageBody>
        <Typography variant="h2">Pantry</Typography>
        <OneShotEdit
            onCommit={reloadInventory}
        />
        <Grid container style={{height: "70vh", gap: "1em"}}>
            <Grid item style={{flexGrow: "1"}}>
                <DataGrid
                    density={"compact"}
                    disableColumnMenu
                    columns={cols}
                    rows={rows}
                    pagination
                    paginationMode={"server"}
                    page={inventory.page}
                    pageSize={inventory.pageSize}
                    selectionModel={selection ? [selection.id] : []}
                    onSelectionModelChange={handleSelection}
                />
            </Grid>
            {selection != null && <Grid item style={{flexGrow: "2"}}>
                <Detail
                    item={selection}
                />
            </Grid>}
        </Grid>
    </PageBody>;
}
