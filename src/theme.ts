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
            main: IS_BETA ? blue["A700"] : "#F57F17",
            dark: "#870000",
            contrastText: "#FFFDE7",
        },
        secondary: {
            main: "#EEEEEE",
            contrastText: "#000",
        },
        // secondary: {
        //     main: "#FFFDE7",
        //     contrastText: "#000",
        // },
        background: {
            default: "#f7f7f7"
        },
    },
    typography: {
        fontFamily: [
            '"Encode Sans Semi Condensed"',
            '"Roboto"',
            '"Arial"',
            '"sans-serif"',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        h2: {
            fontFamily: "'Encode Sans', sans-serif",
            fontSize: "2.5rem"
        },
        h3: {
            fontFamily: "'Encode Sans', sans-serif",
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
