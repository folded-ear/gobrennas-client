import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class NotFound extends Component {
    render() {
        return (
            <div className="page-not-found">
                <h1 className="title">
                    404
                </h1>
                <div className="desc">
                    Sorry, man, that page isn&apos;t a thing.
                </div>
                <Link to="/"><button className="go-back-btn btn btn-primary" type="button">Go Back</button></Link>
            </div>
        );
    }
}

export default NotFound;