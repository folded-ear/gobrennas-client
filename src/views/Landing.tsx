import PropTypes from "prop-types";
import React from "react";
import { Redirect } from "react-router-dom";
import { SESSION_STORAGE_POST_LOGIN } from "../constants/index";
import { getJsonItem } from "util/storage";

const Landing = ({authenticated}) => {
    let dest = getJsonItem(SESSION_STORAGE_POST_LOGIN, sessionStorage);
    if (authenticated) {
        sessionStorage.removeItem(SESSION_STORAGE_POST_LOGIN);
    }
    return <Redirect to={{
        pathname: "/library",
        ...dest,
    }} />;
};

Landing.propTypes = {
    authenticated: PropTypes.bool.isRequired,
};

export default Landing;
