import Divider from "@mui/material/Divider";
import React from "react";
import { useIsDeveloper } from "providers/Profile";
import PageBody from "../common/PageBody";
import User from "./User";
import { CookThis } from "features/UserProfile/components/CookThis";
import { Developer } from "features/UserProfile/components/Developer";
import { UserType } from "../../global/types/types";

interface Props {
    currentUser: Pick<UserType, "imageUrl" | "name" | "email">
}

const Profile: React.FC<Props> = ({
                                      currentUser: user,
                                  }) => {
    const isDeveloper = useIsDeveloper();

    return <PageBody>
        {user.imageUrl && <img
            src={user.imageUrl}
            alt={user.name || user.email || undefined}
            title="Holy moley, you're attractive!"
        />}
        <div className="profile-name">
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
        </div>
        <Divider />
        <CookThis />
        <Divider />
        <div><User {...user} /></div>
        {isDeveloper && <Developer />}
    </PageBody>;
};

export default Profile;
