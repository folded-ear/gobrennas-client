import ListItemText from "@mui/material/ListItemText";
import PropTypes from "prop-types";
import React from "react";
import LoadingIconButton from "views/common/LoadingIconButton";
import Item from "./Item";
import {grey} from "@mui/material/colors";

function LoadingTask({
     depth,
 }) {
    return <Item
        depth={depth}
        prefix={
            <LoadingIconButton
                key="loading"
            />
        }
    >
        <ListItemText
            style={{color: grey[500]}}
        >
            Loading...
        </ListItemText>
    </Item>;
}

LoadingTask.propTypes = {
    depth: PropTypes.number.isRequired,
};

export default LoadingTask;