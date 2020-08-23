import {
    Divider,
    Switch,
} from "antd";
import { Container } from "flux/utils";
import React, { Component } from "react";
import { APP_BASE_URL } from "../../constants";
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
        return (
            <div className="profile-container">
                <div className="container">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {user.imageUrl && <img
                                src={user.imageUrl}
                                alt={user.name}
                                title="Holy moley, you're attractive!"
                            />
                            }
                        </div>
                        <div className="profile-name">
                            <h2>{user.name}</h2>
                            <p className="profile-email">{user.email}</p>
                        </div>
                        <Divider />
                        <h2>Import Bookmarklet</h2>
                        Drag to this link to your bookmarks bar, and then while viewing a recipe online, click it to
                        launch the import helper. Note that for the moment you have to do this each time you log
                        into Foodinger (deleting the old one first). Sorry, man.
                        <div style={{textAlign: "center"}}>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a href={`javascript:var s=document.createElement('script');s.src='${APP_BASE_URL}/import_bookmarklet.js?token=${encodeURIComponent(token)}&_='+Date.now();s.id='foodinger-import-bookmarklet';document.body.appendChild(s);`}>Import to Foodinger</a>
                        </div>
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
                    </div>
                </div>
            </div>
        );
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
