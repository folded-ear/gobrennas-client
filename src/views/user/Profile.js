import React, { Component } from 'react';
import { Divider } from "antd";
import User from "./User";

class Profile extends Component {
    render() {
        const {
            currentUser: user,
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
                        <div><User {...user} /></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Profile;
