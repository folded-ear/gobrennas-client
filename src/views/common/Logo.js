import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles(theme => ({
        root: {
            fontSize: "3em",
            color: "white",
            fontWeight: "bold",
            margin: ({small}) =>
                theme.spacing(small ? 1 : 3),
            marginRight: ({small}) =>
                theme.spacing(small ? 2 : 6),
            fontFamily: "Stint Ultra Condensed",
            whiteSpace: "nowrap",
            textDecoration: "none",
        },
        B: {
            transform: "scaleX(-1)",
            display: "inline-block",
            color: "#d3b8ae",
        },
    })
);

const Logo = (props) => {
    const {
        version,
        component = "div",
        ...ptps
    } = props;
    const small = version === "small";
    const classes = useStyles({
        small,
    });
    return React.createElement(component, {
        ...ptps,
        className: classes.root,
    }, [
        <span key="B" className={classes.B}>B</span>,
        small ? "F" : "FoodSoftware",
    ]);
};

Logo.propTypes = {
    version: PropTypes.string,
    component: PropTypes.object,
};

export default Logo;
