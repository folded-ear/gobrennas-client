import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import * as React from "react";
import { ArrowForward } from "@mui/icons-material";

type BreadcrumbLinkProps = {
    text: string;
    url: string;
};

export const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({
    url,
    text,
}) => {
    return (
        <>
            <Button
                component={Link}
                variant="text"
                to={url}
                endIcon={<ArrowForward />}
                size="small"
            >
                {text}
            </Button>
        </>
    );
};
