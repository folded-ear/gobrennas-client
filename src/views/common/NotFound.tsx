import { Box, Typography } from "@mui/material";
import PageBody from "./PageBody";
import { PropsWithChildren } from "react";

export default function NotFound({ children }: PropsWithChildren) {
    return (
        <PageBody className="page-not-found" sx={{ py: 2 }}>
            <Typography variant={"h2"} sx={{ mb: 1 }}>
                404 - Not Found
            </Typography>
            <Typography variant={"body1"}>
                Sorry man, this page isn&apos;t a thing.
            </Typography>
            {children && <Box my={5}>{children}</Box>}
        </PageBody>
    );
}
