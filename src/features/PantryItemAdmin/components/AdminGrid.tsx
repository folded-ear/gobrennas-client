import { Box, Paper } from "@mui/material";
import {
    DataGrid,
    DataGridProps,
    GRID_CHECKBOX_SELECTION_COL_DEF,
    GridColDef,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import Footer from "./Footer";
import Header from "./Header";
import React, { useMemo } from "react";
import { Result } from "../../../data/hooks/usePantryItemSearch";
import DeleteItemAction from "./DeleteItemAction";
import ViewUsesAction from "./ViewUsesAction";

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
        flex: 1.5,
        sortable: false,
        valueFormatter: formatStringSet,
        valueParser: parseStringSet,
    },
    {
        field: "labels",
        headerName: "Labels",
        type: "string",
        flex: 1,
        sortable: false,
        valueFormatter: formatStringSet,
        valueParser: parseStringSet,
    },
    {
        field: "storeOrder",
        headerName: "Shop",
        headerAlign: "right",
        description: "Shopping and/or store order",
        flex: 0.5,
        editable: false,
        align: "right",
    },
    {
        field: "useCount",
        type: "number",
        headerName: "Uses",
        description: "Use count for this item",
        flex: 0.5,
        sortable: true,
    },
    {
        field: "firstUse",
        headerName: "First Use",
        type: "date",
        sortable: true,
        flex: 0.75,
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
    // custom props
    onCombine: () => void;
    onViewUses: (row: Result) => void;
    onDelete: (row: Result) => void;
    hasNextPage?: boolean;
};

export default function AdminGrid({
    rowSelectionModel,
    onCombine,
    onViewUses,
    onDelete,
    hasNextPage,
    ...passthrough
}: Props) {
    const columns = useMemo(() => {
        const cs = COLUMNS.slice();
        cs.unshift({
            ...GRID_CHECKBOX_SELECTION_COL_DEF,
            // don't show the 'select all' checkbox
            renderHeader: () => null,
        });
        cs.push({
            field: "Actions",
            headerName: "",
            type: "actions",
            getActions: ({ row }) => [
                <ViewUsesAction row={row} onViewUses={() => onViewUses(row)} />,
                <DeleteItemAction row={row} onDelete={() => onDelete(row)} />,
            ],
        });
        return cs;
    }, [onViewUses, onDelete]);

    return (
        <Box
            component={Paper}
            sx={{
                height: "95vh",
                width: "100%",
            }}
        >
            <DataGrid
                columns={columns}
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
                        hasNextPage,
                    } as any,
                }}
                {...passthrough}
            />
        </Box>
    );
}
