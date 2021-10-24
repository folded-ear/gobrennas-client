import { Typography } from "@material-ui/core";
import React, { Component } from "react";
import PageBody from "./PageBody";

class NotFound extends Component {
    render() {
        return (
            <PageBody className="page-not-found">
                <Typography variant={"h2"}>
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
