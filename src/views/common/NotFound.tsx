import { Typography } from "@mui/material";
import { Component } from "react";
import PageBody from "./PageBody";

class NotFound extends Component {
    render() {
        return (
            <PageBody className="page-not-found" sx={{ py: 2 }}>
                <Typography variant={"h2"} sx={{ mb: 1 }}>
                    404 - Not Found
                </Typography>
                <Typography variant={"body1"}>
                    Sorry man, this page isn&apos;t a thing.
                </Typography>
            </PageBody>
        );
    }
}

export default NotFound;
