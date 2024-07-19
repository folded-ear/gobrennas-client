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

const primary = {
    light: IS_BETA ? "#90caf9" : "#F99339",
    main: IS_BETA ? "#1976d2" : "#F57F17",
    dark: IS_BETA ? "#0d47a1" : "#B85600",
    contrastText: "#FFFDE7",
};

const theme_light: () => Theme = () =>
    createTheme({
        palette: {
            primary,
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
                ...primary,
                contrastText: "#000",
            },
            secondary: {
                main: "#151515",
                contrastText: "#ffffff",
            },
            background: {
                default: "#333333",
            },
            neutral: {
                light: grey[900],
                main: "#151515",
                dark: grey[300],
                contrastText: "#ffffff",
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
