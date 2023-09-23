import {
  Button,
  IconButton,
  Tooltip
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { Delete } from "@mui/icons-material";
import * as React from "react";
import { MouseEventHandler } from "react";

interface Props {
    onClick: MouseEventHandler;
}

const DeleteIcon: React.FC<Props> = ({ onClick, ...props }) => (
    <Tooltip title="Delete" placement="top">
        <IconButton onClick={onClick} {...props}>
            <Delete />
        </IconButton>
    </Tooltip>
);

type DeleteButtonProps = {
    type: string;
    onConfirm(): void;
    label?: string;
    onClick?(): void;
    onCancel?(): void;
    className?: string;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({
    type,
    onConfirm,
    label,
    onClick,
    onCancel,
    ...props
}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e) => {
        e.stopPropagation();
        setOpen(true);
        onClick && onClick();
    };
    const handleClose = () => setOpen(false);
    const handleCancel = (e) => {
        e.stopPropagation();
        setOpen(false);
        onCancel && onCancel();
    };
    const handleConfirm = (e) => {
        e.stopPropagation();
        setOpen(false);
        onConfirm && onConfirm();
    };
    return (
        <>
            {label ? (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Delete />}
                    onClick={handleOpen}
                    {...props}
                >
                    {label}
                </Button>
            ) : (
                <DeleteIcon onClick={handleOpen} {...props} />
            )}
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
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleConfirm} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteButton;
