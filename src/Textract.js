import {
    Box,
    Grid,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import LoadingIndicator from "./views/common/LoadingIndicator";

const imageUrl = "/pork_chops_sm.jpg";
const jsonUrl = "/pork_chops_sm_textract.json";

const overlaps = (a, b) =>
    a.left + a.width >= b.left &&
    a.left <= b.left + b.width &&
    a.top + a.height >= b.top &&
    a.top <= b.top + b.height;

const Ui = ({image, textract}) => {
    const [[width, height, scaleFactor], setSize] = React.useState([100, 100, 1]);
    const [drawnBox, setDrawnBox] = React.useState(null);
    const [selectedRegion, setSelectedRegion] = React.useState(null);
    const [partitionedLines, setPartitionedLines] = React.useState([textract, []]);
    const [selectedText, setSelectedText] = React.useState("");
    React.useEffect(
        () => {
            const partition = selectedRegion == null
                ? [textract, []]
                : textract.reduce((agg, t) => {
                    agg[overlaps(selectedRegion, t.box) ? 1 : 0].push(t);
                    return agg;
                }, [[], []]);
            setPartitionedLines(partition);
            setSelectedText(partition[1]
                .map(t => t.text)
                .join("\n"));
        },
        [textract, selectedRegion],
    );
    const findSvg = n => {
        while (n && n.localName !== "svg") {
            n = n.parentNode;
        }
        return n;
    };
    const getXY = e => {
        const svg = findSvg(e.target);
        return [
            e.clientX - svg.parentNode.offsetLeft,
            e.clientY - svg.parentNode.offsetTop,
        ];
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
        const svg = findSvg(e.target);
        const [x, y] = getXY(e);
        const b = {
            ...drawnBox,
            x2: x,
            y2: y,
        };
        setDrawnBox(b);
        const sel = {
            top: Math.min(b.y1, b.y2) / svg.clientHeight,
            left: Math.min(b.x1, b.x2) / svg.clientWidth,
        };
        sel.height = Math.max(b.y1, b.y2) / svg.clientHeight - sel.top;
        sel.width = Math.max(b.x1, b.x2) / svg.clientWidth - sel.left;
        setSelectedRegion(sel);
    };
    const endBoxDraw = e => {
        const [x, y] = getXY(e);
        if (drawnBox.x1 === x && drawnBox.y1 === y) {
            // just a click; pretend it was a one-pixel draw
            updateBoxDraw(e);
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
    return <Box m={2}>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Box style={{
                    position: "relative",
                }}>
                    <img
                        src={image}
                        alt="to extract"
                        width={width * scaleFactor}
                        height={height * scaleFactor}
                        onLoad={e => {
                            const img = e.target;
                            setSize([
                                img.naturalWidth,
                                img.naturalHeight,
                                img.parentNode.clientWidth / img.naturalWidth
                            ]);
                        }}
                    />
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        width={width * scaleFactor}
                        height={height * scaleFactor}
                        preserveAspectRatio="none"
                        onMouseDown={startBoxDraw}
                        onMouseMove={drawnBox && updateBoxDraw}
                        onMouseUp={endBoxDraw}
                        strokeWidth={1}
                        style={{
                            userSelect: "none",
                            position: "absolute",
                            top: 0,
                            left: 0,
                        }}
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
                </Box>
                {drawnBox && <code>{JSON.stringify(drawnBox)}</code>}
                {selectedRegion && <code>{JSON.stringify(selectedRegion)}</code>}
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box>
                    <textarea
                        value={selectedText}
                        onChange={e => setSelectedText(e.target.value)}
                        style={{
                            width: "100%",
                            height: height * scaleFactor + "px",
                        }}
                    />
                </Box>
            </Grid>
        </Grid>
        <hr />
        <pre>{JSON.stringify(textract, null, 3)}</pre>
    </Box>;
};

Ui.propTypes = {
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
};

const Textract = () => {
    let [json, setJson] = React.useState(null);
    let [error, setError] = React.useState(null);
    React.useEffect(() => {
        fetch(jsonUrl)
            .then(r => r.json())
            .then(setJson, setError);
    }, []);
    return json
        ? <Ui image={imageUrl} textract={json} />
        : error
            ? <p color="red">{error.toString()}</p>
            : <LoadingIndicator />;
};

export default Textract;
