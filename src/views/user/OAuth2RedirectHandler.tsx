import { Location } from "history";
import * as React from "react";
import { Redirect } from "react-router-dom";

interface Props {
    location: Location;
}

const OAuth2RedirectHandler: React.FC<Props> = ({ location }) => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") ?? "";
    const error = params.get("error") ?? "";

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
