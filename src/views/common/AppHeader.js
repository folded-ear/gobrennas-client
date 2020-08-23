import React from "react"
import {Link, withRouter} from "react-router-dom"
import {
    AppBar,
    Box,
    IconButton,
    Tab,
    Toolbar,
    useMediaQuery
} from "@material-ui/core"
import {
    AccountCircle,
    EventNote,
    ExitToApp,
    MenuBook,
    PostAdd
} from "@material-ui/icons"
import {
    makeStyles,
    useTheme
} from "@material-ui/core/styles"
import Logo from "./Logo"

const styles = makeStyles(theme => ({
    root: {
        flexGrow: 1
    },
    bar: {
        flexGrow: 1
    }
}))

const AppHeader = ({authenticated, onLogout}) => {
    const classes = styles()
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'))

    const renderMobile = () => {
        return (
            <Box className={classes.bar}>
                <IconButton component={Link} to="library" value="library"><MenuBook/></IconButton>
                <IconButton component={Link} to="add" value="add recipe"><PostAdd/></IconButton>
                <IconButton component={Link} to="tasks" value="tasks"><EventNote/></IconButton>
            </Box>
        )
    }

    const renderDesktop = () => {
        return (
            <>
                <Logo/>
                <Box className={classes.bar}>
                    <Tab icon={<MenuBook/>} label="Library" component={Link} to="library"/>
                    <Tab icon={<PostAdd/>} label="New" component={Link} to="add"/>
                    <Tab icon={<EventNote/>} label="Tasks" component={Link} to="tasks"/>
                </Box>
            </>
        )
    }

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
                                    title="Profile">
                                    <AccountCircle/>
                                </IconButton>
                                <IconButton
                                    onClick={onLogout}
                                    title="Logout">
                                    <ExitToApp/>
                                </IconButton>
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