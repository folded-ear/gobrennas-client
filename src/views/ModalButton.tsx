import React from "react";
import {
  IconButton,
  IconButtonProps,
  Modal,
  Paper,
  Tooltip
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => {
    const width = 500;
    return {
        modal: {
            width: `${width}px`,
            position: "absolute",
            top: 100,
            left: `calc(50% - ${width / 2}px)`,
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
        },
        title: {
            marginTop: 0,
        },
    };
});

interface Props {
    size?: IconButtonProps["size"];
    buttonTitle: string;
    modalTitle?: string;
    icon: React.ReactNode;
    render: () => React.ReactNode;
}

const ModalButton: React.FC<Props> = ({
    size = "large",
    buttonTitle,
    icon,
    modalTitle = buttonTitle,
    render,
}) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const button = (
        <Tooltip title={buttonTitle} placement="top">
            <IconButton onClick={() => setOpen(true)} size={size}>
                {icon}
            </IconButton>
        </Tooltip>
    );

    if (!open) {
        return button;
    }

    return (
        <>
            {button}
            <Modal open onClose={() => setOpen(false)}>
                <Paper className={classes.modal} elevation={8}>
                    <h2 className={classes.title}>{modalTitle}</h2>
                    {render()}
                </Paper>
            </Modal>
        </>
    );
};

export default ModalButton;
