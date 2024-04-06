import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridPaginationModel,
    gridPaginationModelSelector,
    gridRowCountSelector,
    GridRowSelectionModel,
    gridRowsLoadingSelector,
    GridSlotProps,
    GridSortModel,
    GridToolbarColumnsButton,
    GridToolbarQuickFilter,
    useGridApiContext,
    useGridSelector,
} from "@mui/x-data-grid";
import {
    MergeType as CombineIcon,
    NavigateBefore as PrevPageIcon,
    NavigateNext as NextPageIcon,
} from "@mui/icons-material";
import { humanStringComparator } from "../../util/comparators";
import { PageInfo } from "../../__generated__/graphql";

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

interface PagerProps {
    selectedCount: number;
    onCombine: () => void;
}

function CustomPagination({
    selectedCount,
    onCombine,
}: GridSlotProps["footer"] & PagerProps) {
    const apiRef = useGridApiContext();
    const model = useGridSelector(apiRef, gridPaginationModelSelector);
    const loading = useGridSelector(apiRef, gridRowsLoadingSelector);
    const rowCount = useGridSelector(apiRef, gridRowCountSelector);
    const start = model.page * model.pageSize + 1;
    const end = Math.min(
        start + rowCount - 1,
        (model.page + 1) * model.pageSize,
    );
    const fullPage = rowCount === model.pageSize;
    const showPaging = !loading && (model.page > 0 || rowCount > 0);
    return (
        <Grid
            container
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={{ flex: 1 }}
        >
            <Box>
                {onCombine && selectedCount > 0 && (
                    <Button
                        disabled={selectedCount < 2}
                        onClick={onCombine}
                        variant={"text"}
                        size={"small"}
                        startIcon={<CombineIcon />}
                        title={"Combine items, and update references"}
                    >
                        Combine
                    </Button>
                )}
            </Box>
            <Box>
                <Grid container gap={1} alignItems={"center"}>
                    {showPaging && (
                        <>
                            {start}-{end} of {fullPage ? `${end + 1}+` : end}
                        </>
                    )}
                    <IconButton
                        disabled={!showPaging || model.page === 0}
                        title={"Go to previous page"}
                        onClick={() => apiRef.current.setPage(model.page - 1)}
                    >
                        <PrevPageIcon />
                    </IconButton>
                    <IconButton
                        disabled={!showPaging || !fullPage}
                        title={"Go to next page"}
                        onClick={() => apiRef.current.setPage(model.page + 1)}
                    >
                        <NextPageIcon />
                    </IconButton>
                </Grid>
            </Box>
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
                    pagination: CustomPagination as any, // should be 'DataGridProps["slots"]["pagination"]'
                    toolbar: QuickSearchToolbar,
                }}
                slotProps={{
                    pagination: {
                        selectedCount: selectionModel.length,
                        onCombine: handleCombine,
                    } as any,
                }}
                rows={query.data || []}
                loading={query.loading}
            ></DataGrid>
        </Box>
    );
}
