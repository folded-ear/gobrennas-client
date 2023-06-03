import {
    blue,
    blueGrey,
    green,
    indigo,
    lightGreen,
    lime,
    pink,
    purple,
    red,
    teal
} from "@mui/material/colors";

export const planColors = [
    red[500],
    pink[100],
    purple[400],
    indigo[900],
    blue[300],
    teal[300],
    green[400],
    lightGreen[900],
    lime[500],
    blueGrey[500]
];

const ensureInt = (id: number | string) => {
    if (typeof id == "number") {
        return id;
    }
    return parseInt(id, 10);
};

export const colorHash = (id: number | string) => planColors[ensureInt(id) % planColors.length];