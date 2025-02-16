import TextractApi, { PendingJob } from "@/data/TextractApi";
import { BfsId, indexOfBfsId } from "@/global/types/identity";
import ImageDropZone from "@/util/ImageDropZone";
import DeleteButton from "@/views/common/DeleteButton";
import { CloseIcon } from "@/views/common/icons";
import {
    Drawer,
    IconButton,
    IconButtonProps,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as React from "react";
import { useQuery } from "react-query";

const useStyles = makeStyles((theme) => ({
    drawer: {
        minHeight: "100%",
        minWidth: "30vw",
        maxWidth: "50vw",
        backgroundColor: theme.palette.background.paper,
        padding: "0 1em",
        position: "relative",
    },
    dropZone: {
        padding: "20px 0",
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
}));

interface PassthroughProps {
    onSelect: (id: string) => void;
    onClose: IconButtonProps["onClick"];
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
                    indexOfBfsId(deleting, j.id) >= 0
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
                    <CloseIcon />
                </IconButton>
                <Typography variant="h3">Select Photo</Typography>
                <ImageList cols={2} rowHeight={200}>
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
                        >
                            <img
                                src={j.url}
                                alt={j.name}
                                title={j.ready ? "Use this photo" : undefined}
                            />
                            <ImageListItemBar
                                title={j.name}
                                subtitle={j.ready ? null : j.state + "..."}
                                actionIcon={
                                    (j.state === "ready" ||
                                        j.state === "extracting") && (
                                        <DeleteButton
                                            forType="photo"
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
        () => TextractApi.promiseJobList(),
        {
            refetchInterval: (jobs: PendingJob[] | undefined) => {
                return !jobs || jobs.some((j) => !j.ready) ? 5_000 : 15_000;
            },
            refetchIntervalInBackground: false,
        },
    );
    return <Ui queue={queue} {...props} />;
};

export default TextractQueueBrowser;
