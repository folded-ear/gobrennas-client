import {
    responsiveFontSizes,
    Theme,
    unstable_createMuiStrictModeTheme as createTheme,
} from "@mui/styles";

import { adaptV4Theme } from '@mui/material/styles';

let theme : Theme = createTheme(adaptV4Theme({
    palette: {
        primary: {
            light: "#f9683a",
            main: "#bf360c",
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
    overrides: {
        MuiTextField: {
            root: {
                backgroundColor: "white"
            }
        }
    }
}));
theme = responsiveFontSizes(theme);

export default theme;
