import grey from "@material-ui/core/colors/grey";
import ListItemText from "@material-ui/core/ListItemText";
import PropTypes from "prop-types";
import React from "react";
import LoadingIconButton from "views/common/LoadingIconButton";
import Item from "./Item";

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