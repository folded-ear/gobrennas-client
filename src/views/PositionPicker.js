import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { findSvg } from "util/findAncestorByName";
import getPositionWithin from "util/getPositionWithin";
import ImageOrPreview from "views/common/ImageOrPreview";

const useStyles = makeStyles(theme => ({
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

const PositionPicker = ({image, value, onChange}) => {
    const classes = useStyles();
    const [loaded, setLoaded] = React.useState(false);
    React.useEffect(() => setLoaded(false), [image]);
    const [[width, height], setSize] = React.useState(() => [100, 100]);
    const [[left, top], setOffset] = React.useState(() => CENTER);
    React.useEffect(() => setOffset(value || CENTER), [value]);
    const x = left * width;
    const y = top * height;
    return <div className={classes.root}>
        <ImageOrPreview
            src={image}
            className={classes.image}
            onLoad={e => {
                const img = e.target;
                setLoaded(true);
                setSize([
                    img.width,
                    img.height,
                ]);
            }}
        />
        {loaded && <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            preserveAspectRatio={"none"}
            className={classes.svg}
            fill={"none"}
            strokeWidth={1.5}
            onClick={e => {
                const [x, y] = getPositionWithin(findSvg(e.target).parentNode, e);
                const val = [x / width, y / height];
                setOffset(val);
                onChange && onChange(val);
            }}
        >
            <circle cx={x} cy={y} r={10} strokeWidth={5} stroke={"#ffffff66"} />
            <circle cx={x} cy={y} r={7} />
            <circle cx={x} cy={y} r={12} />
            <line x1={x} y1={y - 18} x2={x} y2={y - 2} />
            <line x1={x} y1={y + 2} x2={x} y2={y + 18} />
            <line x1={x - 18} y1={y} x2={x -2} y2={y} />
            <line x1={x + 2} y1={y} x2={x + 18} y2={y} />
        </svg>}
    </div>;
};

PositionPicker.propTypes = {
    image: PropTypes.oneOfType([
        PropTypes.string, // actual URL
        PropTypes.object, // a Blob (including File)
    ]).isRequired,
    value: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func.isRequired,
};

export default PositionPicker;
