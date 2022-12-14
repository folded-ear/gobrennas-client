import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";

function getUrlParameter(name, location) {
    name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    
    var results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const OAuth2RedirectHandler = ({location}) => {
    const token = getUrlParameter("token", location);
    const error = getUrlParameter("error", location);

    if (token) {
        return <Redirect to={{
            pathname: "/",
            state: {from: location}
        }}/>;
    } else {
        return <Redirect to={{
            pathname: "/login",
            state: {
                from: location,
                error: error,
            },
        }} />;
    }
};

OAuth2RedirectHandler.propTypes = {
    location: PropTypes.object.isRequired,
};

export default OAuth2RedirectHandler;
