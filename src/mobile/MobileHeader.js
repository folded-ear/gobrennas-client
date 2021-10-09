import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    AccountCircle,
    EventNote,
    ExitToApp,
    ListAlt,
    MenuBook,
} from "@material-ui/icons";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import {
    Link,
    withRouter,
} from "react-router-dom";
import { useLogoutHandler } from "../providers/Profile";
import theme from "../theme";
import Logo from "../views/common/Logo";

const styles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        height: theme.header.height,
    },
    bar: {
        flexGrow: 1,
        minWidth: "195px",
    },
    icons: {
        opacity: 0.6,
        borderBottom: "3px solid transparent",
    },
    active: {
        borderRadius: 0,
        borderBottom: "3px solid white",
        opacity: 1,
    },
}));

const TinyNav = ({children, navTo, location}) => {
    const classes = styles();
    const activeNavTo = "/" + location.pathname.split("/")[1];
    return (<IconButton
        className={classnames(
            [classes.icons],
            {[classes.active]: activeNavTo === navTo},
        )}
        component={Link}
        to={navTo}
        value={navTo}
        color="inherit">
        {children}
    </IconButton>);
};

TinyNav.propTypes = {
    children: PropTypes.node,
    navTo: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired, // react-router BS
};

const MobileHeader = ({authenticated, location}) => {
    const smallLogo = useMediaQuery(theme.breakpoints.down("xs"));
    const classes = styles();
    const topLevelNavSeg = location.pathname.split("/")[1];
    const colorByHotness = val =>
        topLevelNavSeg === val ? "inherit" : "default";

    const handleLogout = useLogoutHandler();

    return <AppBar
        position="sticky"
        className={classes.root}
    >
        <Toolbar>
            <Logo
                version={smallLogo ? "small" : null}
                component={Link}
                to="/library"
            />
            {authenticated && <Box className={classes.bar}>
                <TinyNav location={location} navTo="/library">
                    <MenuBook />
                </TinyNav>
                <TinyNav location={location} navTo="/plan">
                    <EventNote />
                </TinyNav>
                <TinyNav location={location} navTo="/shop">
                    <ListAlt />
                </TinyNav>
            </Box>}
            {authenticated && <IconButton
                component={Link}
                to="/profile"
                value="profile"
                title="Profile"
                color={colorByHotness("profile")}
            >
                <AccountCircle />
            </IconButton>}
            {authenticated && <IconButton
                onClick={handleLogout}
                title="Logout"
                color={colorByHotness("__logout__")}
            >
                <ExitToApp />
            </IconButton>}
        </Toolbar>
    </AppBar>;
};

MobileHeader.propTypes = {
    authenticated: PropTypes.bool,
    location: PropTypes.object.isRequired, // react-router BS
};

export default withRouter(MobileHeader);
