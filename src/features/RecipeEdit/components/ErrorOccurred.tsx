import { ErrorIcon } from "@/views/common/icons";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
    title: string;
    errors: Array<string | undefined | null>;
}

export default function ErrorOccurred({ title, errors }: Props) {
    const [open, setOpen] = useState(false);
    const error = errors.find((it) => it);
    useEffect(() => {
        if (error) setOpen(true);
    }, [error]);

    const handleClose = () => setOpen(false);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="error-occurred-title"
            aria-describedby="error-occurred-description"
        >
            <DialogTitle id="error-occurred-title">
                <Typography fontWeight={"bold"} variant={"h5"} component={"p"}>
                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                        <ErrorIcon />
                        <span>{title}</span>
                    </Stack>
                </Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="error-occurred-description">
                    <Typography>{error}</Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    autoFocus
                    variant={"contained"}
                    color={"primary"}
                >
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}
