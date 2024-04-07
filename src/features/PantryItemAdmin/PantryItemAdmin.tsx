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
import { useRenamePantryItem } from "../../data/hooks/useRenamePantryItem";
import { useCombinePantryItems } from "../../data/hooks/useCombinePantryItems";

const useErrorAlert = (error) =>
    useEffect(() => {
        if (error) alert("Error!\n\n" + error);
    }, [error]);

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
            labels: false,
            storeOrder: false,
            firstUse: false,
        });

    const { loading, error, data, refetch } = usePantryItemSearch(queryOptions);
    useErrorAlert(error);

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

    const [renameItem, { loading: renaming, error: renameError }] =
        useRenamePantryItem();
    useErrorAlert(renameError);

    async function handleRowUpdate(newRow: Result, oldRow: Result) {
        if (oldRow.name !== newRow.name) {
            const saved = await renameItem(newRow.id, newRow.name);
            return {
                ...newRow,
                name: saved.name,
                synonyms: saved.synonyms,
            };
        }
        return newRow;
    }

    function handleRowUpdateError(error) {
        alert("Failed to save: " + error);
    }

    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [],
    );

    function handleSelectionChange(model) {
        setSelectionModel(model);
    }

    const [combineItems, { loading: combining, error: combineError }] =
        useCombinePantryItems();
    useErrorAlert(combineError);

    function handleCombine() {
        if (selectionModel.length < 2) {
            // eslint-disable-next-line no-console
            console.warn("Cannot combine fewer than two items", selectionModel);
            return;
        }
        const confirmMsg = `Irrevocably combine these ${selectionModel.length} selected items?`;
        if (!window.confirm(confirmMsg)) return;
        combineItems(selectionModel.map((id) => id.toString()))
            .then(() => {
                refetch();
                setSelectionModel([]);
            })
            .catch((error) => alert(error));
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
            loading={loading || renaming || combining}
            rows={data?.results || []}
            hasNextPage={data?.pageInfo.hasNextPage}
            processRowUpdate={handleRowUpdate}
            onProcessRowUpdateError={handleRowUpdateError}
            onCombine={handleCombine}
        />
    );
}
