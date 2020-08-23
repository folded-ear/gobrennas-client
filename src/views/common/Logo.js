import React from "react";
import {makeStyles} from "@material-ui/core/styles";

const styles = makeStyles(theme => ({
        root: {
            fontSize: "3em",
            color: "white",
            fontWeight: "bold",
            margin: theme.spacing(3),
            paddingRight: theme.spacing(5),
            fontFamily: "Stint Ultra Condensed",
        },
        F: {
            transform: "scaleX(-1)",
            display: "inline-block",
        }
    })
);

const Logo = (props) => {
    const classes = styles();
    const {version} = props;
    return (
        version && version.small ?
            <div className={classes.root}><span className={classes.F}>F</span>F</div>
            :
            <div className={classes.root}><span className={classes.F}>F</span>Foodinger</div>
    );
};

export default Logo;