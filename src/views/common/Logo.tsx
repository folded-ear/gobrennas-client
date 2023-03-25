import { makeStyles } from "@mui/styles";
import React, { ComponentType } from "react";

const useStyles = makeStyles(theme => ({
        root: {
            fontSize: "3em",
            color: "white",
            fontWeight: "bold",
            margin: ({ small }: {small: boolean}) => small
                ? theme.spacing(1, 2, 1, 0)
                : theme.spacing(3, 6, 3, 0),
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

interface Props<P> {
    version?: "small",
    component?: ComponentType<P> | string,

    [__prop: string]: any // for whatever stuff the component wants
}

const Logo: React.FC<Props<any>> = ({
                                        version,
                                        component = "div",
                                        ...props
                                    }) => {
    const small = version === "small";
    const classes = useStyles({
        small,
    });
    return React.createElement(component, {
        ...props,
        className: classes.root,
    }, [
        <span key="B" className={classes.B}>B</span>,
        small ? "F" : "FoodSoftware",
    ]);
};

export default Logo;
