import {
    Box,
    Grid,
    IconButton,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Close,
    RotateLeft,
    RotateRight,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import useFluxStore from "../../data/useFluxStore";
import WindowStore from "../../data/WindowStore";
import { findSvg } from "../../util/findAncestorByName";
import getPositionWithin from "../../util/getPositionWithin";

const useStyles = makeStyles({
    rotateRight: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    rotateLeft: {
        position: "absolute",
        top: 0,
        right: 0,
    },
    svg: {
        userSelect: "none",
        position: "absolute",
        touchAction: "none",
        top: 0,
        left: 0,
    },
});

const overlaps = (a, b) =>
    a.left + a.width >= b.left &&
    a.left <= b.left + b.width &&
    a.top + a.height >= b.top &&
    a.top <= b.top + b.height;

const TextractEditor = ({image, textract, renderActions, onClose}) => {
    if (!textract) textract = [];
    const classes = useStyles();
    const windowSize = useFluxStore(
        () => WindowStore.getSize(),
        [WindowStore]);
    const [rotation, setRotation] = React.useState(0);
    const [[width, height, maxWidth], setSize] = React.useState([100, 100, 100]);
    const scaleFactor = maxWidth / (rotation % 180 === 0 ? width : height);
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;
    const [drawnBox, setDrawnBox] = React.useState(null);
    const [selectedRegion, setSelectedRegion] = React.useState(null);
    const [partitionedLines, setPartitionedLines] = React.useState([textract, []]);
    const [selectedText, setSelectedText] = React.useState([]);
    React.useEffect(
        () => {
            const partition = selectedRegion == null
                ? [textract, []]
                : textract.reduce((agg, t) => {
                    agg[overlaps(selectedRegion, t.box) ? 1 : 0].push(t);
                    return agg;
                }, [[], []]);
            setPartitionedLines(partition);
            const toSortBox = box => {
                if (rotation === 90) {
                    // noinspection JSSuspiciousNameCombination
                    return {
                        top: box.left,
                        left: 1 - box.top - box.height,
                        width: box.height
                    };
                } else if (rotation === 180) {
                    // noinspection JSSuspiciousNameCombination
                    return {
                        top: 1 - box.top - box.height,
                        left: 1 - box.left - box.width,
                        width: box.width
                    };
                } else if (rotation === 270) {
                    // noinspection JSSuspiciousNameCombination
                    return {
                        top: 1 - box.left,
                        left: box.top,
                        width: box.height
                    };
                } else {
                    return box;
                }
            };
            setSelectedText(partition[1]
                /*
                 You might think to put this up top and sort the whole extract
                 once at the beginning, but you can't. The total order of the
                 boxes is dependent on the specific set of boxes selected, as
                 that influences the column detection stuff. So a given subset
                 of boxes may sort into different orders based on the other
                 boxes which are also selected, what order they are in the
                 original (complete) list, and what sorting algorithm is used.

                 If you select boxes from three different "sections" of the
                 scan, where two are columns and the third spans the columns,
                 that'll get the first part. The second part depends on what
                 the Textract service's implementation. The third part depends
                 on the browser's implementation.
                 */
                .sort((ta, tb) => {
                    const a = toSortBox(ta.box);
                    const b = toSortBox(tb.box);
                    const dt = a.top - b.top;
                    const dl = a.left - b.left;
                    const twoCol = dl < 0
                        ? a.width < -dl
                        : b.width < dl;
                    return twoCol ? dl : dt;
                })
                .map(t => t.text));
        },
        [textract, rotation, selectedRegion],
    );
    const getXY = e => {
        const [x, y] = getPositionWithin(findSvg(e.target).parentNode, e);
        if (rotation === 90) {
            return [y, scaledHeight - x];
        } else if (rotation === 180) {
            return [scaledWidth - x, scaledHeight - y];
        } else if (rotation === 270) {
            return [scaledWidth - y, x];
        } else {
            return [x, y];
        }
    };
    const startBoxDraw = e => {
        const [x, y] = getXY(e);
        setDrawnBox({
            x1: x,
            y1: y,
        });
        setSelectedRegion(null);
    };
    const updateBoxDraw = e => {
        const [x, y] = getXY(e);
        const b = {
            ...drawnBox,
            x2: x,
            y2: y,
        };
        setDrawnBox(b);
        const sel = {
            top: Math.min(b.y1, b.y2) / scaledHeight,
            left: Math.min(b.x1, b.x2) / scaledWidth,
        };
        sel.height = Math.max(b.y1, b.y2) / scaledHeight - sel.top;
        sel.width = Math.max(b.x1, b.x2) / scaledWidth - sel.left;
        setSelectedRegion(sel);
    };
    const endBoxDraw = e => {
        const [x, y] = getXY(e);
        if (drawnBox.x1 === x && drawnBox.y1 === y) {
            setSelectedRegion({
                top: y / scaledHeight,
                left: x / scaledWidth,
                height: 0,
                width: 0,
            });
        }
        setDrawnBox(null);
    };
    const rect = box =>
        <rect
            key={box.top}
            x={box.left * width}
            y={box.top * height}
            width={box.width * width}
            height={box.height * height}
        />;
    let rotationStyles = null;
    if (rotation === 90) {
        rotationStyles = {
            transformOrigin: "top left",
            transform: `rotate(90deg) translateY(-100%)`,
            marginBottom: `${scaledWidth - scaledHeight}px`,
        };
    } else if (rotation === 180) {
        rotationStyles = {
            transform: `rotate(180deg)`,
        };
    } else if (rotation === 270) {
        rotationStyles = {
            transformOrigin: "top left",
            transform: `rotate(270deg) translateX(-100%)`,
            marginBottom: `${scaledWidth - scaledHeight}px`,
        };
    }
    return <Box m={2}>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Box style={{
                    position: "relative",
                }}>
                    <img
                        src={`${image}${image.indexOf("?") < 0 ? "?" : "&"}w=${windowSize.width}`}
                        alt="to extract"
                        width={scaledWidth}
                        height={scaledHeight}
                        onLoad={e => {
                            const img = e.target;
                            setSize([
                                img.naturalWidth,
                                img.naturalHeight,
                                img.parentNode.clientWidth,
                            ]);
                        }}
                        style={rotationStyles}
                    />
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        width={scaledWidth}
                        height={scaledHeight}
                        preserveAspectRatio="none"
                        onPointerDown={startBoxDraw}
                        onPointerMove={drawnBox && updateBoxDraw}
                        onPointerUp={drawnBox && endBoxDraw}
                        strokeWidth={1}
                        className={classes.svg}
                        style={rotationStyles}
                    >
                        <g stroke="#ff0000">
                            <g fill="none">
                                {partitionedLines[0].map(t => rect(t.box))}
                            </g>
                            <g fill="#99ffff" fillOpacity={0.4}>
                                {partitionedLines[1].map(t => rect(t.box))}
                            </g>
                        </g>
                        {selectedRegion && <g
                            fill="#ffff00"
                            fillOpacity={0.3}
                            stroke="#ffff00"
                        >
                            {rect(selectedRegion)}
                        </g>}
                    </svg>
                    <IconButton
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className={classes.rotateRight}
                    >
                        <RotateRight />
                    </IconButton>
                    <IconButton
                        onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                        className={classes.rotateLeft}
                    >
                        <RotateLeft />
                    </IconButton>
                </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box style={{position: "relative"}}>
                    <IconButton
                        onClick={onClose}
                        size={"small"}
                        style={{
                            position: "absolute",
                            right: 0,
                        }}
                    >
                        <Close />
                    </IconButton>
                    <Typography as={"p"} variant={"h6"}>
                        Select some text on your photo.
                    </Typography>
                    <textarea
                        value={selectedText.join("\n")}
                        onChange={e => setSelectedText(e.target.value
                            .split("\n"))}
                        style={{
                            width: "100%",
                            height: `calc(${rotation % 180 === 0 ? scaledHeight : scaledWidth}px - 100px)`,
                            whiteSpace: "pre",
                        }}
                    />
                    {renderActions && renderActions(selectedText)}
                </Box>
            </Grid>
        </Grid>
    </Box>;
};

TextractEditor.propTypes = {
    image: PropTypes.string.isRequired,
    textract: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        box: PropTypes.shape({
            top: PropTypes.number.isRequired,
            left: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
        }).isRequired,
    })).isRequired,
    renderActions: PropTypes.func.isRequired, // passed a Array<String>
    onClose: PropTypes.func.isRequired,
};

export default TextractEditor;
