import React from "react";
import {Link, withRouter} from "react-router-dom";
import {
    AppBar,
    Box,
    IconButton,
    Tabs,
    Tab,
    Toolbar,
    useMediaQuery
} from "@material-ui/core";
import {
    AccountCircle,
    EventNote,
    ExitToApp,
    MenuBook,
    PostAdd
} from "@material-ui/icons";
import {
    makeStyles,
    useTheme
} from "@material-ui/core/styles";
import Logo from "./Logo";

const styles = makeStyles(() => ({
    root: {
        flexGrow: 1,
        height: 75
    },
    bar: {
        flexGrow: 1
    },
    indicator: {
        backgroundColor: "white",
        height: "4px",
        bottom: 0
    },
}));

const AppHeader = ({authenticated, onLogout, location}) => {
    const classes = styles();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("sm"));

    const renderMobile = () => {
        return (
            <>
                <Logo version="small"/>
                <Box className={classes.bar}>
                    <IconButton component={Link} to="library" value="library" color="inherit"><MenuBook/></IconButton>
                    <IconButton component={Link} to="add" value="add" color="inherit"><PostAdd/></IconButton>
                    <IconButton component={Link} to="tasks" value="tasks" color="inherit"><EventNote/></IconButton>
                </Box>
            </>
        );
    };

    const renderDesktop = () => {
        return (
            <>
                <Logo/>
                <Tabs
                    selectionFollowsFocus
                    className={classes.bar}
                    value={location.pathname}
                    textColor="white"
                    TabIndicatorProps={{className: classes.indicator}}
                >
                    <Tab
                        icon={<MenuBook/>}
                        label="Library"
                        component={Link}
                        to="library"
                        color="inherit"
                        value="/library"
                    />
                    <Tab
                        icon={<PostAdd/>}
                        label="New Recipe"
                        component={Link}
                        to="add"
                        value="/add"
                    />
                    <Tab
                        icon={<EventNote/>}
                        label="Tasks"
                        component={Link}
                        to="tasks"
                        value="/tasks"
                    />
                </Tabs>
            </>
        );
    };

    return (
        <>
            <React.Fragment>
                <AppBar
                    position="sticky"
                    className={classes.root}
                >
                    {
                        authenticated ?
                            <Toolbar>
                                {mobile ? renderMobile() : renderDesktop()}
                                <IconButton
                                    component={Link}
                                    to="profile"
                                    value="profile"
                                    title="Profile"
                                    color="inherit"
                                >
                                    <AccountCircle/>
                                </IconButton>
                                <IconButton
                                    onClick={onLogout}
                                    title="Logout"
                                    color="inherit"
                                >
                                    <ExitToApp/>
                                </IconButton>
                            </Toolbar>
                            :
                            <div>&nbsp;</div>
                    }
                </AppBar>
            </React.Fragment>
        </>
    );
};

export default withRouter(AppHeader);