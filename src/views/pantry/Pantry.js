import {
    Grid,
    makeStyles,
    Typography,
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import InventoryApi from "../../data/InventoryApi";
import { useIsMobile } from "../../providers/IsMobile";
import LoadingIndicator from "../common/LoadingIndicator";
import PageBody from "../common/PageBody";
import Detail from "./Detail";
import { formatQuantity } from "./formatQuantity";
import OneShotEdit from "./OneShotEdit";

const useStyles = makeStyles(theme => ({
    gridHeader: {
        backgroundColor: theme.palette.grey[200],
    },
}));

export default function Pantry() {
    const classes = useStyles();
    const isMobile = useIsMobile();
    const [ inventory, setInventory ] = useState();
    const [ selection, setSelection ] = useState(undefined);
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

    const cols = useMemo(() => [
        {
            field: "name",
            headerName: "Ingredient",
        },
        {
            field: "quantity",
            headerName: "Quantity",
            sortable: false,
        },
    ].map(c => ({
        headerClassName: classes.gridHeader,
        width: 100,
        flex: 1,
        ...c,
    })), [ classes ]);

    const rows = useMemo(() => {
        if (!inventory) return [];
        return inventory.content.map(it => ({
            id: it.id,
            name: it.ingredient.name,
            quantity: formatQuantity(it.quantity),
        }));
    }, [ inventory ]);

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
            ingredient={selection ? selection.ingredient.name : undefined}
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
                    selectionModel={selection ? [ selection.id ] : []}
                    onSelectionModelChange={handleSelection}
                />
            </Grid>
            {!isMobile && selection != null &&
            <Grid item style={{ flexGrow: "2" }}>
                <Detail
                    item={selection}
                />
            </Grid>}
        </Grid>
    </PageBody>;
}
