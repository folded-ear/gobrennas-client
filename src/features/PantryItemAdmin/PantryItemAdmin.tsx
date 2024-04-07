import { Box, Paper } from "@mui/material";
import React, { useState } from "react";
import {
    DataGrid,
    GridColDef,
    GridColumnVisibilityModel,
    GridFilterModel,
    GridPaginationModel,
    GridRowSelectionModel,
    GridSortModel,
} from "@mui/x-data-grid";
import Header from "./components/Header";
import Footer from "./components/Footer";
import {
    Result,
    usePantryItemSearch,
} from "../../data/hooks/usePantryItemSearch";

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
        flex: 0.5,
        editable: false,
    },
    {
        field: "useCounts",
        headerName: "Uses",
        description: "Use count for this item: your / everyone's",
        flex: 0.5,
        editable: false,
        sortable: false,
        valueGetter: (_value, row) =>
            `${row.myUseCount || 0} / ${row.allUseCount || 0}`,
    },
    {
        field: "firstUse",
        headerName: "First Use",
        type: "date",
        flex: 1,
    },
];

export default function PantryItemAdmin() {
    const { loading, error, data } = usePantryItemSearch("");
    const { results, pageInfo } = data || {};
    const query = { loading, data: results, pageInfo };

    // todo: put colViz in a preference
    const [columnVizModel, setColumnVizModel] =
        useState<GridColumnVisibilityModel>({
            id: false,
            firstUse: false,
            storeOrder: false,
        });
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [], // unused, but required
        quickFilterValues: [], // what we care about
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [pageModel, setPageModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [],
    );
    const [saving, setSaving] = useState(false);
    // const [query, setQuery] = useState<Query>({});
    // useEffect(() => {
    //     setQuery({ loading: true });
    //     const timeout = setTimeout(() => {
    //         const query = (filterModel.quickFilterValues || [])
    //             .join(" ")
    //             .toLowerCase();
    //         const matches = ALL_ROWS.filter((r) =>
    //             JSON.stringify(r).toLowerCase().includes(query),
    //         );
    //         if (sortModel.length > 0) {
    //             const f = sortModel[0].field;
    //             const comp =
    //                 sortModel[0].sort === "desc"
    //                     ? (a, b) => humanStringComparator(b, a)
    //                     : humanStringComparator;
    //             if (f) {
    //                 matches.sort((a, b) => comp(a[f], b[f]));
    //             }
    //         }
    //         const { page: p, pageSize: ps } = pageModel;
    //         const offset = p * ps;
    //         setQuery({
    //             loading: false,
    //             data: matches.slice(offset, offset + ps),
    //         });
    //     }, 250);
    //     return () => clearTimeout(timeout);
    // }, [filterModel, sortModel, pageModel]);

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

    function handleRowUpdate(newRow: Result, oldRow: Result) {
        setSaving(true);
        return new Promise<Result>((resolve, reject) => {
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
                columnVisibilityModel={columnVizModel}
                onColumnVisibilityModelChange={setColumnVizModel}
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
