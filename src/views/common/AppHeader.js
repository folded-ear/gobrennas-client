import React from "react";
import {Link, withRouter} from "react-router-dom";
import {
    AppBar,
    Box,
    IconButton,
    Tab,
    Toolbar
} from "@material-ui/core"
import {
    AccountCircle,
    EventNote,
    ExitToApp,
    MenuBook,
    PostAdd
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles"
import clsx from "clsx";
import Logo from "./Logo";

const styles = makeStyles(theme => ({
    root: {
        flexGrow: 1
    },
    bar: {
        flexGrow: 1
    }
}));

const AppHeader = ({authenticated, onLogout}) => {
    const classes = styles();

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
                                <Logo />
                                <Box className={classes.bar}>
                                <Tab icon={<MenuBook />} label="Library" component={Link} to="library" />
                                <Tab icon={<PostAdd />} label="Add Recipe" component={Link} to="add" />
                                <Tab icon={<EventNote />} label="Tasks" component={Link} to="tasks" />
                                </Box>
                                <IconButton component={Link} to="profile" value="profile" title="Profile"><AccountCircle /></IconButton>
                                <IconButton onClick={onLogout} title="Logout"><ExitToApp /></IconButton>
                            </Toolbar>
                            :
                            <div>&nbsp;</div>
                    }
                </AppBar>
            </React.Fragment>
        </>
    )
}

export default withRouter(AppHeader)