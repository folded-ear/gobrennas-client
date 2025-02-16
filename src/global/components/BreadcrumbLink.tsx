import { ForwardIcon } from "@/views/common/icons";
import { Button } from "@mui/material";
import * as React from "react";
import { Link } from "react-router-dom";

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
                endIcon={<ForwardIcon />}
                size="small"
            >
                {text}
            </Button>
        </>
    );
};
