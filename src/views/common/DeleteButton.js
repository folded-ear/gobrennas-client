import {
    Button,
    IconButton,
    Tooltip,
} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Delete } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

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

const DeleteButton = ({type, onConfirm, label, onClick, onCancel}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        setOpen(true);
        onClick && onClick();
    };
    const handleClose = () => setOpen(false);
    const handleCancel = () => {
        setOpen(false);
        onCancel && onCancel();
    };
    const handleConfirm = () => {
        setOpen(false);
        onConfirm && onConfirm();
    };
    return <>
        {label
            ? <Button
                variant="contained"
                color="primary"
                startIcon={<Delete />}
                onClick={handleOpen}
            >
                {label}
            </Button>
            : <DeleteIcon onClick={handleOpen} />
        }
        <Dialog
            open={open}
            maxWidth="xs"
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Irrevocably delete this {type}?
            </DialogTitle>
            <DialogActions>
                <Button onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={handleConfirm} color="primary" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    </>;
};

DeleteButton.propTypes = {
    type: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func,
    onCancel: PropTypes.func,
};

export default DeleteButton;
