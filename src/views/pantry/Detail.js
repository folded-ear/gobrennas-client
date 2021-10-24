import {
    Card,
    CardContent,
    makeStyles,
    Typography,
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import InventoryApi from "../../data/InventoryApi";
import LoadingIndicator from "../common/LoadingIndicator";
import { formatQuantity } from "./formatQuantity";

const useStyles = makeStyles(theme => ({
    gridHeader: {
        backgroundColor: theme.palette.grey[200],
    },
}));

function Detail({
                    item,
                }) {
    const classes = useStyles();
    const [ history, setHistory ] = useState();
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

    return <Card>
        <CardContent>
            <Typography variant="h5" component="h2">
                {item.ingredient.name}
            </Typography>
            <div style={{height: "50vh"}}>
                <DataGrid
                    density={"compact"}
                    disableColumnMenu
                    columns={cols}
                    rows={rows}
                    pagination
                    paginationMode={"server"}
                    page={history.page}
                    pageSize={history.pageSize}
                />
            </div>
            {/*<pre>{JSON.stringify(history, null, 2)}</pre>*/}
        </CardContent>
    </Card>;
}

Detail.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        ingredient: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        }),
        quantity: PropTypes.arrayOf(PropTypes.shape({
            quantity: PropTypes.number.isRequired,
            units: PropTypes.string,
        })),
    }).isRequired,
};
export default Detail;
