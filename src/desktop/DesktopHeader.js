import {
    AppBar,
    IconButton,
    Tab,
    Tabs,
    Toolbar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import {
    AccountCircle,
    EventNote,
    ExitToApp,
    ListAlt,
    MenuBook,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import {
    Link,
    withRouter,
} from "react-router-dom";
import { useLogoutHandler } from "../providers/Profile";
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
    indicator: {
        backgroundColor: "white",
        height: "4px",
        bottom: 0
    },
}));

const BigNav = withStyles((theme) => ({
    root: {
        textTransform: "uppercase",
        minWidth: 72, // the default is 160
        marginRight: theme.spacing(2),
    },
}))((props) => <Tab {...props} />);

const DesktopHeader = ({authenticated, location}) => {
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
                component={Link}
                to="/library"
            />
            {authenticated && <Tabs
                selectionFollowsFocus
                className={classes.bar}
                value={topLevelNavSeg}
                textColor="inherit"
                TabIndicatorProps={{className: classes.indicator}}
            >
                <BigNav
                    icon={<MenuBook />}
                    label="Library"
                    component={Link}
                    to="/library"
                    value="library"
                />
                <BigNav
                    icon={<EventNote />}
                    label="Plan"
                    component={Link}
                    to="/plan"
                    value="plan"
                />
                <BigNav
                    icon={<ListAlt />}
                    label="Shop"
                    component={Link}
                    to="/shop"
                    value="shop"
                />
            </Tabs>}
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

DesktopHeader.propTypes = {
    authenticated: PropTypes.bool,
    location: PropTypes.object.isRequired, // react-router BS
};

export default withRouter(DesktopHeader);
