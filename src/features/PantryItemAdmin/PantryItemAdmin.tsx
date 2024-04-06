import { Box, Button, Grid, Paper, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridPagination,
    GridPaginationModel,
    GridRowSelectionModel,
    GridSlotProps,
    GridSortModel,
    GridToolbarColumnsButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { MergeType as CombineIcon } from "@mui/icons-material";

interface Row {
    id: number;
    lastName: string;
    firstName: string | null;
    age: number | null;
}

const COLUMNS: GridColDef<Row[][number]>[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
        field: "firstName",
        headerName: "First name",
        flex: 1,
        editable: true,
    },
    {
        field: "lastName",
        headerName: "Last name",
        flex: 1,
        editable: true,
    },
    {
        field: "age",
        headerName: "Age",
        type: "number",
        flex: 0.5,
        editable: true,
    },
    {
        field: "fullName",
        headerName: "Full name",
        description: "This column has a value getter and is not sortable.",
        flex: 2,
        sortable: false,
        valueGetter: (_value, row) =>
            `${row.firstName || ""} ${row.lastName || ""}`,
    },
];

const ALL_ROWS: Row[] = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
    { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
    { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
    { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];
for (let i = 0; i < 5; i++) {
    ALL_ROWS.push(
        ...ALL_ROWS.map((r) => ({ ...r, id: r.id + ALL_ROWS.length })),
    );
}

interface PageProps {
    selectedCount: number;
    onCombine: () => void;
}

function CustomPagination({
    selectedCount,
    onCombine,
    ...passthrough
}: GridSlotProps["pagination"] & PageProps) {
    return (
        <Grid
            container
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={{ flex: 1 }}
        >
            <Box>
                {onCombine && selectedCount > 0 && (
                    <Tooltip title={"Combine items, and update references"}>
                        <Button
                            disabled={selectedCount < 2}
                            onClick={onCombine}
                            variant={"text"}
                            size={"small"}
                            startIcon={<CombineIcon />}
                        >
                            Combine
                        </Button>
                    </Tooltip>
                )}
            </Box>
            <GridPagination
                {...passthrough}
                labelDisplayedRows={() => undefined}
            />
        </Grid>
    );
}

function QuickSearchToolbar() {
    return (
        <Grid
            sx={{
                p: 0.5,
            }}
            container
            justifyContent={"space-between"}
            alignItems={"flex-end"}
        >
            <Typography variant={"h3"} component={"h1"}>
                Pantry Item Admin
            </Typography>
            <GridToolbarColumnsButton />
            <GridToolbarQuickFilter />
        </Grid>
    );
}

export default function PantryItemAdmin() {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [pageModel, setPageModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [],
    );
    const [rows, setRows] = useState<Row[]>([]);
    useEffect(() => {
        const timeout = setTimeout(() => {
            const { page: p, pageSize: ps } = pageModel;
            const offset = p * ps;
            // the 'after' cursor atob("offset-" + offset)
            setRows(ALL_ROWS.slice(offset, ps));
        }, 250);
        return () => clearTimeout(timeout);
    }, [pageModel]);

    function handlePaginationChange(model: GridPaginationModel) {
        setPageModel(model);
    }

    function handleFilterChange(model: GridFilterModel) {
        setFilterModel(model);
    }

    function handleSortChange(model: GridSortModel) {
        setSortModel(model);
    }

    function handleSelectionChange(model: GridRowSelectionModel) {
        setSelectionModel(model);
    }

    function handleCombine() {
        alert("You sure?");
    }

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
                keepNonExistentRowsSelected
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={handleSelectionChange}
                filterMode={"server"}
                filterDebounceMs={250}
                filterModel={filterModel}
                onFilterModelChange={handleFilterChange}
                sortingMode={"server"}
                sortModel={sortModel}
                onSortModelChange={handleSortChange}
                paginationMode={"server"}
                paginationModel={pageModel}
                onPaginationModelChange={handlePaginationChange}
                slots={{
                    pagination: CustomPagination as any, // should be 'DataGridProps["slots"]["pagination"]'
                    toolbar: QuickSearchToolbar,
                }}
                slotProps={{
                    pagination: {
                        selectedCount: selectionModel.length,
                        onCombine: handleCombine,
                    } as any,
                }}
                rows={rows}
                loading={rows.length === 0}
            ></DataGrid>
        </Box>
    );
}
