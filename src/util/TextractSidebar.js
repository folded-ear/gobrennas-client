import {
    Box,
    Button,
    CircularProgress,
    GridList,
    GridListTile,
    GridListTileBar,
    IconButton,
    Typography,
} from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import {
    CameraAlt,
    Close,
    MenuBook,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import Textract from "../Textract";
import DeleteButton from "../views/common/DeleteButton";
import ImageDropZone from "./ImageDropZone";

const queue = [
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/18/Screenshot_from_2020-04-06_18-21-02.png.jpg",
    "/pork_chops_sm.jpg",
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/21/cover_your_cough.png",
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/16/IMG_20190402_135915.jpg",
].map(url => {
    const parts = url.split("/");
    return {
        url,
        name: parts[parts.length - 1],
        ready: url === "/pork_chops_sm.jpg",
    };
});

const useStyles = makeStyles({
    drawer: {
        minHeight: "100%",
        minWidth: "30vw",
        maxWidth: "50vw",
        backgroundColor: "#f7f7f7",
        padding: "0 1em",
        position: "relative",
    },
    trigger: {
        position: "absolute",
        right: 0,
        transformOrigin: "bottom right",
        transform: `rotate(90deg) translateY(100%) translateX(50%)`,
    },
    dropZone: {
        display: "block",
        height: "100%",
        width: "100%",
        textAlign: "center",
        paddingTop: "60px",
        backgroundColor: "#eee",
        cursor: "pointer",
    },
    readyTile: {
        cursor: "pointer",
    },
    pendingTile: {
        opacity: 0.5,
    },
    closeButton: {
        position: "absolute",
        top: 0,
        right: 0,
    },
    deleteButton: {
        color: "white",
    }
});

const TextractSidebar = ({renderActions}) => {
    const classes = useStyles();
    const [mode, setMode] = React.useState("button");
    const onClose = () => setMode("button");
    if (mode === "drawer") {
        const onSelect = () => setMode("extract");
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
                            onImage={file => console.log("UPLOAD FILE", file)}
                        />
                    </GridListTile>
                    {queue.map(p => p.ready
                        ? <GridListTile
                            key={p.url}
                            onClick={onSelect}
                            className={classes.readyTile}
                            title="Use this photo"
                        >
                            <img src={p.url} alt={p.name} />
                            <GridListTileBar
                                title={p.name}
                                actionIcon={
                                    <DeleteButton
                                        type="photo"
                                        onConfirm={() => console.log(
                                            "DELETE",
                                            p.url
                                        )}
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
                                actionIcon={<CircularProgress
                                    variant="indeterminate"
                                    size="1.6em"
                                    color="secondary"
                                />}
                            />
                        </GridListTile>)}
                </GridList>
            </div>
        </Drawer>;
    } else if (mode === "extract") {
        return <div>
            <IconButton
                onClick={onClose}
                size={"small"}
                style={{
                    position: "absolute",
                    right: "2em",
                }}
            >
                <Close />
            </IconButton>
            <Textract
                renderActions={renderActions}
            />
        </div>;
    } else { // button
        return <Box
            className={classes.trigger}
        >
            <Button
                variant={"text"}
                startIcon={<MenuBook />}
                endIcon={<CameraAlt />}
                size={"small"}
                onClick={() => setMode("drawer")}
            >
                Cookbook
            </Button>
        </Box>;
    }
};

TextractSidebar.propTypes = {
    renderActions: PropTypes.func.isRequired, // passed a Array<String>
};

export default TextractSidebar;
