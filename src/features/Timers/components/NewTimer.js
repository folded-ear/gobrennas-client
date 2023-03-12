import React, {useEffect, useState,} from "react";
import PropTypes from "prop-types";
import {Box, Button, Typography,} from "@mui/material";
import {makeStyles} from "@mui/styles";
import {BackspaceOutlined as BackspaceIcon, PlayArrow as PlayIcon,} from "@mui/icons-material";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
    root: {
        display: "grid",
        grid: "auto-flow / repeat(3, 1fr)",
        gridTemplateRows: "auto repeat(5, 1fr)",
        gap: "0.5em",
        "& Button": {
            fontSize: 24,
        },
    },
    mag: {
        fontSize: 42,
        textAlign: "center",
        "& > span": {
            fontSize: 24,
        },
    },
    zero: {
        opacity: 0.35,
    },
}));

function Mag({ value, label, hot }) {
    const classes = useStyles();
    while (value.length < 2) {
        value = "0" + value;
    }
    return <Typography component={"span"}
                       className={clsx({
                           [classes.mag]: true,
                           [classes.zero]: !hot,
                       })}>
        {value}
        <span>{label}</span>
    </Typography>;
}

Mag.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    hot: PropTypes.bool,
};

function isValid(seconds) {
    return !isNaN(seconds) && seconds > 0;
}

function NewTimer({ onCreate }) {
    const classes = useStyles();
    const [ text, setText ] = useState("");
    const [ seconds, setSeconds ] = useState(0);

    useEffect(() => {
        const n = parseInt(text);
        if (isNaN(n)) {
            setSeconds(0);
        } else {
            const hr = Math.floor(n / 10000);
            const min = Math.floor(n % 10000 / 100);
            const sec = n % 100;
            setSeconds(hr * 3600 + min * 60 + sec);
        }
    }, [ text ]);

    function handleCreate() {
        if (isValid(seconds)) {
            onCreate(seconds);
        }
        setText("");
    }

    function handleDigit(e) {
        const digits = e.target.textContent;
        setText(text => {
            for (const d of digits) {
                if (text.length < 6 && (text !== "" || d !== "0")) {
                    text += d;
                }
            }
            return text;
        });
    }

    function handleBackspace() {
        setText(t => t.length === 0
            ? t
            : t.slice(0, -1));
    }

    return <Box className={classes.root}>
        <Mag value={text.slice(-6, -4)}
             label={"h"}
             hot={text.length > 4} />
        <Mag value={text.slice(-4, -2)}
             label={"m"}
             hot={text.length > 2} />
        <Mag value={text.slice(-2)}
             label={"s"}
             hot={text.length > 0} />
        <Button variant={"outlined"} onClick={handleDigit}>1</Button>
        <Button variant={"outlined"} onClick={handleDigit}>2</Button>
        <Button variant={"outlined"} onClick={handleDigit}>3</Button>
        <Button variant={"outlined"} onClick={handleDigit}>4</Button>
        <Button variant={"outlined"} onClick={handleDigit}>5</Button>
        <Button variant={"outlined"} onClick={handleDigit}>6</Button>
        <Button variant={"outlined"} onClick={handleDigit}>7</Button>
        <Button variant={"outlined"} onClick={handleDigit}>8</Button>
        <Button variant={"outlined"} onClick={handleDigit}>9</Button>
        <Button variant={"outlined"} onClick={handleDigit}>00</Button>
        <Button variant={"outlined"} onClick={handleDigit}>0</Button>
        <Button onClick={handleBackspace}
                disabled={text.length === 0}>
            <BackspaceIcon fontSize={"inherit"} />
        </Button>
        <span />
        <Button
            onClick={handleCreate}
            disabled={!isValid(seconds)}
            title={"Start new timer"}
        >
            <PlayIcon />
        </Button>
    </Box>;
}

NewTimer.propTypes = {
    onCreate: PropTypes.func.isRequired,
};

export default NewTimer;
