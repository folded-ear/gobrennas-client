import React, { useEffect, useState } from "react";
import {
    GridColumnVisibilityModel,
    GridFilterModel,
    GridPaginationModel,
    GridRowSelectionModel,
    GridSortModel,
} from "@mui/x-data-grid";
import {
    QueryOptions,
    Result,
    usePantryItemSearch,
} from "../../data/hooks/usePantryItemSearch";
import { SortDir } from "../../__generated__/graphql";
import AdminGrid from "./components/AdminGrid";

export default function PantryItemAdmin() {
    const [queryOptions, setQueryOptions] = useState<QueryOptions>({});

    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [], // unused, but required
        quickFilterValues: [], // what we care about
    });
    useEffect(() => {
        setQueryOptions((opts) => ({
            ...opts,
            query: filterModel.quickFilterValues?.join(" ") || "",
        }));
    }, [filterModel]);

    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    useEffect(() => {
        setQueryOptions((opts) => ({
            ...opts,
            sortBy: sortModel[0]?.field,
            sortDir: sortModel[0]?.sort === "desc" ? SortDir.Desc : SortDir.Asc,
        }));
    }, [sortModel]);

    const [pageModel, setPageModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 0, // zero blocks loading (until auto-size happens)
    });
    useEffect(() => {
        setQueryOptions((opts) => {
            return {
                ...opts,
                ...pageModel,
            };
        });
    }, [pageModel]);

    // todo: put colViz in a preference
    const [columnVizModel, setColumnVizModel] =
        useState<GridColumnVisibilityModel>({
            id: false,
            firstUse: false,
            storeOrder: false,
        });

    const { loading, error, data } = usePantryItemSearch(queryOptions);
    useEffect(() => {
        if (error) alert("Error!\n\n" + error);
    }, [error]);

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

    function handleSortChange(model) {
        setSortModel(model);
        toFirstPage();
    }

    function handleSelectionChange(model) {
        setSelectionModel(model);
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
        <AdminGrid
            columnVisibilityModel={columnVizModel}
            onColumnVisibilityModelChange={setColumnVizModel}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={handleSelectionChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterChange}
            sortModel={sortModel}
            onSortModelChange={handleSortChange}
            paginationModel={pageModel}
            onPaginationModelChange={setPageModel}
            loading={loading || saving}
            rows={data?.results || []}
            processRowUpdate={handleRowUpdate}
            onProcessRowUpdateError={handleRowUpdateError}
            onCombine={handleCombine}
        />
    );
}
