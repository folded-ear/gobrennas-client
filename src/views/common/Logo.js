import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const styles = makeStyles(theme => ({
        root: {
            fontSize: "3em",
            color: "white",
            fontWeight: "bold",
            margin: theme.spacing(3),
            // marginRight: theme.spacing(8),
            fontFamily: "Stint Ultra Condensed",
            whiteSpace: "nowrap",
        },
        F: {
            transform: "scaleX(-1)",
            display: "inline-block",
        }
    })
);

const Logo = (props) => {
    const classes = styles();
    const {
        version,
        component = "div",
        ...ptps
    } = props;
    return React.createElement(component, {
        ...ptps,
        className: ptps.hasOwnProperty("className")
            ? ptps.className + " " + classes.root
            : classes.root,
    }, [
        <span key="F" className={classes.F}>F</span>,
        version && version === "small" ? "F" : "Foodinger",
    ]);
};

export default Logo;