import {
    createMuiTheme,
    responsiveFontSizes
} from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';

let theme = createMuiTheme({
    palette: {
        primary: {
            light: '#f9683a',
            main: '#bf360c',
            dark: '#870000',
            contrastText: '#fff',
        },
        secondary: {
            light: '#d3b8ae',
            main: '#a1887f',
            dark: '#725b53',
            contrastText: '#000',
        },
        light: {
            main: '#fff3e0',
        },
        dark: {
            main: '#333333'
        }
    },
});
theme = responsiveFontSizes(theme);

export default theme;