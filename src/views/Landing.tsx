import React from "react";
import { Redirect } from "react-router-dom";
import { SESSION_STORAGE_POST_LOGIN } from "@/constants";
import { getJsonItem } from "@/util/storage";

interface Props {
    authenticated: boolean;
}

const Landing: React.FC<Props> = ({ authenticated }) => {
    const dest = getJsonItem(SESSION_STORAGE_POST_LOGIN, sessionStorage);
    if (authenticated) {
        sessionStorage.removeItem(SESSION_STORAGE_POST_LOGIN);
    }
    return (
        <Redirect
            to={{
                pathname: "/library",
                ...dest,
            }}
        />
    );
};

export default Landing;
