import Button from "@mui/material/Button";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { GOOGLE_AUTH_URL, SESSION_STORAGE_POST_LOGIN } from "@/constants";
import { setJsonItem } from "@/util/storage";
import { Box, Container, Paper, Typography } from "@mui/material";

type LoginProps = {
    authenticated: boolean;
    location: any;
};

class Login extends Component<LoginProps> {
    componentDidMount() {
        // If the OAuth2 login encounters an error, the user is redirected to the /login page with an error.
        // Here we display the error and then remove the error query parameter from the location.
        if (this.props.location.state && this.props.location.state.error) {
            // eslint-disable-next-line no-console
            console.log(this.props.location.state.error);
        }
    }

    render() {
        const { authenticated, location } = this.props;

        if (authenticated) {
            return (
                <Redirect
                    to={{
                        pathname: "/",
                        state: { from: this.props.location },
                    }}
                />
            );
        }

        if (
            location != null &&
            location.state != null &&
            location.state.from != null
        ) {
            setJsonItem(
                SESSION_STORAGE_POST_LOGIN,
                location.state.from,
                sessionStorage,
                (
                    k,
                    v, // omit Router's internal key value
                ) => (k === "key" ? undefined : v),
            );
        }
        return (
            <Container maxWidth={"sm"}>
                <Box m={2}>
                    <Paper elevation={3}>
                        <Box p={3}>
                            <Typography
                                variant={"h2"}
                                component={"h1"}
                                align={"center"}
                            >
                                Brenna&apos;s Food Software
                            </Typography>
                            <Box my={3} style={{ textAlign: "center" }}>
                                <Button
                                    color="primary"
                                    variant="outlined"
                                    href={GOOGLE_AUTH_URL}
                                >
                                    Login with Google
                                </Button>
                            </Box>
                            <Typography paragraph>
                                Brenna&apos;s Food Software is a recipe library,
                                meal planner, and digital shopping list. At the
                                store with your partner or kids? Split up,
                                without tearing the list in half. Preparing a
                                holiday meal? Organize the tasks so the day -
                                the prep at least - is stress-free.
                            </Typography>
                            <Typography paragraph>Happy cooking!</Typography>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        );
    }
}

export default Login;
