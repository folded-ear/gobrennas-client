import {
    createTheme,
    responsiveFontSizes,
    Theme,
} from "@mui/material/styles";
import { IS_BETA } from "./constants";
import { blue } from "@mui/material/colors";

let theme: Theme = createTheme({
    palette: {
        primary: {
            light: "#f9683a",
            main: IS_BETA ? blue["A700"] : "#bf360c",
            dark: "#870000",
            contrastText: "#fff",
        },
        secondary: {
            main: "#f2f3ef",
            contrastText: "#000",
        },
        background: {
            default: "#f7f7f7"
        }
    },
    typography: {
        fontFamily: [
            '"Roboto"',
            '"Helvetica Neue"',
            '"Arial"',
            '"sans-serif"',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        h2: {
            fontFamily: "'News Cycle', sans-serif",
            fontSize: "2.5rem"
        },
        h3: {
            fontFamily: "News Cycle",
            fontSize: "2rem"
        },
        h5: {
            fontFamily: "News Cycle",
            fontWeight: 600,
            fontSize: "1.1rem",
            textTransform: "uppercase",
            marginBottom: ".5em"
        }
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    backgroundColor: "white"
                }
            }
        }
    }
});
theme = responsiveFontSizes(theme);

export default theme;
