import {
    Button,
    Divider,
    Icon,
    Switch,
} from "antd";
import { Container } from "flux/utils";
import React, { Component } from "react";
import {
    API_IS_SECURE,
    APP_BASE_URL,
} from "../../constants";
import Dispatcher from "../../data/dispatcher";
import PreferencesStore from "../../data/PreferencesStore";
import UserActions from "../../data/UserActions";
import UserStore from "../../data/UserStore";
import User from "./User";

class Profile extends Component {

    constructor(...args) {
        super(...args);
        this.onDevModeChange = this.onDevModeChange.bind(this);
    }

    onDevModeChange(enabled) {
        Dispatcher.dispatch({
            type: UserActions.SET_DEV_MODE,
            enabled,
        });
    }

    render() {
        const {
            currentUser: user,
            token,
            isDeveloper,
            isDevMode,
        } = this.props;
        return <>
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
                    type={process.env.NODE_ENV === "production" ? "primary" : "danger"}
                >
                    {process.env.NODE_ENV === "production"
                        ? "Cook This!"
                        : "DEV Cook This!"}
                </Button>
            </p>
            {!API_IS_SECURE && <p>
                Since <Icon type="unlock" /> you hate SSL <Icon type="unlock" />,
                you&apos;ll have to do this each time you log into Foodinger
                (deleting the old one first). Sorry, man.
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
                    checkedChildren="ON"
                    unCheckedChildren="off"
                />
            </React.Fragment>}
        </>;
    }
}

export default Container.createFunctional(
    props => <Profile {...props} />,
    () => [
        UserStore,
        PreferencesStore,
    ],
    (prevState, props) => ({
        ...props,
        token: UserStore.getToken(),
        isDeveloper: UserStore.isDeveloper(),
        isDevMode: PreferencesStore.isDevMode(),
    }),
    {withProps: true},
);
