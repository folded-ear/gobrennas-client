import React from 'react';
import {makeStyles} from "@material-ui/core/styles";

const styles = makeStyles(theme => ({
        root: {
            fontSize: "2.5em",
            color: "black",
            margin: theme.spacing(3),
            paddingRight: theme.spacing(5),
            fontFamily: "Stint Ultra Condensed",
        }
    })
);

const Logo = () => {
    const classes = styles();
    return (<div className={classes.root}>Foodinger</div>);
};

export default Logo;