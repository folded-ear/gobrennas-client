import { createTheme, responsiveFontSizes, Theme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { IS_BETA } from "./constants";

declare module "@mui/material/styles" {
    interface Palette {
        neutral: Palette["primary"];
    }

    interface PaletteOptions {
        neutral?: PaletteOptions["primary"];
    }
}

let theme: Theme = createTheme({
    palette: {
        primary: {
            light: IS_BETA ? "#90caf9" : "#F99339",
            main: IS_BETA ? "#1976d2" : "#F57F17",
            dark: IS_BETA ? "#0d47a1" : "#B85600",
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
            default: "#f7f7f7",
        },
        neutral: {
            light: grey[100],
            main: grey[200],
            dark: grey[700],
            contrastText: grey[900],
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
            fontSize: "2.5rem",
        },
        h3: {
            fontFamily: "'Encode Sans', sans-serif",
            fontSize: "2rem",
        },
        h5: {
            fontFamily: "News Cycle",
            fontWeight: 600,
            fontSize: "1.1rem",
            textTransform: "uppercase",
            marginBottom: ".5em",
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    backgroundColor: "white",
                },
            },
        },
    },
});
theme = responsiveFontSizes(theme);

export default theme;
