import { Box, IconButton, Paper } from "@mui/material";
import {
    DataGrid,
    DataGridProps,
    GridColDef,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import Footer from "./Footer";
import Header from "./Header";
import React, { useMemo } from "react";
import { Result } from "../../../data/hooks/usePantryItemSearch";
import DeleteItemAction from "./DeleteItemAction";
import {
    SearchIcon as ViewDuplicatesIcon,
    SvgIconComponent,
    ViewIcon,
} from "views/common/icons";
import LabelsCell from "./LabelsCell";
import LabelsEditCell from "./LabelsEditCell";
import MultilineEditCell from "./MultilineEditCell";
import { BfsId } from "../../../global/types/identity";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";

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
        sortingOrder: ["asc", "desc"],
        description: "Shopping and/or store order",
        flex: 0.5,
        editable: false,
        align: "right",
    },
    {
        field: "duplicateCount",
        type: "number",
        headerName: "Dupes",
        sortingOrder: ["desc", "asc"],
        description: "Potential duplicate count for this item",
        width: 90,
    },
    {
        field: "firstUse",
        headerName: "First Use",
        sortingOrder: ["asc", "desc"],
        type: "date",
        flex: 0.75,
    },
    {
        field: "useCount",
        type: "number",
        headerName: "Uses",
        sortingOrder: ["desc", "asc"],
        description: "Use count for this item",
        width: 80,
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
    onViewDuplicates: (row: Result) => void;
    onDelete: (row: Result) => void;
    hasNextPage?: boolean;
    duplicatesOf?: BfsId;
};

function CellWithButton(
    params: GridRenderCellParams<Result, any, any> & {
        Icon: SvgIconComponent;
        onClick(r: Result): void;
    },
) {
    const { row, Icon, onClick, value, formattedValue } = params;
    return (
        <>
            <IconButton
                color={"primary"}
                size={"small"}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(row);
                }}
                disabled={!value}
            >
                <Icon fontSize={"small"} />
            </IconButton>{" "}
            {formattedValue}
        </>
    );
}

export default function AdminGrid({
    // passthroughs we need to intercept
    rowSelectionModel,
    // custom props
    onCombine,
    onViewUses,
    onViewDuplicates,
    onDelete,
    hasNextPage,
    duplicatesOf,
    // everything else
    ...passthrough
}: Props) {
    const columns = useMemo(() => {
        // This .map is acting as a .slice as well.
        const cs = COLUMNS.map((c) => {
            if (c.field === "useCount") {
                c = {
                    ...c,
                    renderCell: (params) => (
                        <CellWithButton
                            {...params}
                            onClick={onViewUses}
                            Icon={ViewIcon}
                        />
                    ),
                };
            } else if (c.field === "duplicateCount") {
                c = {
                    ...c,
                    renderCell: (params) => (
                        <CellWithButton
                            {...params}
                            onClick={onViewDuplicates}
                            Icon={ViewDuplicatesIcon}
                        />
                    ),
                };
            }
            return c;
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
    }, [onViewUses, onViewDuplicates, onDelete]);

    return (
        <Box
            component={Paper}
            elevation={0}
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
                getRowClassName={({ id }) =>
                    id === duplicatesOf ? "duplicates-of" : ""
                }
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
