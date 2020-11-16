import { Container as Content } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import { LockOpen } from "@material-ui/icons";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    API_IS_SECURE,
    APP_BASE_URL,
} from "../../constants";
import Dispatcher from "../../data/dispatcher";
import PreferencesStore from "../../data/PreferencesStore";
import UserActions from "../../data/UserActions";
import UserStore from "../../data/UserStore";
import WindowStore from "../../data/WindowStore";
import User from "./User";

class Profile extends Component {

    constructor(...args) {
        super(...args);
        this.onDevModeChange = this.onDevModeChange.bind(this);
    }

    onDevModeChange(e) {
        Dispatcher.dispatch({
            type: UserActions.SET_DEV_MODE,
            enabled: e.target.checked,
        });
    }

    render() {
        const {
            currentUser: user,
            token,
            isDeveloper,
            isDevMode,
            windowSize,
        } = this.props;
        return <Content>
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
                    href={`javascript:var s=document.createElement('script');s.src='${APP_BASE_URL}/import_bookmarklet.js?token=${encodeURIComponent(token)}&_='+Date.now();s.id='foodinger-import-bookmarklet';document.body.appendChild(s);`}
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
                Since you hate SSL, you&apos;ll have to do this each time you log into Foodinger (deleting the old one first). Sorry, man.
                <LockOpen />
            </p>}
            <Divider />
            <div><User {...user} /></div>
            {isDeveloper && <React.Fragment>
                <Divider />
                Dev Mode:
                {" "}
                <Switch
                    checked={isDevMode}
                    onChange={this.onDevModeChange}
                    color="primary"
                />
                <br />
                Window: {windowSize.width}x{windowSize.height}
            </React.Fragment>}
        </Content>;
    }
}

Profile.propTypes = {
    currentUser: PropTypes.shape({
        imageUrl: PropTypes.string,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
    }).isRequired,
    token: PropTypes.string.isRequired,
    isDeveloper: PropTypes.bool,
    isDevMode: PropTypes.bool,
    windowSize: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    }).isRequired,
};

export default Container.createFunctional(
    props => <Profile {...props} />,
    () => [
        UserStore,
        PreferencesStore,
        WindowStore,
    ],
    (prevState, props) => ({
        ...props,
        token: UserStore.getToken(),
        isDeveloper: UserStore.isDeveloper(),
        isDevMode: PreferencesStore.isDevMode(),
        windowSize: WindowStore.getSize(),
    }),
    {withProps: true},
);
