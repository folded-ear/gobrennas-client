import Divider from "@mui/material/Divider";
import React from "react";
import {
    useIsDeveloper,
    useLogoutHandler
} from "providers/Profile";
import PageBody from "../common/PageBody";
import User from "./User";
import { CookThis } from "features/UserProfile/components/CookThis";
import { Developer } from "features/UserProfile/components/Developer";
import { UserType } from "global/types/types";
import {
    Box,
    Button,
    Paper
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Pic = styled(Box)(({theme}) => ({
    padding: theme.spacing(1)
}));

const Info = styled(Box)({
    flex: 1
})

const ProfileDisplay = styled(Paper)(({theme}) => ({
    display: "flex",
    padding: theme.spacing(1)
}));

interface Props {
    currentUser: Pick<UserType, "imageUrl" | "name" | "email">
}

const Profile: React.FC<Props> = ({
                                      currentUser: user,
                                  }) => {
    const isDeveloper = useIsDeveloper();
    const doLogout = useLogoutHandler();

    const handleLogout = e => {
        e.preventDefault();
        e.stopPropagation();
        doLogout();
    };

    return <PageBody>
        <ProfileDisplay>
            <Pic>
                {user.imageUrl && <img
                    src={user.imageUrl}
                    alt={user.name || user.email || undefined}
                    title="Holy moley, you're attractive!"
                />}
            </Pic>
            <Info>
                <h2>{user.name}</h2>
                <p className="profile-email">{user.email}</p>
                <Button onClick={handleLogout} variant="outlined">Logout</Button>
            </Info>
        </ProfileDisplay>
        <Divider />
        <CookThis />
        <Divider />
        <div><User {...user} /></div>
        {isDeveloper && <Developer />}
    </PageBody>;
};

export default Profile;
