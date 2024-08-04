import React from "react";
import { useIsDeveloper, useLogoutHandler } from "@/providers/Profile";
import User from "./User";
import { CookThis } from "@/features/UserProfile/components/CookThis";
import { Developer } from "@/features/UserProfile/components/Developer";
import type { UserType } from "@/global/types/identity";
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import { LogoutIcon } from "../common/icons";

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
            <Stack gap={2}>
                <ProfileDisplay>
                    <Grid container gap={2}>
                        <Box>
                            {user.imageUrl && (
                                <Avatar
                                    src={user.imageUrl}
                                    sx={{ height: 96, width: 96 }}
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
                            <Button
                                onClick={handleLogout}
                                variant="outlined"
                                startIcon={<LogoutIcon />}
                            >
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
                {isDeveloper && (
                    <ProfileDisplay>
                        <Developer />
                    </ProfileDisplay>
                )}
            </Stack>
        </Container>
    );
};

export default Profile;
