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
import socket from "../../util/socket";
import DeleteButton from "../common/DeleteButton";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import ImageDropZone from "../../util/ImageDropZone";

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

const Ui = ({onSelect, onClose, onUpload, onDelete, queue: persistent, deleting, uploading}) => {
    const classes = useStyles();
    const queue = uploading.map(j => ({
        ...j,
        state: "uploading",
        ready: false,
    })).concat(persistent.map(j => ({
        ...j,
        state: deleting.indexOf(j.id) >= 0
            ? "deleting"
            : j.ready ? "ready" : "extracting",
    })));
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
                {queue.map(j => <GridListTile
                    key={j.id}
                    onClick={j.state === "ready" ? () => onSelect(j.id) : null}
                    className={j.state === "ready" ? classes.ready : classes.inactive}
                    title={j.ready ? "Use this photo" : null}
                >
                    <img src={j.url} alt={j.name} />
                    <GridListTileBar
                        title={j.name}
                        subtitle={j.ready ? null : (j.state + "...")}
                        actionIcon={(j.state === "ready" || j.state === "extracting") &&
                        <DeleteButton
                            type="photo"
                            onConfirm={() => onDelete(j.id)}
                            className={classes.deleteButton}
                        />}
                    />
                </GridListTile>)}
            </GridList>
        </div>
    </Drawer>;
};

const Job = PropTypes.shape({
    id: clientOrDatabaseIdType.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
});

const passthroughTypes = {
    onSelect: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    uploading: PropTypes.arrayOf(Job).isRequired,
    deleting: PropTypes.arrayOf(PropTypes.number).isRequired,
};

Ui.propTypes = {
    ...passthroughTypes,
    queue: PropTypes.arrayOf(Job).isRequired,
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

TextractQueueBrowser.propTypes = passthroughTypes;

export default TextractQueueBrowser;
