import React, { Component } from 'react'
import { Container } from "flux/utils"
import Dispatcher from "../../data/dispatcher"
import {
    Divider,
    Switch,
} from "antd"
import User from "./User"
import UserStore from "../../data/UserStore"
import PreferencesStore from "../../data/PreferencesStore"
import UserActions from "../../data/UserActions"

class Profile extends Component {

    constructor(...args) {
        super(...args)
        this.onDevModeChange = this.onDevModeChange.bind(this)
    }

    onDevModeChange(enabled) {
        Dispatcher.dispatch({
            type: UserActions.SET_DEV_MODE,
            enabled,
        })
    }

    render() {
        const {
            currentUser: user,
            isDeveloper,
            isDevMode,
        } = this.props
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
        )
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
        isDeveloper: UserStore.isDeveloper(),
        isDevMode: PreferencesStore.isDevMode(),
    }),
    {withProps: true},
)
