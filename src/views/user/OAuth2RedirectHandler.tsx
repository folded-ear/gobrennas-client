import { Location } from "history";
import React from "react";
import { Redirect } from "react-router-dom";

function getUrlParameter(name, location) {
    name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");

    const results = regex.exec(location.search);
    return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
}

interface Props {
    location: Location;
}

const OAuth2RedirectHandler: React.FC<Props> = ({ location }) => {
    const token = getUrlParameter("token", location);
    const error = getUrlParameter("error", location);

    if (token) {
        return (
            <Redirect
                to={{
                    pathname: "/",
                    state: { from: location },
                }}
            />
        );
    } else {
        return (
            <Redirect
                to={{
                    pathname: "/login",
                    state: {
                        from: location,
                        error,
                    },
                }}
            />
        );
    }
};

export default OAuth2RedirectHandler;
