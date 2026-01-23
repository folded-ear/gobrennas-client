import { useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import {
    createTheme,
    responsiveFontSizes,
    Theme,
    ThemeOptions,
} from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { useMemo } from "react";

declare module "@mui/styles/defaultTheme" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface DefaultTheme extends Theme {}
}

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
            main: import.meta.env.VITE_THEME_COLOR,
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
    zIndex: {
        // These place the FAB above drawer
        fab: 1250,
        speedDial: 1250,
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
                components: {
                    MuiIconButton: {
                        defaultProps: {
                            size: "small",
                        },
                        styleOverrides: {
                            root: {
                                borderRadius: theme.shape.borderRadius,
                                fontSize: "1em",
                                color: "currentcolor",
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            textAlignLeft: {
                                // default is 10/90
                                "&::before": {
                                    minWidth: "0.5rem",
                                    maxWidth: "0.5rem",
                                    marginRight: theme.spacing(-1.2),
                                },
                                "&::after": { width: "95%" },
                            },
                        },
                    },
                },
            }),
        );
    }, [preferDark]);
}
