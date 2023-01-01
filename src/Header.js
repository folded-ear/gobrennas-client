import {
    AppBar,
    ListItemIcon,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    AccountCircle as ProfileIcon,
    EventNote as PlanIcon,
    ExitToApp as LogoutIcon,
    MeetingRoom as PantryIcon,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import {
    Link,
    useHistory,
    withRouter,
} from "react-router-dom";
import useIsDevMode from "data/useIsDevMode";
import { useLogoutHandler } from "./providers/Profile";
import Logo from "./views/common/Logo";
import { useIsMobile } from "./providers/IsMobile";
import TimersTab from "./features/Timers/components/HeaderTab";

const useStyles = makeStyles(theme => ({
    root: {
        height: theme.header.height,
        "& .MuiTab-root": {
            minWidth: 72,
            marginRight: theme.spacing(2),
            [theme.breakpoints.down("sm")]: {
                minWidth: 0,
                marginRight: 0,
            },
        },
    },
    grow: {
        flexGrow: 1,
    },
    bar: {
        minWidth: "195px",
        "& .MuiTabs-flexContainer": {
            alignItems: "center",
        },
    },
    indicator: {
        backgroundColor: "white",
        height: 4,
        bottom: 0,
        [theme.breakpoints.down("sm")]: {
            height: 2,
        },
    },
    profileTab: {
        "&.MuiTab-root": {
            minWidth: 0,
            marginRight: 0,
        },
    },
}));

function LinkTab(props) {
    return <Tab
        component={Link}
        {...props}
    />;
}

const Header = ({ authenticated, location }) => {
    const classes = useStyles();
    const isMobile = useIsMobile();
    const devMode = useIsDevMode();
    const topLevelNavSeg = location.pathname.split("/")[1];

    const history = useHistory();
    const handleProfile = e => {
        e.stopPropagation();
        history.push("/profile");
        handleMenuClose();
    };
    const doLogout = useLogoutHandler();
    const handleLogout = e => {
        e.preventDefault();
        e.stopPropagation();
        handleMenuClose();
        doLogout();
    };

    // this mess basically lifted as-is from https://v4.mui.com/components/app-bar/#app-bar-with-a-primary-search-field
    const [ anchorEl, setAnchorEl ] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event) =>
        setAnchorEl(event.currentTarget);
    const handleMenuClose = () =>
        setAnchorEl(null);
    const menuId = "profile-menu";
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                    <ProfileIcon />
                </ListItemIcon>
                <Typography noWrap>
                    Profile
                </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutIcon />
                </ListItemIcon>
                <Typography noWrap>
                    Logout
                </Typography>
            </MenuItem>
        </Menu>
    );

    return <>
        <AppBar
            position="sticky"
            className={classes.root}
        >
            <Toolbar>
                <Logo
                    version={isMobile ? "small" : null}
                    component={Link}
                    to="/library"
                />
                {authenticated && <Tabs
                    selectionFollowsFocus
                    className={`${classes.bar} ${classes.grow}`}
                    value={topLevelNavSeg}
                    textColor="inherit"
                    TabIndicatorProps={{ className: classes.indicator }}
                >
                    <LinkTab
                        icon={<LibraryIcon />}
                        label={isMobile ? null : "Library"}
                        to="/library"
                        value="library"
                    />
                    <LinkTab
                        icon={<PlanIcon />}
                        label={isMobile ? null : "Plan"}
                        to="/plan"
                        value="plan"
                    />
                    <LinkTab
                        icon={<ShopIcon />}
                        label={isMobile ? null : "Shop"}
                        to="/shop"
                        value="shop"
                    />
                    {devMode && <LinkTab
                        icon={<PantryIcon />}
                        label={isMobile ? null : "Pantry"}
                        to="/pantry"
                        value="pantry"
                    />}
                    <div className={classes.grow} />
                    <TimersTab
                        label={isMobile ? null : "Timers"}
                    />
                    <div className={classes.grow} />
                    <Tab
                        className={classes.profileTab}
                        component={"a"}
                        icon={<ProfileIcon />}
                        onClick={handleProfileMenuOpen}
                        value="profile"
                    />
                </Tabs>}
            </Toolbar>
        </AppBar>
        {renderMenu}
    </>;
};

Header.propTypes = {
    authenticated: PropTypes.bool,
    location: PropTypes.object.isRequired, // react-router BS
};

export default withRouter(Header);
