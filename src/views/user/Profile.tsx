import React from "react";
import { useIsDeveloper, useLogoutHandler } from "providers/Profile";
import User from "./User";
import { CookThis } from "features/UserProfile/components/CookThis";
import { Developer } from "features/UserProfile/components/Developer";
import type { UserType } from "global/types/identity";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Info = styled(Box)({
    flex: 1,
});

const ProfileDisplay = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

interface Props {
    currentUser: Pick<UserType, "imageUrl" | "name" | "email">;
}

const Profile: React.FC<Props> = ({ currentUser: user }) => {
    const isDeveloper = useIsDeveloper();
    const doLogout = useLogoutHandler();

    const handleLogout = (e) => {
        e.preventDefault();
        e.stopPropagation();
        doLogout();
    };

    return (
        <Container>
            <Grid container gap={2} direction={"column"}>
                <ProfileDisplay>
                    <Grid container gap={1}>
                        <Box>
                            {user.imageUrl && (
                                <img
                                    src={user.imageUrl}
                                    alt={user.name || user.email || undefined}
                                    title="Holy moley, you're attractive!"
                                />
                            )}
                        </Box>
                        <Info>
                            <Typography variant={"h2"}>{user.name}</Typography>
                            <Typography>{user.email}</Typography>
                        </Info>
                        <div>
                            <Button onClick={handleLogout} variant="outlined">
                                Logout
                            </Button>
                        </div>
                    </Grid>
                </ProfileDisplay>
                <ProfileDisplay>
                    <CookThis />
                </ProfileDisplay>
                <ProfileDisplay>
                    <User {...user} />
                </ProfileDisplay>
                <ProfileDisplay>{isDeveloper && <Developer />}</ProfileDisplay>
            </Grid>
        </Container>
    );
};

export default Profile;
