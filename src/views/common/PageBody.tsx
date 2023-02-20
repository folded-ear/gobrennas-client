import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: "white",
        minHeight: `calc(100vh - ${theme.header.height})`,
        paddingBottom: theme.spacing(2),
    },
    hasFab: {
        paddingBottom: "6em",
    }
}));

const PageBody = ({children, hasFab, className, ...props}) => {
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

PageBody.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    hasFab: PropTypes.bool,
};

export default PageBody;
