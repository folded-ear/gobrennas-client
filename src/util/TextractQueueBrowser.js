import {
    GridList,
    GridListTile,
    GridListTileBar,
    IconButton,
    Typography,
} from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import socket from "../util/socket";
import DeleteButton from "../views/common/DeleteButton";
import ImageDropZone from "./ImageDropZone";

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
    readyTile: {
        cursor: "pointer",
    },
    pendingTile: {
        opacity: 0.4,
    },
    deleteButton: {
        color: "white",
    },
});

const Ui = ({onSelect, onClose, onUpload, onDelete, queue}) => {
    const classes = useStyles();
    return <Drawer
        open
        anchor="right"
        onClose={onClose}
    >
        <div
            className={classes.drawer}
        >
            <IconButton
                onClick={onClose}
                className={classes.closeButton}
            >
                <Close />
            </IconButton>
            <Typography variant="h3">
                Select Photo
            </Typography>
            <GridList>
                <GridListTile>
                    <ImageDropZone
                        className={classes.dropZone}
                        onImage={onUpload}
                    />
                </GridListTile>
                {queue.map(p => p.ready
                    ? <GridListTile
                        key={p.url}
                        onClick={() => onSelect(p.id)}
                        className={classes.readyTile}
                        title="Use this photo"
                    >
                        <img src={p.url} alt={p.name} />
                        <GridListTileBar
                            title={p.name}
                            actionIcon={
                                <DeleteButton
                                    type="photo"
                                    onConfirm={() => onDelete(p.id)}
                                    className={classes.deleteButton}
                                />
                            }
                        />
                    </GridListTile>
                    : <GridListTile
                        key={p.url}
                    >
                        <img
                            src={p.url}
                            alt={p.name}
                            className={classes.pendingTile}
                        />
                        <GridListTileBar
                            title={p.name}
                            subtitle="...extracting text..."
                            actionIcon={
                                <DeleteButton
                                    type="photo"
                                    onConfirm={() => onDelete(p.id)}
                                    className={classes.deleteButton}
                                />
                            }
                        />
                    </GridListTile>)}
            </GridList>
        </div>
    </Drawer>;
};

Ui.propTypes = {
    queue: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        url: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        ready: PropTypes.bool.isRequired,
    })).isRequired,
    onSelect: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

const TextractQueueBrowser = props => {
    const [queue, setQueue] = React.useState([]);
    React.useEffect(() => {
        const sub = socket.subscribe("/user/queue/textract", (msg) =>
            setQueue(msg.body.map(p => ({
                id: p.id,
                url: p.photo.url,
                name: p.photo.filename,
                ready: p.ready,
            }))));
        return () => sub.unsubscribe();
    }, []);
    return <Ui
        queue={queue}
        {...props}
    />;
};

TextractQueueBrowser.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TextractQueueBrowser;
