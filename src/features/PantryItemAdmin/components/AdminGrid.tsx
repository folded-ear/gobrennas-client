import { Box, Paper } from "@mui/material";
import {
    DataGrid,
    DataGridProps,
    GridColDef,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import Footer from "./Footer";
import Header from "./Header";
import React from "react";
import { Result } from "../../../data/hooks/usePantryItemSearch";

const formatStringSet = (value: string[]) => value.join(", ");
const parseStringSet = (value: string) =>
    value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

const COLUMNS: GridColDef<Result[][number]>[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
        field: "name",
        headerName: "Name",
        flex: 1,
        editable: true,
    },
    {
        field: "synonyms",
        headerName: "Synonyms",
        type: "string",
        flex: 2,
        editable: true,
        sortable: false,
        valueFormatter: formatStringSet,
        valueParser: parseStringSet,
    },
    {
        field: "labels",
        headerName: "Labels",
        type: "string",
        flex: 2,
        editable: true,
        sortable: false,
        valueFormatter: formatStringSet,
        valueParser: parseStringSet,
    },
    {
        field: "storeOrder",
        headerName: "Shop",
        description: "Shopping and/or store order",
        flex: 0.75,
        editable: false,
    },
    {
        field: "useCounts",
        headerName: "Uses",
        headerAlign: "right",
        description: "Use count for this item: total (yours)",
        flex: 0.75,
        editable: false,
        sortable: true,
        align: "right",
        valueGetter: (_value, row) => {
            const all = `${row.allUseCount || 0}`;
            return row.myUseCount ? all + ` (${row.myUseCount})` : all;
        },
    },
    {
        field: "firstUse",
        headerName: "First Use",
        type: "date",
        flex: 1,
    },
];

type Props = Pick<
    DataGridProps,
    | "columnVisibilityModel"
    | "onColumnVisibilityModelChange"
    | "onRowSelectionModelChange"
    | "filterModel"
    | "onFilterModelChange"
    | "sortModel"
    | "onSortModelChange"
    | "paginationModel"
    | "onPaginationModelChange"
    | "loading"
    | "rows"
    | "processRowUpdate"
    | "onProcessRowUpdateError"
> & {
    // want slightly tighter control over this type
    rowSelectionModel: GridRowSelectionModel;
    // custom prop
    onCombine: () => void;
};

export default function AdminGrid({
    rowSelectionModel,
    onCombine,
    ...passthrough
}: Props) {
    return (
        <Box
            component={Paper}
            sx={{
                height: "95vh",
                width: "100%",
            }}
        >
            <DataGrid
                columns={COLUMNS}
                disableColumnFilter
                disableDensitySelector
                disableColumnMenu
                disableColumnSelector={false}
                density={"compact"}
                disableRowSelectionOnClick
                checkboxSelection
                rowSelectionModel={rowSelectionModel}
                filterMode={"server"}
                filterDebounceMs={250}
                sortingMode={"server"}
                paginationMode={"server"}
                rowCount={-1}
                autoPageSize
                slots={{
                    footer: Footer as any, // should be DataGridProps["slots"]["footer"],
                    toolbar: Header,
                }}
                slotProps={{
                    footer: {
                        selectedCount: rowSelectionModel.length,
                        onCombine,
                    } as any,
                }}
                {...passthrough}
            />
        </Box>
    );
}
