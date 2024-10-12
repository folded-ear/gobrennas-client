import { useCallback, useEffect, useState } from "react";
import {
    GridColumnVisibilityModel,
    GridFilterModel,
    GridPaginationModel,
    GridRowSelectionModel,
    GridSortModel,
} from "@mui/x-data-grid";
import {
    Result,
    usePantryItemSearch,
    Variables,
} from "@/data/hooks/usePantryItemSearch";
import { SortDir } from "@/__generated__/graphql";
import AdminGrid from "./components/AdminGrid";
import { useRenamePantryItem } from "@/data/hooks/useRenamePantryItem";
import { useCombinePantryItems } from "@/data/hooks/useCombinePantryItems";
import { useDeletePantryItem } from "@/data/hooks/useDeletePantryItem";
import ConfirmDialog, { DialogProps } from "./components/ConfirmDialog";
import ViewUses from "./components/ViewUses";
import { useSetPantryItemLabels } from "@/data/hooks/useSetPantryItemLabels";
import { useSetPantryItemSynonyms } from "@/data/hooks/useSetPantryItemSynonyms";
import { ensureString } from "@/global/types/identity";

const DUPLICATE_PREFIX = "duplicates:";

const useErrorAlert = (error, setDialog) =>
    useEffect(() => {
        if (error)
            setDialog({
                open: true,
                title: "Error!",
                content: error?.toString() || "unknown",
                onClose: () => setDialog(undefined),
            });
        else setDialog(undefined);
    }, [error, setDialog]);

export default function PantryItemAdmin() {
    const [dialog, setDialog] = useState<DialogProps>();

    const [queryOptions, setQueryOptions] = useState<Variables>({});
    const [duplicatesOf, setDuplicatesOf] = useState<string>();

    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [], // unused, but required
        quickFilterValues: [], // what we care about
    });
    useEffect(() => {
        setQueryOptions((opts) => ({
            ...opts,
            query: filterModel.quickFilterValues?.join(" ") || "",
        }));
        setDuplicatesOf(
            filterModel.quickFilterValues
                ?.filter((it) => (it as string).startsWith(DUPLICATE_PREFIX))
                .map((it) =>
                    (it as string).substring(DUPLICATE_PREFIX.length),
                )[0],
        );
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
    useErrorAlert(error, setDialog);

    const toFirstPage = useCallback(() => {
        setPageModel((m) => (m.page === 0 ? m : { ...m, page: 0 }));
    }, []);

    const handleFilterChange = useCallback(
        (model) => {
            setFilterModel(model);
            toFirstPage();
        },
        [toFirstPage],
    );

    const handleSortChange = useCallback(
        (model) => {
            setSortModel(model);
            toFirstPage();
        },
        [toFirstPage],
    );

    const [renameItem, { loading: renaming, error: renameError }] =
        useRenamePantryItem();
    useErrorAlert(renameError, setDialog);

    const [setLabels, { loading: settingLabels, error: setLabelsError }] =
        useSetPantryItemLabels();
    useErrorAlert(setLabelsError, setDialog);
    const [setSynonyms, { loading: settingSynonyms, error: setSynonymsError }] =
        useSetPantryItemSynonyms();
    useErrorAlert(setSynonymsError, setDialog);

    const handleRowUpdate = useCallback(
        async (newRow: Result, oldRow: Result) => {
            if (oldRow.name !== newRow.name) {
                const saved = await renameItem(newRow.id, newRow.name);
                return {
                    ...newRow,
                    name: saved.name,
                    synonyms: saved.synonyms,
                };
            }
            const stringSetUpdaters = {
                labels: setLabels,
                synonyms: setSynonyms,
            };
            for (const key in stringSetUpdaters) {
                const oldSet = new Set(oldRow[key]);
                const newSet = new Set(newRow[key]);
                if (
                    oldSet.size !== newSet.size ||
                    [...oldSet].some((l) => !newSet.has(l))
                ) {
                    const saved = await stringSetUpdaters[key](newRow.id, [
                        ...newSet,
                    ]);
                    return {
                        ...newRow,
                        [key]: saved[key],
                    };
                }
            }
            return oldRow;
        },
        [renameItem, setLabels, setSynonyms],
    );

    const handleRowUpdateError = useCallback((error) => {
        alert("Failed to save: " + error);
    }, []);

    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [],
    );

    const handleSelectionChange = useCallback((model) => {
        setSelectionModel(model);
    }, []);

    const [combineItems, { loading: combining, error: combineError }] =
        useCombinePantryItems();
    useErrorAlert(combineError, setDialog);

    const handleCombine = useCallback(() => {
        if (selectionModel.length < 2) {
            // eslint-disable-next-line no-console
            console.warn("Cannot combine fewer than two items", selectionModel);
            return;
        }
        const confirmMsg = `Irrevocably combine these ${selectionModel.length} selected items?`;
        if (!window.confirm(confirmMsg)) return;
        combineItems(selectionModel.map(ensureString))
            .then(() => {
                refetch();
                setSelectionModel([]);
            })
            .catch((error) => alert(error));
    }, [combineItems, refetch, selectionModel]);

    const handleViewUses = useCallback((row: Result) => {
        setDialog({
            open: true,
            title: `Uses of '${row.name}'`,
            content: <ViewUses row={row} />,
            onClose: () => setDialog(undefined),
        });
    }, []);

    const handleViewDuplicate = useCallback(
        (row: Result) => {
            setFilterModel((m) => ({
                ...m,
                quickFilterValues: [DUPLICATE_PREFIX + row.id],
            }));
            toFirstPage();
        },
        [toFirstPage],
    );

    const [deleteItem, { loading: deleting, error: deleteError }] =
        useDeletePantryItem();
    useErrorAlert(deleteError, setDialog);
    const handleDelete = useCallback(
        (row: Result) => {
            setDialog({
                open: true,
                title: `Delete '${row.name}'?`,
                content: "This action cannot be undone.",
                confirmLabel: "Delete",
                onClose: (confirmed) => {
                    setDialog(undefined);
                    confirmed &&
                        deleteItem(row.id).then(() => {
                            refetch();
                        });
                },
            });
        },
        [deleteItem, refetch],
    );

    return (
        <>
            <AdminGrid
                columnVisibilityModel={columnVizModel}
                onColumnVisibilityModelChange={setColumnVizModel}
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={handleSelectionChange}
                filterModel={filterModel}
                duplicatesOf={duplicatesOf}
                onFilterModelChange={handleFilterChange}
                sortModel={sortModel}
                onSortModelChange={handleSortChange}
                paginationModel={pageModel}
                onPaginationModelChange={setPageModel}
                loading={
                    loading ||
                    renaming ||
                    combining ||
                    deleting ||
                    settingLabels ||
                    settingSynonyms
                }
                rows={data?.results || []}
                hasNextPage={data?.pageInfo.hasNextPage}
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={handleRowUpdateError}
                onCombine={handleCombine}
                onViewUses={handleViewUses}
                onViewDuplicates={handleViewDuplicate}
                onDelete={handleDelete}
            />
            <ConfirmDialog {...dialog} />
        </>
    );
}
