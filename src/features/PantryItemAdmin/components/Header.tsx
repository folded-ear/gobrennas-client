import { Stack, Typography } from "@mui/material";
import {
    GridToolbarColumnsButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";

export default function Header() {
    return (
        <Stack
            sx={{
                p: 0.5,
            }}
            gap={4}
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"flex-end"}
        >
            <Stack direction={"row"} alignItems={"flex-end"} gap={1}>
                <Typography variant={"h3"} component={"h1"}>
                    Pantry Item Admin
                </Typography>
                <GridToolbarColumnsButton />
            </Stack>
            <GridToolbarQuickFilter />
        </Stack>
    );
}
