import {
    IconButton,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Typography,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { makeStyles } from "@mui/styles";
import { Close } from "@mui/icons-material";
import React, { MouseEventHandler } from "react";
import DeleteButton from "views/common/DeleteButton";
import ImageDropZone from "../../util/ImageDropZone";
import { useQuery } from "react-query";
import TextractApi from "../../data/TextractApi";
import { PendingJob } from "./TextractFormAugment";
import { BfsId } from "../../global/types/types";

const useStyles = makeStyles({
    drawer: {
        minHeight: "100%",
        minWidth: "30vw",
        maxWidth: "50vw",
        backgroundColor: "#f7f7f7",
        padding: "0 1em",
        position: "relative",
    },
    dropZone: {
        display: "block",
        height: "100%",
        width: "100%",
        textAlign: "center",
        paddingTop: "40px",
        backgroundColor: "#eee",
        cursor: "pointer",
    },
    closeButton: {
        position: "absolute",
        top: 0,
        right: 0,
    },
    ready: {
        cursor: "pointer",
    },
    inactive: {
        opacity: 0.4,
    },
    deleteButton: {
        color: "white",
    },
});

interface PassthroughProps {
    onSelect: (id: string) => void;
    onClose: MouseEventHandler;
    onUpload: (photo: File) => void;
    onDelete: (id: string) => void;
    uploading: PendingJob[];
    deleting: BfsId[];
}

interface UiProps extends PassthroughProps {
    queue: PendingJob[];
}

const Ui: React.FC<UiProps> = ({
    onSelect,
    onClose,
    onUpload,
    onDelete,
    queue: persistent,
    deleting,
    uploading,
}) => {
    const classes = useStyles();
    const queue = uploading
        .map((j) => ({
            ...j,
            state: "uploading",
            ready: false,
        }))
        .concat(
            persistent.map((j) => ({
                ...j,
                state:
                    deleting.indexOf(j.id) >= 0
                        ? "deleting"
                        : j.ready
                        ? "ready"
                        : "extracting",
            })),
        );
    return (
        <Drawer open anchor="right" onClose={onClose}>
            <div className={classes.drawer}>
                <IconButton
                    onClick={onClose}
                    className={classes.closeButton}
                    size="large"
                >
                    <Close />
                </IconButton>
                <Typography variant="h3">Select Photo</Typography>
                <ImageList>
                    <ImageListItem>
                        <ImageDropZone
                            className={classes.dropZone}
                            onImage={onUpload}
                        />
                    </ImageListItem>
                    {queue.map((j) => (
                        <ImageListItem
                            key={j.id}
                            onClick={
                                j.state === "ready"
                                    ? () => onSelect(j.id)
                                    : undefined
                            }
                            className={
                                j.state === "ready"
                                    ? classes.ready
                                    : classes.inactive
                            }
                            title={j.ready ? "Use this photo" : undefined}
                        >
                            <img src={j.url} alt={j.name} />
                            <ImageListItemBar
                                title={j.name}
                                subtitle={j.ready ? null : j.state + "..."}
                                actionIcon={
                                    (j.state === "ready" ||
                                        j.state === "extracting") && (
                                        <DeleteButton
                                            type="photo"
                                            onConfirm={() => onDelete(j.id)}
                                            className={classes.deleteButton}
                                        />
                                    )
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </div>
        </Drawer>
    );
};

const TextractQueueBrowser: React.FC<PassthroughProps> = (props) => {
    const { data: queue = [] } = useQuery(
        "textract-jobs",
        () =>
            TextractApi.promiseJobList().then((d) =>
                d.data.map((job) => ({
                    id: job.id,
                    url: job.photo.url,
                    name: job.photo.filename,
                    ready: job.ready,
                })),
            ),
        {
            refetchInterval: 5000,
        },
    );
    return <Ui queue={queue} {...props} />;
};

export default TextractQueueBrowser;
