import { Box, IconButton, Paper } from "@mui/material";
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
import { VisibilityOutlined as ViewUsesIcon } from "@mui/icons-material";
import LabelsCell from "./LabelsCell";
import LabelsEditCell from "./LabelsEditCell";
import MultilineEditCell from "./MultilineEditCell";

const formatStringSet = (value: string[]) => (value ? value.join(", ") : "");

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
        editable: true,
        renderCell: (params) => formatStringSet(params.value),
        renderEditCell: (params) => <MultilineEditCell {...params} />,
    },
    {
        field: "labels",
        headerName: "Labels",
        type: "string",
        flex: 1,
        sortable: false,
        editable: true,
        renderCell: (params) => <LabelsCell {...params} />,
        renderEditCell: (params) => <LabelsEditCell {...params} />,
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
        type: "string",
        headerName: "Uses",
        description: "Use count for this item",
        align: "right",
        width: 80,
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
        // This .map is acting as a .slice as well.
        const cs = COLUMNS.map((c) => {
            if (c.field === "useCount") {
                c = {
                    ...c,
                    renderCell: ({ row, formattedValue }) => (
                        <>
                            {formattedValue}{" "}
                            <IconButton
                                color={"primary"}
                                size={"small"}
                                onClick={() => onViewUses(row)}
                                disabled={row.useCount === 0}
                            >
                                <ViewUsesIcon fontSize={"small"} />
                            </IconButton>
                        </>
                    ),
                };
            }
            return c;
        });
        cs.unshift({
            ...GRID_CHECKBOX_SELECTION_COL_DEF,
            // don't show the 'select all' checkbox
            renderHeader: () => null,
        });
        cs.push({
            field: "actions",
            headerName: "Actions",
            type: "actions",
            width: 30,
            renderHeader: () => null,
            getActions: ({ row }) => [
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
