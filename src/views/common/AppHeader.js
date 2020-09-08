import {
    AppBar,
    Box,
    IconButton,
    Tab,
    Tabs,
    Toolbar,
    useMediaQuery,
} from "@material-ui/core";
import {
    makeStyles,
    useTheme,
} from "@material-ui/core/styles";
import {
    AccountCircle,
    EventNote,
    ExitToApp,
    ListAlt,
    MenuBook,
    PostAdd,
} from "@material-ui/icons";
import React from "react";
import {
    Link,
    withRouter,
} from "react-router-dom";
import classnames from 'classnames';
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
    icons: {
        opacity: 0.6,
        borderBottom: "4px solid transparent"
    },
    active: {
        borderRadius: 0,
        borderBottom: "4px solid white",
        opacity: 1
    }
}));

const TinyNav = ({children, navTo, location}) => {
    const classes = styles();
    const topLevelNavSeg = location.pathname.split("/")[1];
    return (<IconButton
        className={classnames([classes.icons],{[classes.active]: topLevelNavSeg === navTo})}
        component={Link}
        to={`/${navTo}`}
        value={navTo}
        color="inherit">
        {children}
    </IconButton>)
}

const AppHeader = ({authenticated, onLogout, location}) => {
    const classes = styles();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("sm"));
    const topLevelNavSeg = location.pathname.split("/")[1];
    const colorByHotness = val =>
        topLevelNavSeg  === val ? "inherit" : "default";

    const renderMobile = () => {
        return (
            <>
                <Logo
                    version="small"
                    component={Link}
                    to="/library"
                />
                <Box className={classes.bar}>
                    <TinyNav location={location} navTo="library"><MenuBook/></TinyNav>
                    <TinyNav location={location} navTo="add"><PostAdd/></TinyNav>
                    <TinyNav location={location} navTo="plan"><EventNote/></TinyNav>
                    <TinyNav location={location} navTo="shop"><ListAlt/></TinyNav>
                </Box>
            </>
        );
    };

    const renderDesktop = () => {
        return (
            <>
                <Logo
                    component={Link}
                    to="/library"
                />
                <Tabs
                    selectionFollowsFocus
                    className={classes.bar}
                    value={topLevelNavSeg}
                    textColor="inherit"
                    TabIndicatorProps={{className: classes.indicator}}
                >
                    <Tab
                        icon={<MenuBook/>}
                        label="Library"
                        component={Link}
                        to="/library"
                        value="library"
                    />
                    <Tab
                        icon={<PostAdd/>}
                        label="New Recipe"
                        component={Link}
                        to="/add"
                        value="add"
                    />
                    <Tab
                        icon={<EventNote/>}
                        label="Plan"
                        component={Link}
                        to="/plan"
                        value="plan"
                    />
                    <Tab
                        icon={<ListAlt/>}
                        label="Shop"
                        component={Link}
                        to="/shop"
                        value="shop"
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
                                    color={colorByHotness("profile")}
                                >
                                    <AccountCircle/>
                                </IconButton>
                                <IconButton
                                    onClick={onLogout}
                                    title="Logout"
                                    color={colorByHotness("__logout__")}
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
