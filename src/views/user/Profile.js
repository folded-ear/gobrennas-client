import React, { Component } from 'react';

class Profile extends Component {
    render() {
        return (
            <div className="profile-container">
                <div className="container">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {this.props.currentUser.imageUrl && <img
                                src={this.props.currentUser.imageUrl}
                                alt={this.props.currentUser.name}
                                title="Holy moley, you're attractive!"
                            />
                            }
                        </div>
                        <div className="profile-name">
                           <h2>{this.props.currentUser.name}</h2>
                           <p className="profile-email">{this.props.currentUser.email}</p>
                        </div>
                    </div>
                </div>    
            </div>
        );
    }
}

export default Profile