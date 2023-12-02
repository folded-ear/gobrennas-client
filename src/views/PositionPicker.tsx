import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { findSvg } from "util/findAncestorByName";
import getPositionWithin from "util/getPositionWithin";
import ImageOrPreview from "views/common/ImageOrPreview";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "relative",
    },
    image: {
        maxWidth: "400px",
        maxHeight: "200px",
    },
    svg: {
        userSelect: "none",
        position: "absolute",
        top: 0,
        left: 0,
        stroke: theme.palette.primary.main,
    },
}));

const CENTER = [0.5, 0.5];

interface Props {
    image:
        | string // actual URL
        | Blob; // including File
    value?: number[];

    onChange(v: number[]): void;
}

const PositionPicker: React.FC<Props> = ({ image, value, onChange }) => {
    const classes = useStyles();
    const [loaded, setLoaded] = React.useState(false);
    React.useEffect(() => setLoaded(false), [image]);
    const [[width, height], setSize] = React.useState(() => [100, 100]);
    const [[left, top], setOffset] = React.useState(() => CENTER);
    React.useEffect(() => setOffset(value || CENTER), [value]);
    const x = left * width;
    const y = top * height;
    return (
        <div className={classes.root}>
            <ImageOrPreview
                src={image}
                className={classes.image}
                onLoad={(e) => {
                    const img = e.target;
                    setLoaded(true);
                    setSize([img.width, img.height]);
                }}
            />
            {loaded && (
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    width={width}
                    height={height}
                    preserveAspectRatio={"none"}
                    className={classes.svg}
                    fill={"none"}
                    strokeWidth={1.5}
                    onClick={(e) => {
                        const svg = findSvg(e.target as Element);
                        if (svg == null) {
                            // eslint-disable-next-line no-console
                            console.warn(
                                "Target of click w/in SVG has no SVG ancestor?!",
                            );
                            return;
                        }
                        const [x, y] = getPositionWithin(svg.parentNode, e);
                        const val = [x / width, y / height];
                        setOffset(val);
                        onChange && onChange(val);
                    }}
                >
                    <circle
                        cx={x}
                        cy={y}
                        r={10}
                        strokeWidth={5}
                        stroke={"#ffffff66"}
                    />
                    <circle cx={x} cy={y} r={7} />
                    <circle cx={x} cy={y} r={12} />
                    <line x1={x} y1={y - 18} x2={x} y2={y - 2} />
                    <line x1={x} y1={y + 2} x2={x} y2={y + 18} />
                    <line x1={x - 18} y1={y} x2={x - 2} y2={y} />
                    <line x1={x + 2} y1={y} x2={x + 18} y2={y} />
                </svg>
            )}
        </div>
    );
};

export default PositionPicker;
