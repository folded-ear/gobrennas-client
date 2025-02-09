import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import React from "react";
import { ForwardIcon } from "@/views/common/icons";

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
