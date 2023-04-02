import {
    Card,
    CardContent,
    CardHeader,
    IconButton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Close as CloseIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import React, {
    MouseEventHandler,
    useEffect,
    useMemo,
    useState,
} from "react";
import InventoryApi, {
    InventoryItemInfo,
    InventoryTxInfo,
} from "../../data/InventoryApi";
import LoadingIndicator from "../common/LoadingIndicator";
import { formatQuantity } from "./formatQuantity";
import { Maybe } from "graphql/jsutils/Maybe";
import { Page } from "../../global/types/types";

const useStyles = makeStyles(theme => ({
    gridHeader: {
        backgroundColor: theme.palette.grey[200],
    },
}));

interface Props {
    item: InventoryItemInfo
    onClose?: MouseEventHandler
}

const Detail: React.FC<Props> = ({
                                     item,
                                     onClose,
                                 }) => {
    const classes = useStyles();
    const [ history, setHistory ] = useState<Maybe<Page<InventoryTxInfo>>>();
    const reloadHistory = () => {
        InventoryApi.promiseTransactionHistory(item.id)
            .then(data => data.data)
            .then(setHistory);
    };
    useEffect(reloadHistory, [ item ]);

    const cols = useMemo(() => [
        {
            field: "type",
            headerName: "Action",
            flex: 1,
        },
        {
            field: "quantity",
            headerName: "Quantity",
            flex: 2,
        },
        {
            field: "createdAt",
            headerName: "Date",
            flex: 2,
        },
    ].map(c => ({
        headerClassName: classes.gridHeader,
        sortable: false,
        width: 100,
        ...c,
    })), [ classes ]);

    const rows = useMemo(() => {
        if (!history) return [];
        return history.content.map(it => ({
            id: it.id,
            type: it.type,
            quantity: formatQuantity(it.quantity),
            createdAt: new Date(it.createdAt)
                .toLocaleString(),
        }));
    }, [history]);

    if (!history) {
        return <LoadingIndicator />;
    }

    return (
        <Card>
            <CardHeader
                style={{ paddingBottom: 0 }}
                action={
                    <IconButton aria-label="close" onClick={onClose} size="large">
                        <CloseIcon/>
                    </IconButton>
                }
                title={item.ingredient.name}
            />
            <CardContent style={{ paddingTop: 0 }}>
                <div style={{ height: "50vh" }}>
                    <DataGrid
                        density={"compact"}
                        disableColumnMenu
                        columns={cols}
                        rows={rows}
                        pagination
                        paginationMode={"server"}
                        paginationModel={history}
                    />
                </div>
                {/*<pre>{JSON.stringify(history, null, 2)}</pre>*/}
            </CardContent>
        </Card>
    );
};

export default Detail;
