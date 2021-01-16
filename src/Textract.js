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
    const [[width, height], setSize] = React.useState([100, 100]);
    const [maxWidth, setMaxWidth] = React.useState(100);
    const [box, setBox] = React.useState(null);
    const [selection, setSelection] = React.useState(null);
    const [selectedText, setSelectedText] = React.useState("");
    const canvasRef = React.useRef(null);
    const scaleFactor = maxWidth / width;
    const getXY = e => {
        const c = e.target;
        return [
            e.clientX - c.offsetLeft,
            e.clientY - c.offsetTop,
        ];
    };
    const startBoxDraw = e => {
        const [x, y] = getXY(e);
        setBox({
            x1: x,
            y1: y,
        });
        setSelection(null);
    };
    const updateBoxDraw = e => {
        const c = e.target;
        const [x, y] = getXY(e);
        const b = {
            ...box,
            x2: x,
            y2: y,
        };
        setBox(b);
        const sel = {
            top: Math.min(b.y1, b.y2) / c.clientHeight,
            left: Math.min(b.x1, b.x2) / c.clientWidth,
        };
        sel.height = Math.max(b.y1, b.y2) / c.clientHeight - sel.top;
        sel.width = Math.max(b.x1, b.x2) / c.clientWidth - sel.left;
        setSelection(sel);
    };
    const endBoxDraw = () => {
        setBox(null);
        if (selection == null) return;
        setSelectedText(textract
            .filter(t => overlaps(selection, t.box))
            .map(t => t.text)
            .join("\n"));
    };
    React.useEffect(() => {
        const img = document.createElement("img");
        img.onload = () => {
            setSize([img.width, img.height]);
            setMaxWidth(canvasRef.current.parentNode.clientWidth);
        };
        img.src = image;
    }, [image]);
    React.useLayoutEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.strokeStyle = "#ff000099";
        ctx.lineWidth = 0.5;
        const box2coords = box => [
            Math.ceil(box.left * width * scaleFactor),
            Math.ceil(box.top * height * scaleFactor),
            Math.floor(box.width * width * scaleFactor),
            Math.floor(box.height * height * scaleFactor),
        ];
        for (const t of textract) {
            ctx.strokeRect(...box2coords(t.box));
        }
        ctx.strokeStyle = "#999900cc";
        ctx.fillStyle = "#ffff0066";
        if (selection) {
            const coords = box2coords(selection);
            ctx.fillRect(...coords);
            ctx.strokeRect(...coords);
        }
    }, [width, height, scaleFactor, textract, selection]);
    return <Box m={2}>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Box>
                    <canvas
                        ref={canvasRef}
                        width={width * scaleFactor}
                        height={height * scaleFactor}
                        onMouseDown={startBoxDraw}
                        onMouseMove={box && updateBoxDraw}
                        onMouseUp={endBoxDraw}
                        style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: "cover",
                            userSelect: "none",
                        }}
                    />
                    {box && <code>{JSON.stringify(box)}</code>}
                    {selection && <code>{JSON.stringify(selection)}</code>}
                </Box>
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
    })).isRequired
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
