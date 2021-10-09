import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import { LockOpen } from "@material-ui/icons";
import preval from "preval.macro";
import PropTypes from "prop-types";
import qs from "qs";
import React from "react";
import {
    API_IS_SECURE,
    APP_BASE_URL,
} from "../../constants";
import Dispatcher from "../../data/dispatcher";
import useIsDevMode from "../../data/useIsDevMode";
import UserActions from "../../data/UserActions";
import useWindowSize from "../../data/useWindowSize";
import { useAuthToken } from "../../providers/AuthToken";
import { useIsDeveloper } from "../../providers/Profile";
import PageBody from "../common/PageBody";
import User from "./User";

const dateTimeStamp = preval`module.exports = new Date().toLocaleString();`;

const DevMode = () => {
    const windowSize = useWindowSize();
    return <React.Fragment>
        <p>
            Window: {windowSize.width}x{windowSize.height}
        </p>
        <p>
            Build: {dateTimeStamp}
        </p>
    </React.Fragment>;
};

const Developer = () => {
    const isDevMode = useIsDevMode();

    const handleDevModeChange = (e) => {
        Dispatcher.dispatch({
            type: UserActions.SET_DEV_MODE,
            enabled: e.target.checked,
        });
    };

    return <React.Fragment>
        <Divider />
        Dev Mode:
        {" "}
        <Switch
            checked={isDevMode}
            onChange={handleDevModeChange}
            color="primary"
        />
        {isDevMode && <DevMode />}
    </React.Fragment>;
};

const Profile = ({
                     currentUser: user,
                 }) => {
    const token = useAuthToken();
    const isDeveloper = useIsDeveloper();

    const cookThisRef = React.useRef();
    React.useEffect(() => {
        cookThisRef.current.href = `javascript:s=document.createElement('script');s.src='${APP_BASE_URL}/import_bookmarklet.js?${qs.stringify(
            {
                token,
            })}&_='+Date.now();s.id='foodinger-import-bookmarklet';void(document.body.appendChild(s));`;
    }, [cookThisRef.current]);

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
        <h2>Cook This!</h2>
        <p>&quot;Cook This!&quot; helps import recipes into Foodinger. Drag
            it to your bookmarks bar, and then click it to when viewing a
            recipe online.
        </p>
        <p style={{textAlign: "center"}}>
            <Button
                ref={cookThisRef}
                href="#"
                variant={process.env.NODE_ENV === "production" ? "contained" : "outlined"}
                color="primary"
            >
                {process.env.NODE_ENV === "production"
                    ? "Cook This!"
                    : "DEV Cook This!"}
            </Button>
        </p>
        {!API_IS_SECURE && <p>
            <LockOpen />
            Since you hate SSL, you&apos;ll have to do this each time you log
            into Foodinger (deleting the old one first). Sorry, man.
            <LockOpen />
        </p>}
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
