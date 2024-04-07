import { Box, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
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
    QueryOptions,
    Result,
    usePantryItemSearch,
} from "../../data/hooks/usePantryItemSearch";
import { SortDir } from "../../__generated__/graphql";

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

export default function PantryItemAdmin() {
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
        pageSize: 0,
    });
    const [queryOptions, setQueryOptions] = useState<QueryOptions>({});
    useEffect(() => {
        setQueryOptions((opts) => ({
            ...opts,
            query: filterModel.quickFilterValues?.join(" ") || "",
        }));
    }, [filterModel]);
    useEffect(() => {
        setQueryOptions((opts) => ({
            ...opts,
            sortBy: sortModel[0]?.field,
            sortDir: sortModel[0]?.sort === "desc" ? SortDir.Desc : SortDir.Asc,
        }));
    }, [sortModel]);
    useEffect(() => {
        setQueryOptions((opts) => {
            return {
                ...opts,
                ...pageModel,
            };
        });
    }, [pageModel]);
    const { loading, error, data } = usePantryItemSearch(queryOptions);
    useEffect(() => {
        if (error) alert("Error!\n\n" + error);
    }, [error]);
    const { results, pageInfo } = data || {};
    const query = { loading, data: results, pageInfo };
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [],
    );
    const [saving, setSaving] = useState(false);

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
