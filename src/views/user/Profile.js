import Divider from "@material-ui/core/Divider";
import PropTypes from "prop-types";
import React from "react";
import { useIsDeveloper } from "providers/Profile";
import PageBody from "../common/PageBody";
import User from "./User";
import { CookThis } from "features/UserProfile/components/CookThis";
import { Developer } from "features/UserProfile/components/Developer";

const Profile = ({
                     currentUser: user,
                 }) => {
    const isDeveloper = useIsDeveloper();

    return <PageBody>
        {user.imageUrl && <img
            src={user.imageUrl}
            alt={user.name}
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

Profile.propTypes = {
    currentUser: PropTypes.shape({
        imageUrl: PropTypes.string,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
    }).isRequired,
};

export default Profile;
