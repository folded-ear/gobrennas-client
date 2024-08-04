import {
    createTheme,
    responsiveFontSizes,
    ThemeOptions,
} from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { grey } from "@mui/material/colors";
import { IS_BETA } from "./constants";
import { useMediaQuery } from "@mui/material";
import { useMemo } from "react";

declare module "@mui/material/styles" {
    interface Palette {
        neutral: Palette["primary"];
    }

    interface PaletteOptions {
        neutral?: PaletteOptions["primary"];
    }
}

declare module "@mui/material/AppBar" {
    interface AppBarPropsColorOverrides {
        neutral: true;
    }
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        neutral: true;
    }
}

declare module "@mui/material/ButtonGroup" {
    interface ButtonGroupPropsColorOverrides {
        neutral: true;
    }
}

declare module "@mui/material/Chip" {
    interface ChipPropsColorOverrides {
        neutral: true;
    }
}

declare module "@mui/material/IconButton" {
    interface IconButtonPropsColorOverrides {
        neutral: true;
    }
}

const baseTokens: ThemeOptions = {
    palette: {
        primary: {
            light: IS_BETA ? "#90caf9" : "#F99339",
            main: IS_BETA ? "#1976d2" : "#F57F17",
            dark: IS_BETA ? "#0d47a1" : "#B85600",
            contrastText: "#FFFDE7",
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
};

const lightTokens: ThemeOptions = {
    palette: {
        background: {
            default: "#f7f7f7",
        },
        neutral: {
            main: grey[200],
        },
    },
};

const darkTokens: ThemeOptions = {
    palette: {
        mode: "dark",
        text: { primary: "#f2f4f5" },
        action: {
            active: "#bfc1c3",
        },
        background: {
            default: "#1b1b1b",
            paper: "#2d2f31",
        },
        neutral: {
            main: "#313335",
        },
    },
};

export function useBfsTheme() {
    const preferDark = useMediaQuery("(prefers-color-scheme: dark)");
    return useMemo(() => {
        const theme = createTheme(
            deepmerge(baseTokens, preferDark ? darkTokens : lightTokens),
        );
        return responsiveFontSizes(
            createTheme(theme, {
                palette: {
                    neutral: theme.palette.augmentColor({
                        color: {
                            main: theme.palette.neutral.main,
                        },
                        name: "neutral",
                    }),
                },
            }),
        );
    }, [preferDark]);
}
