import { Box, Grid } from "@mui/material";
import { GridFooterContainer, GridSlotProps } from "@mui/x-data-grid";
import Paging, { PagingProps } from "./Paging";
import SelectionStatus, { SelectionStatusProps } from "./SelectionStatus";

export default function Footer({
    selectedCount,
    onCombine,
    hasNextPage,
}: GridSlotProps["footer"] & SelectionStatusProps & PagingProps) {
    return (
        <GridFooterContainer sx={{ px: 2 }}>
            <Grid
                container
                alignItems={"center"}
                justifyContent={"space-between"}
                sx={{ flex: 1 }}
            >
                <Box>
                    <SelectionStatus
                        selectedCount={selectedCount}
                        onCombine={onCombine}
                    />
                </Box>
                <Box>
                    <Paging hasNextPage={hasNextPage} />
                </Box>
            </Grid>
        </GridFooterContainer>
    );
}
