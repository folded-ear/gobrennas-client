import {
    createTheme,
    responsiveFontSizes,
    Theme,
    ThemeOptions,
} from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { IS_BETA } from "./constants";
import { useMediaQuery } from "@mui/material";
import useIsDevMode from "./data/useIsDevMode";
import { useMemo } from "react";

declare module "@mui/material/styles" {
    interface Palette {
        neutral: Palette["primary"];
    }

    interface PaletteOptions {
        neutral?: PaletteOptions["primary"];
    }
}

const typography: ThemeOptions["typography"] = {
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
};

const theme_light: () => Theme = () =>
    createTheme({
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
        typography,
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

const theme_dark: () => Theme = () =>
    createTheme({
        palette: {
            mode: "dark",
            primary: {
                light: IS_BETA ? "#1d2831" : "#36200c",
                main: IS_BETA ? "#0b3864" : "#6b3708",
                dark: IS_BETA ? "#092f6b" : "#673101",
                contrastText: "#070606",
            },
            secondary: {
                main: "#151515",
                contrastText: "#ffffff",
            },
            background: {
                default: "#333333",
            },
            neutral: {
                light: grey[700],
                main: grey[200],
                dark: grey[100],
                contrastText: grey[100],
            },
        },
        typography,
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        backgroundColor: "black",
                    },
                },
            },
        },
    });

export function useBfsTheme() {
    const devMode = useIsDevMode();
    const preferDark = useMediaQuery("(prefers-color-scheme: dark)");
    return useMemo(
        () =>
            responsiveFontSizes(
                devMode && preferDark ? theme_dark() : theme_light(),
            ),
        [devMode, preferDark],
    );
}
