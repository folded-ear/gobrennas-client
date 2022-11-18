import {
    createTheme,
    responsiveFontSizes,
} from "@material-ui/core/styles";

let theme = createTheme({
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
        light: {
            main: "#fff3e0",
        },
        dark: {
            main: "#333333"
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
    header: {
        height: "75px"
    },
    overrides: {
        MuiTextField: {
            root: {
                backgroundColor: "white"
            }
        }
    }
});
theme = responsiveFontSizes(theme);

export default theme;
