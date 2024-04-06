import { Box, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridPaginationModel,
    GridRowSelectionModel,
    GridSortModel,
} from "@mui/x-data-grid";
import { humanStringComparator } from "../../util/comparators";
import { PageInfo } from "../../__generated__/graphql";
import Header from "./components/Header";
import Footer from "./components/Footer";

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

interface Query {
    loading?: boolean;
    data?: Row[];
    pageInfo?: PageInfo;
}

const PAGE_SIZE = 25;

export default function PantryItemAdmin() {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [], // unused, but required
        quickFilterValues: [], // what we care about
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [pageModel, setPageModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: PAGE_SIZE,
    });
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [],
    );
    const [query, setQuery] = useState<Query>({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        setQuery({ loading: true });
        const timeout = setTimeout(() => {
            const query = (filterModel.quickFilterValues || [])
                .join(" ")
                .toLowerCase();
            const matches = ALL_ROWS.filter((r) =>
                JSON.stringify(r).toLowerCase().includes(query),
            );
            if (sortModel.length > 0) {
                const f = sortModel[0].field;
                const comp =
                    sortModel[0].sort === "desc"
                        ? (a, b) => humanStringComparator(b, a)
                        : humanStringComparator;
                if (f) {
                    matches.sort((a, b) => comp(a[f], b[f]));
                }
            }
            const { page: p, pageSize: ps } = pageModel;
            const offset = p * ps;
            setQuery({
                loading: false,
                data: matches.slice(offset, offset + ps),
            });
        }, 250);
        return () => clearTimeout(timeout);
    }, [filterModel, sortModel, pageModel]);

    function toFirstPage() {
        setPageModel((m) => (m.page === 0 ? m : { ...m, page: 0 }));
    }

    function handleFilterChange(model) {
        setFilterModel(model);
        toFirstPage();
    }

    function handleSelectionChange(model) {
        setSelectionModel(model);
    }

    function handleSortChange(model) {
        setSortModel(model);
        toFirstPage();
    }

    function handleCombine() {
        if (selectionModel.length < 2) {
            // eslint-disable-next-line no-console
            console.warn("Cannot combine fewer than two items", selectionModel);
            return;
        }
        window.confirm(
            `Combine ${selectionModel.length} items?

${selectionModel.join(", ")}

You sure?`,
        );
    }

    function handleRowUpdate(newRow: Row, oldRow: Row) {
        setSaving(true);
        return new Promise<Row>((resolve, reject) => {
            setTimeout(() => {
                if (newRow.id === 15) {
                    reject("Not 15, yo!");
                } else {
                    resolve(newRow);
                }
                setSaving(false);
            }, 500);
        });
    }

    function handleRowUpdateError(error) {
        alert("Failed to save: " + error);
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
                rowCount={-1}
                autoPageSize
                paginationModel={pageModel}
                onPaginationModelChange={setPageModel}
                slots={{
                    footer: Footer as any, // should be DataGridProps["slots"]["footer"]
                    toolbar: Header,
                }}
                slotProps={{
                    footer: {
                        selectedCount: selectionModel.length,
                        onCombine: handleCombine,
                    } as any,
                }}
                loading={query.loading || saving}
                rows={query.data || []}
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={handleRowUpdateError}
            ></DataGrid>
        </Box>
    );
}
