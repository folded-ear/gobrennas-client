import { Container } from "@mui/material";
import { makeStyles } from "@mui/styles";
import classnames from "classnames";
import React from "react";
import { HEADER_HEIGHT } from "../../constants/layout";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: "white",
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        paddingBottom: theme.spacing(2),
    },
    hasFab: {
        paddingBottom: theme.spacing(7),
    }
}));

type PageBodyProps = {
    children: any,
    hasFab?: boolean,
    className?: string,
    id?: string,
}

const PageBody: React.FC<PageBodyProps> = ({children, hasFab, className, ...props}) => {
    const classes = useStyles();
    return <Container
        className={classnames(classes.root, className, {
            [classes.hasFab]: hasFab,
        })}
        {...props}
    >
        {children}
    </Container>;
};

export default PageBody;
