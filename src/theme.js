import {createMuiTheme, responsiveFontSizes} from "@material-ui/core/styles";

let theme = createMuiTheme({
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
        }
    },
    typography: {
        h3: {
            fontFamily: "News Cycle",
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
    }
});
theme = responsiveFontSizes(theme);

export default theme;
