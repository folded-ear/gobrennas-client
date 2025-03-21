import { BoundingBox, Line } from "@/data/TextractApi";
import useWindowSize from "@/data/useWindowSize";
import { findSvg } from "@/util/findAncestorByName";
import getPositionWithin from "@/util/getPositionWithin";
import {
    CloseIcon,
    RotateClockwiseIcon,
    RotateCounterClockwiseIcon,
} from "@/views/common/icons";
import {
    Box,
    Grid,
    IconButton,
    IconButtonProps,
    TextField,
    Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as React from "react";
import { ReactNode } from "react";

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

type SortBox = Pick<BoundingBox, "top" | "left" | "width">;

function overlaps(a: BoundingBox, b: BoundingBox): boolean {
    return (
        a.left + a.width >= b.left &&
        a.left <= b.left + b.width &&
        a.top + a.height >= b.top &&
        a.top <= b.top + b.height
    );
}

/**
 * A rectangular selection drawn by the user.
 */
interface Rect {
    x1: number;
    y1: number;
    x2?: number;
    y2?: number;
}

export type RenderActionsForLines = (lines: string[]) => ReactNode;

interface Props {
    image: string;
    textract: Line[];
    onClose: IconButtonProps["onClick"];

    renderActions: RenderActionsForLines;
}

const TextractEditor: React.FC<Props> = ({
    image,
    textract,
    renderActions,
    onClose,
}) => {
    if (!textract) textract = [];
    const classes = useStyles();
    const windowSize = useWindowSize();
    const [rotation, setRotation] = React.useState(0);
    const [[width, height, maxWidth], setSize] = React.useState([
        100, 100, 100,
    ]);
    const scaleFactor = maxWidth / Math.max(width, height);
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;
    const [drawnRect, setDrawnRect] = React.useState<Rect | null>(null);
    const [selectedRegion, setSelectedRegion] =
        React.useState<BoundingBox | null>(null);
    const [partitionedLines, setPartitionedLines] = React.useState([
        textract,
        [],
    ]);
    const [selectedText, setSelectedText] = React.useState<string[]>([]);
    React.useEffect(() => {
        const partition =
            selectedRegion == null
                ? [textract, []]
                : textract.reduce(
                      (agg: Line[][], t) => {
                          agg[overlaps(selectedRegion, t.box) ? 1 : 0].push(t);
                          return agg;
                      },
                      [[], []],
                  );
        setPartitionedLines(partition);
        const toSortBox = (box: BoundingBox): SortBox => {
            if (rotation === 90) {
                // noinspection JSSuspiciousNameCombination
                return {
                    top: box.left,
                    left: 1 - box.top - box.height,
                    width: box.height,
                };
            } else if (rotation === 180) {
                // noinspection JSSuspiciousNameCombination
                return {
                    top: 1 - box.top - box.height,
                    left: 1 - box.left - box.width,
                    width: box.width,
                };
            } else if (rotation === 270) {
                // noinspection JSSuspiciousNameCombination
                return {
                    top: 1 - box.left,
                    left: box.top,
                    width: box.height,
                };
            } else {
                return box;
            }
        };
        setSelectedText(
            partition[1]
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
                    const twoCol = dl < 0 ? a.width < -dl : b.width < dl;
                    return twoCol ? dl : dt;
                })
                .map((t) => t.text),
        );
    }, [textract, rotation, selectedRegion]);
    const getXY = (e: React.PointerEvent) => {
        const svgNode = findSvg(e.target as Element);
        if (!svgNode) throw new TypeError("No SVG parent found?!");
        const [x, y] = getPositionWithin(svgNode.parentNode as HTMLElement, e);
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
    const startBoxDraw = (e: React.PointerEvent) => {
        const [x, y] = getXY(e);
        setDrawnRect({
            x1: x,
            y1: y,
        });
        setSelectedRegion(null);
    };
    const updateBoxDraw = (e: React.PointerEvent) => {
        if (!drawnRect) throw new TypeError("Can't update a null box");
        const [x, y] = getXY(e);
        const b = {
            ...drawnRect,
            x2: x,
            y2: y,
        };
        setDrawnRect(b);
        const top = Math.min(b.y1, b.y2) / scaledHeight;
        const left = Math.min(b.x1, b.x2) / scaledWidth;
        setSelectedRegion({
            top,
            left,
            height: Math.max(b.y1, b.y2) / scaledHeight - top,
            width: Math.max(b.x1, b.x2) / scaledWidth - left,
        });
    };
    const endBoxDraw = (e: React.PointerEvent) => {
        if (!drawnRect) throw new TypeError("Can't end a null box");
        const [x, y] = getXY(e);
        if (drawnRect.x1 === x && drawnRect.y1 === y) {
            setSelectedRegion({
                top: y / scaledHeight,
                left: x / scaledWidth,
                height: 0,
                width: 0,
            });
        }
        setDrawnRect(null);
    };
    const rect = (box: BoundingBox, key?: React.Key) => (
        <rect
            key={key}
            x={box.left * width}
            y={box.top * height}
            width={box.width * width}
            height={box.height * height}
        />
    );
    let rotationStyles: React.CSSProperties | undefined = undefined;
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
    return (
        <Box m={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Box
                        style={{
                            position: "relative",
                        }}
                    >
                        <img
                            src={`${image}${
                                image.indexOf("?") < 0 ? "?" : "&"
                            }w=${windowSize.width}`}
                            alt="to extract"
                            width={scaledWidth}
                            height={scaledHeight}
                            onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                setSize([
                                    img.naturalWidth,
                                    img.naturalHeight,
                                    (img.parentNode as HTMLDivElement)
                                        .clientWidth,
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
                            onPointerMove={
                                drawnRect ? updateBoxDraw : undefined
                            }
                            onPointerUp={drawnRect ? endBoxDraw : undefined}
                            strokeWidth={1}
                            className={classes.svg}
                            style={rotationStyles}
                        >
                            <g stroke="#ff0000">
                                <g fill="none">
                                    {partitionedLines[0].map((t, i) =>
                                        rect(t.box, i),
                                    )}
                                </g>
                                <g fill="#99ffff" fillOpacity={0.4}>
                                    {partitionedLines[1].map((t, i) =>
                                        rect(t.box, i),
                                    )}
                                </g>
                            </g>
                            {selectedRegion && (
                                <g
                                    fill="#ffff00"
                                    fillOpacity={0.3}
                                    stroke="#ffff00"
                                >
                                    {rect(selectedRegion)}
                                </g>
                            )}
                        </svg>
                        <IconButton
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className={classes.rotateRight}
                            size="large"
                        >
                            <RotateClockwiseIcon />
                        </IconButton>
                        <IconButton
                            onClick={() =>
                                setRotation((r) => (r - 90 + 360) % 360)
                            }
                            className={classes.rotateLeft}
                            size="large"
                        >
                            <RotateCounterClockwiseIcon />
                        </IconButton>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box style={{ position: "relative" }}>
                        <IconButton
                            onClick={onClose}
                            size={"small"}
                            style={{
                                position: "absolute",
                                right: 0,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography component={"p"} variant={"h6"}>
                            Select some text on your photo.
                        </Typography>
                        <TextField
                            multiline
                            variant="outlined"
                            size={"small"}
                            fullWidth
                            minRows={4}
                            value={selectedText.join("\n")}
                            onChange={(e) =>
                                setSelectedText(e.target.value.split("\n"))
                            }
                            inputProps={{
                                sx: {
                                    // width: "100%",
                                    // height: `${Math.max(
                                    //     100,
                                    //     (rotation % 180 === 0
                                    //         ? scaledHeight
                                    //         : scaledWidth) - 100,
                                    // )}px`,
                                    whiteSpace: "pre",
                                    fontFamily: "monospace",
                                    fontSize: "80%",
                                },
                            }}
                        />
                        {renderActions && renderActions(selectedText)}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TextractEditor;
