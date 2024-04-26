import {
    gridPaginationModelSelector,
    gridRowCountSelector,
    gridRowsLoadingSelector,
    useGridApiContext,
    useGridSelector,
} from "@mui/x-data-grid";
import { Grid, IconButton } from "@mui/material";
import { NextPageIcon, PrevPageIcon } from "views/common/icons";
import React from "react";

export interface PagingProps {
    hasNextPage?: boolean;
}

export default function Paging({ hasNextPage }: PagingProps) {
    const apiRef = useGridApiContext();
    const model = useGridSelector(apiRef, gridPaginationModelSelector);
    const loading = useGridSelector(apiRef, gridRowsLoadingSelector);
    const rowCount = useGridSelector(apiRef, gridRowCountSelector);
    const start = model.page * model.pageSize + 1;
    const end = Math.min(
        start + rowCount - 1,
        (model.page + 1) * model.pageSize,
    );
    const showPaging = !loading && (model.page > 0 || rowCount > 0);

    return (
        <Grid container gap={1} alignItems={"center"}>
            {showPaging && (
                <>
                    {start} – {end} of {hasNextPage ? "many" : end}
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
                disabled={!showPaging || !hasNextPage}
                title={"Go to next page"}
                onClick={() => apiRef.current.setPage(model.page + 1)}
            >
                <NextPageIcon />
            </IconButton>
        </Grid>
    );
}
