import {
    gridPaginationModelSelector,
    gridRowCountSelector,
    gridRowsLoadingSelector,
    useGridApiContext,
    useGridSelector,
} from "@mui/x-data-grid";
import { Grid, IconButton } from "@mui/material";
import {
    NavigateBefore as PrevPageIcon,
    NavigateNext as NextPageIcon,
} from "@mui/icons-material";
import React from "react";

export default function Paging() {
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
    );
}
