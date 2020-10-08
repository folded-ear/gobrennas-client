import {Icon, Popconfirm,} from "antd";
import {Button, IconButton, Tooltip} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import capitalize from "../../util/capitalize";

const DeleteIcon = ({onClick}) => (
    <Tooltip title="Delete" placement="top">
        <IconButton onClick={onClick}>
            <Delete/>
        </IconButton>
    </Tooltip>
);

DeleteIcon.propTypes = {
    onClick: PropTypes.func
};

const DeleteButton = ({type, onConfirm, label, onClick, onCancel}) =>
    <Popconfirm
        title={`Irrevocably delete this ${type}?`}
        icon={<Icon type="exclamation-circle" style={{color: "red"}} />}
        okType="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
    >
        {label
            ? <Button
                variant="contained"
                color="primary"
                startIcon={<Delete/>}
                onClick={onClick}>
                {label ? "Delete " + capitalize(type) : "Delete"}
            </Button>
            : <DeleteIcon onClick={onClick}/>
        }
    </Popconfirm>;

DeleteButton.propTypes = {
    type: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func,
    onCancel: PropTypes.func,
};

export default DeleteButton;
