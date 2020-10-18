import {
    AppBar,
    Box,
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
    PostAdd,
} from "@material-ui/icons";
import classnames from "classnames";
import { Container } from "flux/utils";
import React from "react";
import {
    Link,
    withRouter,
} from "react-router-dom";
import WindowStore from "../../data/WindowStore";
import Logo from "./Logo";

const styles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        height: theme.header.height
    },
    bar: {
        flexGrow: 1,
        minWidth: "195px"
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
    </IconButton>);
};

const BigNav = withStyles((theme) => ({
    root: {
        textTransform: "uppercase",
        minWidth: 72, // the default is 160
        marginRight: theme.spacing(2),
    },
}))((props) => <Tab {...props} />);

const AppHeader = ({authenticated, onLogout, location, windowSize}) => {
    const classes = styles();
    const mobile = windowSize.width < 768;
    const topLevelNavSeg = location.pathname.split("/")[1];
    const colorByHotness = val =>
        topLevelNavSeg  === val ? "inherit" : "default";

    const renderMobile = () => {
        return (
            <>
                <Logo
                    version={windowSize.width <= 550 ? "small" : null}
                    component={Link}
                    to="/library"
                />
                {authenticated && <Box className={classes.bar}>
                    <TinyNav location={location} navTo="library"><MenuBook/></TinyNav>
                    <TinyNav location={location} navTo="add"><PostAdd/></TinyNav>
                    <TinyNav location={location} navTo="plan"><EventNote/></TinyNav>
                    <TinyNav location={location} navTo="shop"><ListAlt/></TinyNav>
                </Box>}
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
                {authenticated && <Tabs
                    selectionFollowsFocus
                    className={classes.bar}
                    value={topLevelNavSeg}
                    textColor="inherit"
                    TabIndicatorProps={{className: classes.indicator}}
                >
                    <BigNav
                        icon={<MenuBook/>}
                        label="Library"
                        component={Link}
                        to="/library"
                        value="library"
                    />
                    <BigNav
                        icon={<PostAdd/>}
                        label="New Recipe"
                        component={Link}
                        to="/add"
                        value="add"
                    />
                    <BigNav
                        icon={<EventNote/>}
                        label="Plan"
                        component={Link}
                        to="/plan"
                        value="plan"
                    />
                    <BigNav
                        icon={<ListAlt/>}
                        label="Shop"
                        component={Link}
                        to="/shop"
                        value="shop"
                    />
                </Tabs>}
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
                    <Toolbar>
                        {mobile ? renderMobile() : renderDesktop()}
                        {authenticated && <IconButton
                            component={Link}
                            to="profile"
                            value="profile"
                            title="Profile"
                            color={colorByHotness("profile")}
                        >
                            <AccountCircle/>
                        </IconButton>}
                        {authenticated && <IconButton
                            onClick={onLogout}
                            title="Logout"
                            color={colorByHotness("__logout__")}
                        >
                            <ExitToApp/>
                        </IconButton>}
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        </>
    );
};

export default withRouter(Container.createFunctional(
    props => <AppHeader {...props} />,
    () => [
        WindowStore,
    ],
    (prevState, props) => ({
        ...props,
        windowSize: WindowStore.getSize(),
    }),
    { withProps: true }
));
