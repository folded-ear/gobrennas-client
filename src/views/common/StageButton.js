import React from "react";
import PropTypes from "prop-types";
import {IconButton, Tooltip} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {ExitToApp} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
    unstage: {
        transform: "rotate(180deg)"
    },
}));

const StageButton = ({staged, onClick}) => {
    const classes = useStyles();
    return (
        <Tooltip
            title={staged ? "Remove from Stage" : "Add to Stage"}
            placement="top"
        >
            <IconButton
                onClick={onClick}
            >
                <ExitToApp className={staged ? classes.unstage : ""}/>
            </IconButton>
        </Tooltip>
    );
};
StageButton.propTypes = {
    staged: PropTypes.bool,
    onClick: PropTypes.func,
};

export default StageButton;
