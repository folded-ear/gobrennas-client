import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Restaurant} from "@material-ui/icons";

const useStyles = makeStyles({
    root: {
        height: 140,
        textAlign: "center",
        paddingTop: "60px",
        backgroundColor: "#eee"
    },
});

const ItemImageUpload = ({recipe}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Restaurant color="disabled"/>
        </div>);
};

export default ItemImageUpload;
