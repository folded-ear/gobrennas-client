import {
    Box,
    Button,
    CircularProgress,
    GridList,
    GridListTile,
    GridListTileBar,
} from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import {
    CameraAlt,
    MenuBook,
} from "@material-ui/icons";
import React from "react";
import DeleteButton from "../views/common/DeleteButton";
import ImageDropZone from "./ImageDropZone";

const queue = [
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/18/Screenshot_from_2020-04-06_18-21-02.png.jpg",
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/15/pork_chops.jpg",
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/21/cover_your_cough.png",
    "https://s3-us-west-2.amazonaws.com/foodingerdev/recipe/16/IMG_20190402_135915.jpg",
].map(url => {
    const parts = url.split("/");
    return {
        url,
        name: parts[parts.length - 1],
        ready: Math.random() < 0.5,
    };
});

const useStyles = makeStyles({
    drawer: {
        minHeight: "100%",
        minWidth: "30vw",
        maxWidth: "50vw",
        backgroundColor: "#f7f7f7",
        padding: "0 1em",
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
    activeTile: {
        cursor: "pointer",
    },
    deleteButton: {
        color: "white",
    }
});

const TextractSidebar = () => {
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();
    return <>
        <Drawer
            open={open}
            anchor="right"
            onClose={() => setOpen(false)}
        >
            <div
                className={classes.drawer}
            >
                <h3>Extract from Photo</h3>
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
                            onClick={() => console.log("EXTRACT", p.url)}
                            className={classes.activeTile}
                        >
                            <img src={p.url} alt={p.name} />
                            <GridListTileBar
                                title={p.name}
                                actionIcon={
                                    <DeleteButton
                                        type="photo"
                                        onConfirm={() => console.log("DELETE", p.url)}
                                        className={classes.deleteButton}
                                    />
                                }
                            />
                        </GridListTile>
                        : <GridListTile
                            key={p.url}
                        >
                            <img src={p.url} alt={p.name} />
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
        </Drawer>
        <Box
            className={classes.trigger}
        >
            <Button
                variant={"text"}
                startIcon={<MenuBook />}
                endIcon={<CameraAlt />}
                size={"small"}
                onClick={() => setOpen(true)}
            >
                Cookbook
            </Button>
        </Box>
    </>;
};

export default TextractSidebar;
